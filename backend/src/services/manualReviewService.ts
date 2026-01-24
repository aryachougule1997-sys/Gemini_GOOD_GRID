import { Pool } from 'pg';
import { 
    VerificationQueueItem, 
    TaskSubmission, 
    Task, 
    TaskFeedback,
    FeedbackType 
} from '../../../shared/types';
import { NotificationService } from './notificationService';
import { TaskSubmissionService } from './taskSubmissionService';

export class ManualReviewService {
    private db: Pool;
    private notificationService: NotificationService;
    private submissionService: TaskSubmissionService;

    constructor(db: Pool) {
        this.db = db;
        this.notificationService = new NotificationService();
        this.submissionService = new TaskSubmissionService(db);
    }

    /**
     * Get verification queue items for review
     */
    async getVerificationQueue(
        reviewerId?: string,
        priority?: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<VerificationQueueItem[]> {
        let query = `
            SELECT vq.*, ts.*, t.title as task_title, t.description as task_description,
                   t.category as task_category, u.username as submitter_username
            FROM verification_queue vq
            JOIN task_submissions ts ON vq.submission_id = ts.id
            JOIN tasks t ON ts.task_id = t.id
            JOIN users u ON ts.user_id = u.id
            WHERE vq.completed_at IS NULL
        `;
        
        const params: any[] = [];
        let paramCount = 0;

        if (reviewerId) {
            paramCount++;
            query += ` AND (vq.assigned_reviewer_id = $${paramCount} OR vq.assigned_reviewer_id IS NULL)`;
            params.push(reviewerId);
        }

        if (priority) {
            paramCount++;
            query += ` AND vq.priority = $${paramCount}`;
            params.push(priority);
        }

        query += ` ORDER BY vq.priority DESC, vq.created_at ASC`;
        
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(limit);
        
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(offset);

        const result = await this.db.query(query, params);
        
        return result.rows.map(row => ({
            id: row.id,
            submissionId: row.submission_id,
            priority: row.priority,
            assignedReviewerId: row.assigned_reviewer_id,
            createdAt: row.created_at,
            assignedAt: row.assigned_at,
            completedAt: row.completed_at,
            notes: row.notes,
            submission: {
                id: row.submission_id,
                taskId: row.task_id,
                userId: row.user_id,
                submissionText: row.submission_text,
                fileAttachments: JSON.parse(row.file_attachments || '[]'),
                submittedAt: row.submitted_at,
                status: row.status,
                aiVerificationResult: JSON.parse(row.ai_verification_result || '{}'),
                manualReviewRequired: row.manual_review_required,
                reviewerId: row.reviewer_id,
                reviewedAt: row.reviewed_at,
                feedback: row.feedback,
                revisionCount: row.revision_count
            }
        }));
    }

    /**
     * Assign reviewer to a queue item
     */
    async assignReviewer(
        queueItemId: string,
        reviewerId: string
    ): Promise<void> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Check if item exists and is not already assigned
            const queueResult = await client.query(
                'SELECT * FROM verification_queue WHERE id = $1 AND completed_at IS NULL',
                [queueItemId]
            );

            if (queueResult.rows.length === 0) {
                throw new Error('Queue item not found or already completed');
            }

            const queueItem = queueResult.rows[0];

            if (queueItem.assigned_reviewer_id && queueItem.assigned_reviewer_id !== reviewerId) {
                throw new Error('Queue item is already assigned to another reviewer');
            }

            // Assign reviewer
            await client.query(
                'UPDATE verification_queue SET assigned_reviewer_id = $1, assigned_at = NOW() WHERE id = $2',
                [reviewerId, queueItemId]
            );

            // Update submission reviewer
            await client.query(
                'UPDATE task_submissions SET reviewer_id = $1 WHERE id = $2',
                [reviewerId, queueItem.submission_id]
            );

            await client.query('COMMIT');

            // Get task details for notification
            const taskResult = await client.query(`
                SELECT t.* FROM tasks t
                JOIN task_submissions ts ON t.id = ts.task_id
                WHERE ts.id = $1
            `, [queueItem.submission_id]);

            if (taskResult.rows.length > 0) {
                await this.notificationService.sendManualReviewAssigned(
                    reviewerId,
                    queueItem.submission_id,
                    taskResult.rows[0].title,
                    queueItem.priority
                );
            }

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Complete manual review with approval
     */
    async approveSubmission(
        queueItemId: string,
        reviewerId: string,
        feedback?: string,
        rating?: number
    ): Promise<void> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Get queue item and submission details
            const queueResult = await client.query(`
                SELECT vq.*, ts.*, t.*
                FROM verification_queue vq
                JOIN task_submissions ts ON vq.submission_id = ts.id
                JOIN tasks t ON ts.task_id = t.id
                WHERE vq.id = $1 AND vq.assigned_reviewer_id = $2
            `, [queueItemId, reviewerId]);

            if (queueResult.rows.length === 0) {
                throw new Error('Queue item not found or not assigned to this reviewer');
            }

            const queueItem = queueResult.rows[0];
            const task = queueResult.rows[0];

            // Complete queue item
            await client.query(
                'UPDATE verification_queue SET completed_at = NOW(), notes = $1 WHERE id = $2',
                [feedback || 'Approved by manual review', queueItemId]
            );

            // Approve submission using the submission service
            const aiResult = JSON.parse(queueItem.ai_verification_result || '{}');
            aiResult.score = rating ? (rating * 20) : Math.max(aiResult.score, 80); // Ensure good score for manual approval
            
            await this.submissionService.approveSubmission(
                queueItem.submission_id,
                task,
                aiResult
            );

            // Add feedback if provided
            if (feedback && rating) {
                await this.addTaskFeedback(
                    queueItem.submission_id,
                    reviewerId,
                    queueItem.user_id,
                    rating,
                    feedback,
                    'OVERALL'
                );
            }

            await client.query('COMMIT');

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Complete manual review with rejection
     */
    async rejectSubmission(
        queueItemId: string,
        reviewerId: string,
        reason: string,
        feedback?: string
    ): Promise<void> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Get queue item and submission details
            const queueResult = await client.query(`
                SELECT vq.*, ts.*
                FROM verification_queue vq
                JOIN task_submissions ts ON vq.submission_id = ts.id
                WHERE vq.id = $1 AND vq.assigned_reviewer_id = $2
            `, [queueItemId, reviewerId]);

            if (queueResult.rows.length === 0) {
                throw new Error('Queue item not found or not assigned to this reviewer');
            }

            const queueItem = queueResult.rows[0];

            // Complete queue item
            await client.query(
                'UPDATE verification_queue SET completed_at = NOW(), notes = $1 WHERE id = $2',
                [reason, queueItemId]
            );

            // Reject submission
            await client.query(
                'UPDATE task_submissions SET status = $1, feedback = $2, reviewed_at = NOW() WHERE id = $3',
                ['REJECTED', feedback || reason, queueItem.submission_id]
            );

            await client.query('COMMIT');

            // Send rejection notification
            await this.notificationService.sendSubmissionRejected(
                queueItem.user_id,
                queueItem,
                reason
            );

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Request revisions from manual review
     */
    async requestRevisions(
        queueItemId: string,
        reviewerId: string,
        feedback: string,
        suggestions: string[] = []
    ): Promise<void> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Get queue item and submission details
            const queueResult = await client.query(`
                SELECT vq.*, ts.*
                FROM verification_queue vq
                JOIN task_submissions ts ON vq.submission_id = ts.id
                WHERE vq.id = $1 AND vq.assigned_reviewer_id = $2
            `, [queueItemId, reviewerId]);

            if (queueResult.rows.length === 0) {
                throw new Error('Queue item not found or not assigned to this reviewer');
            }

            const queueItem = queueResult.rows[0];

            // Complete queue item
            await client.query(
                'UPDATE verification_queue SET completed_at = NOW(), notes = $1 WHERE id = $2',
                [feedback, queueItemId]
            );

            // Request revisions
            await client.query(`
                UPDATE task_submissions 
                SET status = $1, feedback = $2, revision_count = revision_count + 1, reviewed_at = NOW()
                WHERE id = $3
            `, ['NEEDS_REVISION', feedback, queueItem.submission_id]);

            await client.query('COMMIT');

            // Send revision notification
            await this.notificationService.sendRevisionRequested(
                queueItem.user_id,
                queueItem,
                {
                    feedback,
                    suggestions,
                    strengths: [],
                    areasForImprovement: suggestions
                }
            );

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Add task feedback
     */
    async addTaskFeedback(
        submissionId: string,
        fromUserId: string,
        toUserId: string,
        rating: number,
        feedbackText: string,
        feedbackType: FeedbackType = 'OVERALL'
    ): Promise<TaskFeedback> {
        const result = await this.db.query(`
            INSERT INTO task_feedback (
                submission_id, from_user_id, to_user_id, rating, 
                feedback_text, feedback_type
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [submissionId, fromUserId, toUserId, rating, feedbackText, feedbackType]);

        return result.rows[0];
    }

    /**
     * Get feedback for a submission
     */
    async getSubmissionFeedback(submissionId: string): Promise<TaskFeedback[]> {
        const result = await this.db.query(`
            SELECT tf.*, u.username as from_username
            FROM task_feedback tf
            JOIN users u ON tf.from_user_id = u.id
            WHERE tf.submission_id = $1
            ORDER BY tf.created_at DESC
        `, [submissionId]);

        return result.rows;
    }

    /**
     * Get reviewer statistics
     */
    async getReviewerStats(reviewerId: string): Promise<{
        totalReviews: number;
        approvedReviews: number;
        rejectedReviews: number;
        revisionsRequested: number;
        averageReviewTime: number; // in hours
        pendingReviews: number;
    }> {
        const statsResult = await this.db.query(`
            SELECT 
                COUNT(*) as total_reviews,
                COUNT(CASE WHEN ts.status = 'APPROVED' THEN 1 END) as approved_reviews,
                COUNT(CASE WHEN ts.status = 'REJECTED' THEN 1 END) as rejected_reviews,
                COUNT(CASE WHEN ts.status = 'NEEDS_REVISION' THEN 1 END) as revisions_requested,
                AVG(EXTRACT(EPOCH FROM (vq.completed_at - vq.assigned_at))/3600) as avg_review_time_hours
            FROM verification_queue vq
            JOIN task_submissions ts ON vq.submission_id = ts.id
            WHERE vq.assigned_reviewer_id = $1 AND vq.completed_at IS NOT NULL
        `, [reviewerId]);

        const pendingResult = await this.db.query(`
            SELECT COUNT(*) as pending_reviews
            FROM verification_queue
            WHERE assigned_reviewer_id = $1 AND completed_at IS NULL
        `, [reviewerId]);

        const stats = statsResult.rows[0];
        const pending = pendingResult.rows[0];

        return {
            totalReviews: parseInt(stats.total_reviews) || 0,
            approvedReviews: parseInt(stats.approved_reviews) || 0,
            rejectedReviews: parseInt(stats.rejected_reviews) || 0,
            revisionsRequested: parseInt(stats.revisions_requested) || 0,
            averageReviewTime: parseFloat(stats.avg_review_time_hours) || 0,
            pendingReviews: parseInt(pending.pending_reviews) || 0
        };
    }

    /**
     * Get available reviewers for assignment
     */
    async getAvailableReviewers(): Promise<Array<{
        id: string;
        username: string;
        email: string;
        pendingReviews: number;
        totalReviews: number;
        averageRating: number;
    }>> {
        const result = await this.db.query(`
            SELECT 
                u.id, u.username, u.email,
                COUNT(vq.id) as pending_reviews,
                (
                    SELECT COUNT(*) 
                    FROM verification_queue vq2 
                    WHERE vq2.assigned_reviewer_id = u.id AND vq2.completed_at IS NOT NULL
                ) as total_reviews,
                COALESCE(
                    (
                        SELECT AVG(tf.rating)
                        FROM task_feedback tf
                        WHERE tf.from_user_id = u.id
                    ), 0
                ) as average_rating
            FROM users u
            LEFT JOIN verification_queue vq ON u.id = vq.assigned_reviewer_id AND vq.completed_at IS NULL
            WHERE u.id IN (
                SELECT DISTINCT assigned_reviewer_id 
                FROM verification_queue 
                WHERE assigned_reviewer_id IS NOT NULL
                UNION
                SELECT id FROM users WHERE email LIKE '%@goodgrid.admin%'
            )
            GROUP BY u.id, u.username, u.email
            ORDER BY pending_reviews ASC, total_reviews DESC
        `);

        return result.rows.map(row => ({
            id: row.id,
            username: row.username,
            email: row.email,
            pendingReviews: parseInt(row.pending_reviews) || 0,
            totalReviews: parseInt(row.total_reviews) || 0,
            averageRating: parseFloat(row.average_rating) || 0
        }));
    }
}