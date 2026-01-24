import { TaskSubmission, ApiResponse } from '../../../shared/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export class TaskSubmissionService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('authToken');
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Submit task completion
     */
    async submitTaskCompletion(
        taskId: string,
        submissionText: string,
        files: File[]
    ): Promise<TaskSubmission> {
        const formData = new FormData();
        formData.append('taskId', taskId);
        formData.append('submissionText', submissionText);
        
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_BASE_URL}/task-submissions`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to submit task');
        }

        const result: ApiResponse<TaskSubmission> = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to submit task');
        }

        return result.data;
    }

    /**
     * Resubmit with revisions
     */
    async resubmitWithRevisions(
        submissionId: string,
        submissionText: string,
        files: File[]
    ): Promise<TaskSubmission> {
        const formData = new FormData();
        formData.append('submissionText', submissionText);
        
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_BASE_URL}/task-submissions/${submissionId}/resubmit`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to resubmit task');
        }

        const result: ApiResponse<TaskSubmission> = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to resubmit task');
        }

        return result.data;
    }

    /**
     * Get user's submissions
     */
    async getUserSubmissions(
        limit: number = 20,
        offset: number = 0
    ): Promise<TaskSubmission[]> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        });

        const response = await fetch(`${API_BASE_URL}/task-submissions/my-submissions?${params}`, {
            method: 'GET',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch submissions');
        }

        const result: ApiResponse<TaskSubmission[]> = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch submissions');
        }

        return result.data;
    }

    /**
     * Get submission details
     */
    async getSubmission(submissionId: string): Promise<TaskSubmission> {
        const response = await fetch(`${API_BASE_URL}/task-submissions/${submissionId}`, {
            method: 'GET',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch submission');
        }

        const result: ApiResponse<TaskSubmission> = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch submission');
        }

        return result.data;
    }

    /**
     * Get verification queue (for reviewers)
     */
    async getVerificationQueue(
        priority?: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<any[]> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        });

        if (priority !== undefined) {
            params.append('priority', priority.toString());
        }

        const response = await fetch(`${API_BASE_URL}/task-submissions/review-queue?${params}`, {
            method: 'GET',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch review queue');
        }

        const result: ApiResponse<any[]> = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch review queue');
        }

        return result.data;
    }

    /**
     * Assign reviewer to queue item
     */
    async assignReviewer(queueItemId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/task-submissions/review-queue/${queueItemId}/assign`, {
            method: 'POST',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to assign reviewer');
        }

        const result: ApiResponse<void> = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to assign reviewer');
        }
    }

    /**
     * Approve submission (manual review)
     */
    async approveSubmission(
        queueItemId: string,
        feedback?: string,
        rating?: number
    ): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/task-submissions/review-queue/${queueItemId}/approve`, {
            method: 'POST',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback, rating }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to approve submission');
        }

        const result: ApiResponse<void> = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to approve submission');
        }
    }

    /**
     * Reject submission (manual review)
     */
    async rejectSubmission(
        queueItemId: string,
        reason: string,
        feedback?: string
    ): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/task-submissions/review-queue/${queueItemId}/reject`, {
            method: 'POST',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason, feedback }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to reject submission');
        }

        const result: ApiResponse<void> = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to reject submission');
        }
    }

    /**
     * Request revisions (manual review)
     */
    async requestRevisions(
        queueItemId: string,
        feedback: string,
        suggestions: string[] = []
    ): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/task-submissions/review-queue/${queueItemId}/revisions`, {
            method: 'POST',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback, suggestions }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to request revisions');
        }

        const result: ApiResponse<void> = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to request revisions');
        }
    }

    /**
     * Get submission feedback
     */
    async getSubmissionFeedback(submissionId: string): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/task-submissions/${submissionId}/feedback`, {
            method: 'GET',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch feedback');
        }

        const result: ApiResponse<any[]> = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch feedback');
        }

        return result.data;
    }

    /**
     * Get reviewer statistics
     */
    async getReviewerStats(): Promise<{
        totalReviews: number;
        approvedReviews: number;
        rejectedReviews: number;
        revisionsRequested: number;
        averageReviewTime: number;
        pendingReviews: number;
    }> {
        const response = await fetch(`${API_BASE_URL}/task-submissions/reviewer/stats`, {
            method: 'GET',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch reviewer stats');
        }

        const result: ApiResponse<any> = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch reviewer stats');
        }

        return result.data;
    }
}

// Export singleton instance
export const taskSubmissionService = new TaskSubmissionService();