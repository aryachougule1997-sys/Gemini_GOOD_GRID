import { Pool } from 'pg';
import { 
    TaskSubmission, 
    Task, 
    FileAttachment, 
    AIVerificationResult,
    RewardDistribution,
    SubmissionStatus 
} from '../../../shared/types';
import { GeminiVerificationService } from './geminiVerificationService';
import { RewardService } from './rewardService';
import { NotificationService } from './notificationService';

export class TaskSubmissionService {
    private db: Pool;
    private geminiService: GeminiVerificationService;
    private rewardService: RewardService;
    private notificationService: NotificationService;

    constructor(db: Pool) {
        this.db = db;
        this.geminiService = new GeminiVerificationService();
        this.rewardService = new RewardService(db);
        this.notificationService = new NotificationService();
    }

    /**
     * Submit a task completion
     */
    async submitTaskCompletion(
        taskId: string,
        userId: string,
        submissionText?: string,
        fileAttachments: FileAttachment[] = []
    ): Promise<TaskSubmission> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Check if task exists and is available
            const taskResult = await client.query(
                'SELECT * FROM tasks WHERE id = $1 AND status = $2',
                [taskId, 'IN_PROGRESS']
            );

            if (taskResult.rows.length === 0) {
                throw new Error('Task not found or not available for submission');
            }

            const task: Task = taskResult.rows[0];

            // Check if user has already submitted for this task
            const existingSubmission = await client.query(
                'SELECT id FROM task_submissions WHERE task_id = $1 AND user_id = $2',
                [taskId, userId]
            );

            if (existingSubmission.rows.length > 0) {
                throw new Error('You have already submitted for this task');
            }

            // Create submission record
            const submissionResult = await client.query(`
                INSERT INTO task_submissions (
                    task_id, user_id, submission_text, file_attachments, 
                    status, manual_review_required
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `, [
                taskId,
                userId,
                submissionText,
                JSON.stringify(fileAttachments),
                'PENDING',
                false
            ]);

            const submission: TaskSubmission = {
                ...submissionResult.rows[0],
                fileAttachments: JSON.parse(submissionResult.rows[0].file_attachments || '[]'),
                aiVerificationResult: {}
            };

            await client.query('COMMIT');

            // Start AI verification process (async)
            this.processSubmissionVerification(submission, task).catch(error => {
                console.error('Verification process failed:', error);
            });

            return submission;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Process submission verification using AI and manual review
     */
    private async processSubmissionVerification(
        submission: TaskSubmission,
        task: Task
    ): Promise<void> {
        try {
            // Update status to under review
            await this.updateSubmissionStatus(submission.id, 'UNDER_REVIEW');

            // Get user history for fraud detection
            const userHistory = await this.getUserSubmissionHistory(submission.userId);

            // Run AI verification
            const aiResult = await this.geminiService.verifyTaskCompletion(submission, task);
            
            // Run fraud detection
            const fraudCheck = await this.geminiService.detectFraudulentActivity(
                submission, 
                task, 
                userHistory
            );

            // Update submission with AI results
            await this.updateSubmissionAIResult(submission.id, aiResult);

            // Determine if manual review is needed
            const needsManualReview = 
                aiResult.requiresManualReview || 
                fraudCheck.isFraudulent || 
                fraudCheck.riskLevel === 'HIGH' ||
                aiResult.score < 70; // Threshold for auto-approval

            if (needsManualReview) {
                await this.queueForManualReview(submission.id, fraudCheck.riskLevel);
                await this.updateSubmissionStatus(submission.id, 'UNDER_REVIEW');
            } else if (aiResult.passed && aiResult.score >= 80) {
                // Auto-approve high-confidence submissions
                await this.approveSubmission(submission.id, task, aiResult);
            } else {
                // Request revisions for low-quality submissions
                await this.requestRevisions(submission.id, aiResult);
            }

        } catch (error) {
            console.error('Verification processing failed:', error);
            
            // Fallback to manual review on error
            await this.queueForManualReview(submission.id, 'HIGH');
            await this.updateSubmissionStatus(submission.id, 'UNDER_REVIEW');
        }
    }

    /**
     * Approve a submission and distribute rewards
     */
    async approveSubmission(
        submissionId: string,
        task: Task,
        aiResult: AIVerificationResult
    ): Promise<void> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Update submission status
            await client.query(
                'UPDATE task_submissions SET status = $1, reviewed_at = NOW() WHERE id = $2',
                ['APPROVED', submissionId]
            );

            // Update task status to completed
            await client.query(
                'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2',
                ['COMPLETED', task.id]
            );

            // Get submission details
            const submissionResult = await client.query(
                'SELECT * FROM task_submissions WHERE id = $1',
                [submissionId]
            );
            const submission = submissionResult.rows[0];

            // Distribute rewards
            await this.rewardService.distributeRewards(
                submission.user_id,
                task,
                aiResult.score
            );

            // Create work history entry
            await client.query(`
                INSERT INTO work_history (
                    user_id, task_id, category, completion_date, 
                    quality_score, xp_earned, trust_score_change, rwis_earned
                ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7)
            `, [
                submission.user_id,
                task.id,
                task.category,
                Math.round(aiResult.score / 20), // Convert to 1-5 scale
                task.rewards.xp,
                task.rewards.trustScoreBonus,
                task.rewards.rwisPoints
            ]);

            await client.query('COMMIT');

