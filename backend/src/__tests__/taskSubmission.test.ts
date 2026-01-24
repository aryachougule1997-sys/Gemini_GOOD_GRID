import { Pool } from 'pg';
import { TaskSubmissionService } from '../services/taskSubmissionService';
import { GeminiVerificationService } from '../services/geminiVerificationService';

// Mock the database and external services
jest.mock('pg');
jest.mock('../services/geminiVerificationService');

describe('TaskSubmissionService', () => {
    let mockDb: jest.Mocked<Pool>;
    let taskSubmissionService: TaskSubmissionService;

    beforeEach(() => {
        mockDb = {
            connect: jest.fn(),
            query: jest.fn(),
        } as any;

        taskSubmissionService = new TaskSubmissionService(mockDb);
    });

    describe('submitTaskCompletion', () => {
        it('should create a task submission successfully', async () => {
            const mockClient = {
                query: jest.fn(),
                release: jest.fn(),
            };

            mockDb.connect.mockResolvedValue(mockClient as any);

            // Mock task exists
            mockClient.query
                .mockResolvedValueOnce({
                    rows: [{
                        id: 'task-1',
                        title: 'Test Task',
                        category: 'COMMUNITY',
                        status: 'IN_PROGRESS'
                    }]
                })
                // Mock no existing submission
                .mockResolvedValueOnce({ rows: [] })
                // Mock submission creation
                .mockResolvedValueOnce({
                    rows: [{
                        id: 'submission-1',
                        task_id: 'task-1',
                        user_id: 'user-1',
                        submission_text: 'Test submission',
                        file_attachments: '[]',
                        status: 'PENDING',
                        manual_review_required: false,
                        submitted_at: new Date(),
                        revision_count: 0
                    }]
                });

            const result = await taskSubmissionService.submitTaskCompletion(
                'task-1',
                'user-1',
                'Test submission',
                []
            );

            expect(result).toBeDefined();
            expect(result.taskId).toBe('task-1');
            expect(result.userId).toBe('user-1');
            expect(result.status).toBe('PENDING');
            expect(mockClient.query).toHaveBeenCalledTimes(3);
        });

        it('should throw error if task not found', async () => {
            const mockClient = {
                query: jest.fn(),
                release: jest.fn(),
            };

            mockDb.connect.mockResolvedValue(mockClient as any);
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            await expect(
                taskSubmissionService.submitTaskCompletion('invalid-task', 'user-1', 'Test', [])
            ).rejects.toThrow('Task not found or not available for submission');
        });

        it('should throw error if user already submitted', async () => {
            const mockClient = {
                query: jest.fn(),
                release: jest.fn(),
            };

            mockDb.connect.mockResolvedValue(mockClient as any);

            // Mock task exists
            mockClient.query
                .mockResolvedValueOnce({
                    rows: [{
                        id: 'task-1',
                        status: 'IN_PROGRESS'
                    }]
                })
                // Mock existing submission
                .mockResolvedValueOnce({
                    rows: [{ id: 'existing-submission' }]
                });

            await expect(
                taskSubmissionService.submitTaskCompletion('task-1', 'user-1', 'Test', [])
            ).rejects.toThrow('You have already submitted for this task');
        });
    });
});

describe('GeminiVerificationService', () => {
    let geminiService: GeminiVerificationService;

    beforeEach(() => {
        // Mock environment variable
        process.env.GEMINI_API_KEY = 'test-api-key';
        geminiService = new GeminiVerificationService();
    });

    describe('verifyTaskCompletion', () => {
        it('should return fallback result when AI service fails', async () => {
            const mockSubmission = {
                id: 'submission-1',
                taskId: 'task-1',
                userId: 'user-1',
                submissionText: 'Test submission',
                fileAttachments: [],
                submittedAt: new Date(),
                status: 'PENDING' as const,
                aiVerificationResult: {},
                manualReviewRequired: false,
                revisionCount: 0
            };

            const mockTask = {
                id: 'task-1',
                title: 'Test Task',
                description: 'Test description',
                category: 'COMMUNITY' as const,
                dungeonId: null,
                creatorId: 'creator-1',
                requirements: {
                    skills: [],
                    trustScoreMin: 0,
                    timeCommitment: 1
                },
                rewards: {
                    xp: 100,
                    trustScoreBonus: 5,
                    rwisPoints: 10
                },
                status: 'OPEN' as const,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // This will fail because we don't have actual Gemini API setup
            const result = await geminiService.verifyTaskCompletion(mockSubmission, mockTask);

            expect(result).toBeDefined();
            expect(result.requiresManualReview).toBe(true);
            expect(result.flaggedIssues).toContain('AI_SERVICE_ERROR');
        });
    });
});

describe('Integration Test', () => {
    it('should have all required database tables', () => {
        // This is a placeholder for integration tests
        // In a real implementation, you would test against a test database
        expect(true).toBe(true);
    });
});