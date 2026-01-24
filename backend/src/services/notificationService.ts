import { Task, AIVerificationResult, TaskSubmission } from '../../../shared/types';

export class NotificationService {
    /**
     * Send notification when submission is approved
     */
    async sendSubmissionApproved(
        userId: string,
        task: Task,
        aiResult: AIVerificationResult
    ): Promise<void> {
        try {
            const notification = {
                type: 'SUBMISSION_APPROVED',
                userId,
                title: 'Task Completed Successfully! 🎉',
                message: `Your submission for "${task.title}" has been approved! You've earned ${task.rewards.xp} XP and ${task.rewards.trustScoreBonus} Trust Score points.`,
                data: {
                    taskId: task.id,
                    taskTitle: task.title,
                    rewards: task.rewards,
                    qualityScore: aiResult.score
                },
                timestamp: new Date()
            };

            // Send real-time notification via WebSocket
            await this.sendWebSocketNotification(userId, notification);

            // Store notification in database for later retrieval
            await this.storeNotification(notification);

            // Send email notification if user has email notifications enabled
            await this.sendEmailNotification(userId, notification);

        } catch (error) {
            console.error('Failed to send approval notification:', error);
        }
    }

    /**
     * Send notification when revisions are requested
     */
    async sendRevisionRequested(
        userId: string,
        submission: TaskSubmission,
        feedback: {
            feedback: string;
            suggestions: string[];
            strengths: string[];
            areasForImprovement: string[];
        }
    ): Promise<void> {
        try {
            const notification = {
                type: 'REVISION_REQUESTED',
                userId,
                title: 'Submission Needs Revision 📝',
                message: `Your submission needs some improvements. Check the feedback and resubmit when ready.`,
                data: {
                    submissionId: submission.id,
                    taskId: submission.taskId,
                    feedback: feedback.feedback,
                    suggestions: feedback.suggestions,
                    strengths: feedback.strengths,
                    areasForImprovement: feedback.areasForImprovement
                },
                timestamp: new Date()
            };

            await this.sendWebSocketNotification(userId, notification);
            await this.storeNotification(notification);
            await this.sendEmailNotification(userId, notification);

        } catch (error) {
            console.error('Failed to send revision notification:', error);
        }
    }

    /**
     * Send notification when submission is rejected
     */
    async sendSubmissionRejected(
        userId: string,
        submission: TaskSubmission,
        reason: string
    ): Promise<void> {
        try {
            const notification = {
                type: 'SUBMISSION_REJECTED',
                userId,
                title: 'Submission Not Approved ❌',
                message: `Unfortunately, your submission could not be approved. ${reason}`,
                data: {
                    submissionId: submission.id,
                    taskId: submission.taskId,
                    reason
                },
                timestamp: new Date()
            };

            await this.sendWebSocketNotification(userId, notification);
            await this.storeNotification(notification);
            await this.sendEmailNotification(userId, notification);

        } catch (error) {
            console.error('Failed to send rejection notification:', error);
        }
    }

    /**
     * Send notification when badge is earned
     */
    async sendBadgeEarned(
        userId: string,
        badgeName: string,
        badgeDescription: string,
        taskTitle?: string
    ): Promise<void> {
        try {
            const notification = {
                type: 'BADGE_EARNED',
                userId,
                title: `New Badge Earned! 🏆`,
                message: `Congratulations! You've earned the "${badgeName}" badge. ${badgeDescription}`,
                data: {
                    badgeName,
                    badgeDescription,
                    taskTitle
                },
                timestamp: new Date()
            };

            await this.sendWebSocketNotification(userId, notification);
            await this.storeNotification(notification);

        } catch (error) {
            console.error('Failed to send badge notification:', error);
        }
    }

    /**
     * Send notification when level up occurs
     */
    async sendLevelUp(
        userId: string,
        newLevel: number,
        xpEarned: number
    ): Promise<void> {
        try {
            const notification = {
                type: 'LEVEL_UP',
                userId,
                title: `Level Up! 🚀`,
                message: `Amazing! You've reached level ${newLevel}! Keep up the great work.`,
                data: {
                    newLevel,
                    xpEarned
                },
                timestamp: new Date()
            };

            await this.sendWebSocketNotification(userId, notification);
            await this.storeNotification(notification);

        } catch (error) {
            console.error('Failed to send level up notification:', error);
        }
    }