            // Send notifications
            await this.notificationService.sendSubmissionApproved(
                submission.user_id,
                task,
                aiResult
            );

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Request revisions for a submission
     */
    async requestRevisions(
        submissionId: string,
        aiResult: AIVerificationResult
    ): Promise<void> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Generate feedback
            const submissionResult = await client.query(
                'SELECT ts.*, t.* FROM task_submissions ts JOIN tasks t ON ts.task_id = t.id WHERE ts.id = $1',
                [submissionId]
            );
            
            if (submissionResult.rows.length === 0) {
                throw new Error('Submission not found');
            }

            const submission = submissionResult.rows[0];
            const feedback = await this.geminiService.generateFeedback(
                submission,
                submission,
                aiResult
            );

            // Update submission with feedback
            await client.query(`
                UPDATE task_submissions 
                SET status = $1, feedback = $2, revision_count = revision_count + 1
                WHERE id = $3
            `, [
                'NEEDS_REVISION',
                feedback.feedback,
                submissionId
            ]);

            await client.query('COMMIT');

            // Send notification
            await this.notificationService.sendRevisionRequested(
                submission.user_id,
                submission,
                feedback
            );

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Queue submission for manual review
     */
    private async queueForManualReview(
        submissionId: string,
        riskLevel: string
    ): Promise<void> {
        const priority = riskLevel === 'HIGH' ? 4 : riskLevel === 'MEDIUM' ? 2 : 1;
        
        await this.db.query(`
            INSERT INTO verification_queue (submission_id, priority)
            VALUES ($1, $2)
            ON CONFLICT (submission_id) DO UPDATE SET priority = $2
        `, [submissionId, priority]);

        // Update submission to require manual review
        await this.db.query(
            'UPDATE task_submissions SET manual_review_required = true WHERE id = $1',
            [submissionId]
        );
    }

    /**
     * Get user's submission history for fraud detection
     */
    private async getUserSubmissionHistory(userId: string): Promise<any[]> {
        const result = await this.db.query(`
            SELECT ts.*, t.category, t.title
            FROM task_submissions ts
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.user_id = $1
            ORDER BY ts.submitted_at DESC
            LIMIT 10
        `, [userId]);

        return result.rows;
    }

    /**
     * Update submission status
     */
    private async updateSubmissionStatus(
        submissionId: string,
        status: SubmissionStatus
    ): Promise<void> {
        await this.db.query(
            'UPDATE task_submissions SET status = $1 WHERE id = $2',
            [status, submissionId]
        );
    }

    /**
     * Update submission with AI verification result
     */
    private async updateSubmissionAIResult(
        submissionId: string,
        aiResult: AIVerificationResult
    ): Promise<void> {
        await this.db.query(
            'UPDATE task_submissions SET ai_verification_result = $1 WHERE id = $2',
            [JSON.stringify(aiResult), submissionId]
        );
    }

    /**
     * Get submission by ID
     */
    async getSubmission(submissionId: string): Promise<TaskSubmission | null> {
        const result = await this.db.query(
            'SELECT * FROM task_submissions WHERE id = $1',
            [submissionId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            ...row,
            fileAttachments: JSON.parse(row.file_attachments || '[]'),
            aiVerificationResult: JSON.parse(row.ai_verification_result || '{}')
        };
    }

    /**
     * Get user's submissions
     */
    async getUserSubmissions(
        userId: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<TaskSubmission[]> {
        const result = await this.db.query(`
            SELECT ts.*, t.title as task_title, t.category as task_category
            FROM task_submissions ts
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.user_id = $1
            ORDER BY ts.submitted_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        return result.rows.map(row => ({
            ...row,
            fileAttachments: JSON.parse(row.file_attachments || '[]'),
            aiVerificationResult: JSON.parse(row.ai_verification_result || '{}')
        }));
    }

    /**
     * Resubmit with revisions
     */
    async resubmitWithRevisions(
        submissionId: string,
        userId: string,
        submissionText?: string,
        fileAttachments: FileAttachment[] = []
    ): Promise<TaskSubmission> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Verify ownership and status
            const submissionResult = await client.query(
                'SELECT * FROM task_submissions WHERE id = $1 AND user_id = $2 AND status = $3',
                [submissionId, userId, 'NEEDS_REVISION']
            );

            if (submissionResult.rows.length === 0) {
                throw new Error('Submission not found or not available for revision');
            }

            // Update submission
            await client.query(`
                UPDATE task_submissions 
                SET submission_text = $1, file_attachments = $2, status = $3, 
                    submitted_at = NOW(), feedback = NULL
                WHERE id = $4
            `, [
                submissionText,
                JSON.stringify(fileAttachments),
                'PENDING',
                submissionId
            ]);

            const updatedResult = await client.query(
                'SELECT ts.*, t.* FROM task_submissions ts JOIN tasks t ON ts.task_id = t.id WHERE ts.id = $1',
                [submissionId]
            );

            await client.query('COMMIT');

            const submission = updatedResult.rows[0];
            const task = updatedResult.rows[0];

            // Restart verification process
            this.processSubmissionVerification(submission, task).catch(error => {
                console.error('Resubmission verification failed:', error);
            });

            return {
                ...submission,
                fileAttachments: JSON.parse(submission.file_attachments || '[]'),
                aiVerificationResult: JSON.parse(submission.ai_verification_result || '{}')
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}