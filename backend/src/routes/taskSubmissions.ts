import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { TaskSubmissionService } from '../services/taskSubmissionService';
import { ManualReviewService } from '../services/manualReviewService';
import { FileAttachment } from '../../../shared/types';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/submissions/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per submission
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'text/csv',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip', 'application/x-zip-compressed'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed`));
        }
    }
});

export const initializeTaskSubmissionRoutes = (db: Pool) => {
    const submissionService = new TaskSubmissionService(db);
    const reviewService = new ManualReviewService(db);

    /**
     * Submit task completion
     * POST /api/task-submissions
     */
    router.post('/', upload.array('files'), async (req, res) => {
    try {
        const { taskId, submissionText } = req.body;
        const userId = 'demo-user'; // Mock user for demo

        if (!taskId) {
            return res.status(400).json({
                success: false,
                error: 'Task ID is required'
            });
        }

        // Process uploaded files
        const fileAttachments: FileAttachment[] = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                fileAttachments.push({
                    id: uuidv4(),
                    filename: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: `/uploads/submissions/${file.filename}`,
                    uploadedAt: new Date()
                });
            }
        }

        const submission = await submissionService.submitTaskCompletion(
            taskId,
            userId,
            submissionText,
            fileAttachments
        );

        res.json({
            success: true,
            data: submission,
            message: 'Task submission created successfully. Verification in progress.'
        });

    } catch (error) {
        console.error('Task submission error:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit task'
        });
    }
});

/**
 * Resubmit with revisions
 * PUT /api/task-submissions/:id/resubmit
 */
router.put('/:id/resubmit', upload.array('files'), async (req, res) => {
    try {
        const { id } = req.params;
        const { submissionText } = req.body;
        const userId = 'demo-user'; // Mock user for demo

        // Process uploaded files
        const fileAttachments: FileAttachment[] = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                fileAttachments.push({
                    id: uuidv4(),
                    filename: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: `/uploads/submissions/${file.filename}`,
                    uploadedAt: new Date()
                });
            }
        }

        const submission = await submissionService.resubmitWithRevisions(
            id,
            userId,
            submissionText,
            fileAttachments
        );

        res.json({
            success: true,
            data: submission,
            message: 'Task resubmitted successfully. Verification in progress.'
        });

    } catch (error) {
        console.error('Task resubmission error:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to resubmit task'
        });
    }
});

/**
 * Get user's submissions
 * GET /api/task-submissions/my-submissions
 */
router.get('/my-submissions', async (req, res) => {
    try {
        const userId = 'demo-user'; // Mock user for demo
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const submissions = await submissionService.getUserSubmissions(userId, limit, offset);

        res.json({
            success: true,
            data: submissions
        });

    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch submissions'
        });
    }
});

/**
 * Get submission details
 * GET /api/task-submissions/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await submissionService.getSubmission(id);

        if (!submission) {
            return res.status(404).json({
                success: false,
                error: 'Submission not found'
            });
        }

        // Check if user owns this submission or is a reviewer
        const userId = req.user?.id;
        if (submission.userId !== userId && submission.reviewerId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: submission
        });

    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch submission'
        });
    }
});

/**
 * Get verification queue (for reviewers)
 * GET /api/task-submissions/review-queue
 */
router.get('/review-queue', async (req, res) => {
    try {
        const reviewerId = 'demo-reviewer'; // Mock reviewer for demo
        const priority = req.query.priority ? parseInt(req.query.priority as string) : undefined;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const queueItems = await reviewService.getVerificationQueue(
            reviewerId,
            priority,
            limit,
            offset
        );

        res.json({
            success: true,
            data: queueItems
        });

    } catch (error) {
        console.error('Get review queue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch review queue'
        });
    }
});

/**
 * Assign reviewer to queue item
 * POST /api/task-submissions/review-queue/:id/assign
 */
router.post('/review-queue/:id/assign', async (req, res) => {
    try {
        const { id } = req.params;
        const reviewerId = req.user?.id || 'demo-reviewer';

        await reviewService.assignReviewer(id, reviewerId);

        res.json({
            success: true,
            message: 'Review assigned successfully'
        });

    } catch (error) {
        console.error('Assign reviewer error:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to assign reviewer'
        });
    }
});

/**
 * Approve submission (manual review)
 * POST /api/task-submissions/review-queue/:id/approve
 */
router.post('/review-queue/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback, rating } = req.body;
        const reviewerId = req.user?.id || 'demo-reviewer';

        await reviewService.approveSubmission(id, reviewerId, feedback, rating);

        res.json({
            success: true,
            message: 'Submission approved successfully'
        });

    } catch (error) {
        console.error('Approve submission error:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to approve submission'
        });
    }
});

/**
 * Reject submission (manual review)
 * POST /api/task-submissions/review-queue/:id/reject
 */
router.post('/review-queue/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, feedback } = req.body;
        const reviewerId = req.user?.id || 'demo-reviewer';

        if (!reason) {
            return res.status(400).json({
                success: false,
                error: 'Rejection reason is required'
            });
        }

        await reviewService.rejectSubmission(id, reviewerId, reason, feedback);

        res.json({
            success: true,
            message: 'Submission rejected successfully'
        });

    } catch (error) {
        console.error('Reject submission error:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reject submission'
        });
    }
});

/**
 * Request revisions (manual review)
 * POST /api/task-submissions/review-queue/:id/revisions
 */
router.post('/review-queue/:id/revisions', async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback, suggestions } = req.body;
        const reviewerId = req.user?.id || 'demo-reviewer';

        if (!feedback) {
            return res.status(400).json({
                success: false,
                error: 'Feedback is required for revision requests'
            });
        }

        await reviewService.requestRevisions(id, reviewerId, feedback, suggestions || []);

        res.json({
            success: true,
            message: 'Revisions requested successfully'
        });

    } catch (error) {
        console.error('Request revisions error:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to request revisions'
        });
    }
});

/**
 * Get submission feedback
 * GET /api/task-submissions/:id/feedback
 */
router.get('/:id/feedback', async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await reviewService.getSubmissionFeedback(id);

        res.json({
            success: true,
            data: feedback
        });

    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch feedback'
        });
    }
});

/**
 * Get reviewer statistics
 * GET /api/task-submissions/reviewer/stats
 */
router.get('/reviewer/stats', async (req, res) => {
    try {
        const reviewerId = 'demo-reviewer'; // Mock reviewer for demo
        const stats = await reviewService.getReviewerStats(reviewerId);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get reviewer stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviewer statistics'
        });
    }
});

    return router;
};

export default router;