    /**
     * Send notification when zone is unlocked
     */
    async sendZoneUnlocked(
        userId: string,
        zoneName: string,
        zoneDescription: string
    ): Promise<void> {
        try {
            const notification = {
                type: 'ZONE_UNLOCKED',
                userId,
                title: `New Zone Unlocked! 🗺️`,
                message: `You've unlocked the ${zoneName}! Explore new opportunities and challenges.`,
                data: {
                    zoneName,
                    zoneDescription
                },
                timestamp: new Date()
            };

            await this.sendWebSocketNotification(userId, notification);
            await this.storeNotification(notification);

        } catch (error) {
            console.error('Failed to send zone unlock notification:', error);
        }
    }

    /**
     * Send notification when manual review is assigned
     */
    async sendManualReviewAssigned(
        reviewerId: string,
        submissionId: string,
        taskTitle: string,
        priority: number
    ): Promise<void> {
        try {
            const priorityText = priority === 4 ? 'Urgent' : priority === 3 ? 'High' : priority === 2 ? 'Medium' : 'Low';
            
            const notification = {
                type: 'REVIEW_ASSIGNED',
                userId: reviewerId,
                title: `New Review Assignment 👨‍💼`,
                message: `You've been assigned to review a ${priorityText.toLowerCase()} priority submission for "${taskTitle}".`,
                data: {
                    submissionId,
                    taskTitle,
                    priority,
                    priorityText
                },
                timestamp: new Date()
            };

            await this.sendWebSocketNotification(reviewerId, notification);
            await this.storeNotification(notification);

        } catch (error) {
            console.error('Failed to send review assignment notification:', error);
        }
    }

    /**
     * Send real-time notification via WebSocket
     */
    private async sendWebSocketNotification(userId: string, notification: any): Promise<void> {
        try {
            // This would integrate with your WebSocket server
            // For now, we'll just log it
            console.log(`WebSocket notification for user ${userId}:`, notification);
            
            // In a real implementation, you would:
            // 1. Get the user's active WebSocket connections
            // 2. Send the notification to all active connections
            // 3. Handle connection failures gracefully
            
        } catch (error) {
            console.error('WebSocket notification failed:', error);
        }
    }

    /**
     * Store notification in database for later retrieval
     */
    private async storeNotification(notification: any): Promise<void> {
        try {
            // This would store the notification in a notifications table
            // For now, we'll just log it
            console.log('Storing notification:', notification);
            
            // In a real implementation, you would:
            // 1. Insert into notifications table
            // 2. Set expiration dates for cleanup
            // 3. Handle read/unread status
            
        } catch (error) {
            console.error('Failed to store notification:', error);
        }
    }

    /**
     * Send email notification if user has email notifications enabled
     */
    private async sendEmailNotification(userId: string, notification: any): Promise<void> {
        try {
            // This would integrate with an email service (SendGrid, AWS SES, etc.)
            // For now, we'll just log it
            console.log(`Email notification for user ${userId}:`, notification);
            
            // In a real implementation, you would:
            // 1. Check user's email notification preferences
            // 2. Format the notification as HTML email
            // 3. Send via email service provider
            // 4. Handle delivery failures and retries
            
        } catch (error) {
            console.error('Email notification failed:', error);
        }
    }

    /**
     * Send push notification for mobile users
     */
    private async sendPushNotification(userId: string, notification: any): Promise<void> {
        try {
            // This would integrate with a push notification service (FCM, APNS, etc.)
            console.log(`Push notification for user ${userId}:`, notification);
            
        } catch (error) {
            console.error('Push notification failed:', error);
        }
    }

    /**
     * Get user's notification preferences
     */
    async getUserNotificationPreferences(userId: string): Promise<{
        email: boolean;
        push: boolean;
        webSocket: boolean;
        categories: string[];
    }> {
        // This would fetch from user preferences table
        // For now, return default preferences
        return {
            email: true,
            push: true,
            webSocket: true,
            categories: ['SUBMISSION_APPROVED', 'REVISION_REQUESTED', 'BADGE_EARNED', 'LEVEL_UP', 'ZONE_UNLOCKED']
        };
    }

    /**
     * Update user's notification preferences
     */
    async updateNotificationPreferences(
        userId: string,
        preferences: {
            email?: boolean;
            push?: boolean;
            webSocket?: boolean;
            categories?: string[];
        }
    ): Promise<void> {
        try {
            // This would update the user preferences table
            console.log(`Updating notification preferences for user ${userId}:`, preferences);
            
        } catch (error) {
            console.error('Failed to update notification preferences:', error);
        }
    }
}