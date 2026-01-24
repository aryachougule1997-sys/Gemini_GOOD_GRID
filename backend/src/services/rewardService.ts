import { Pool } from 'pg';
import { Task, RewardDistribution, UserStats } from '../../../shared/types';

export class RewardService {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * Distribute rewards for completed task
     */
    async distributeRewards(
        userId: string,
        task: Task,
        qualityScore: number // 0-100 from AI verification
    ): Promise<RewardDistribution> {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');

            // Calculate quality multiplier (0.5x to 1.5x based on quality)
            const qualityMultiplier = Math.max(0.5, Math.min(1.5, qualityScore / 100 + 0.5));

            // Calculate rewards with quality multiplier
            const xpAwarded = Math.round(task.rewards.xp * qualityMultiplier);
            const trustScoreChange = Math.round(task.rewards.trustScoreBonus * qualityMultiplier);
            const rwisAwarded = Math.round(task.rewards.rwisPoints * qualityMultiplier);

            // Get current user stats
            const userStatsResult = await client.query(
                'SELECT * FROM user_stats WHERE user_id = $1',
                [userId]
            );

            let currentStats: UserStats;
            if (userStatsResult.rows.length === 0) {
                // Create initial stats if they don't exist
                await client.query(`
                    INSERT INTO user_stats (user_id, trust_score, rwis_score, xp_points, current_level)
                    VALUES ($1, 0, 0, 0, 1)
                `, [userId]);
                
                currentStats = {
                    userId,
                    trustScore: 0,
                    rwisScore: 0,
                    xpPoints: 0,
                    currentLevel: 1,
                    unlockedZones: [],
                    categoryStats: {
                        freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
                        community: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
                        corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] }
                    }
                };
            } else {
                currentStats = {
                    ...userStatsResult.rows[0],
                    categoryStats: JSON.parse(userStatsResult.rows[0].category_stats || '{}')
                };
            }

            // Calculate new stats
            const newXP = currentStats.xpPoints + xpAwarded;
            const newTrustScore = Math.max(0, currentStats.trustScore + trustScoreChange);
            const newRWIS = currentStats.rwisScore + rwisAwarded;

            // Calculate level progression
            const newLevel = this.calculateLevel(newXP);
            const leveledUp = newLevel > currentStats.currentLevel;

            // Update category stats
            const categoryKey = task.category.toLowerCase() as keyof typeof currentStats.categoryStats;
            const categoryStats = currentStats.categoryStats[categoryKey];
            categoryStats.tasksCompleted += 1;
            categoryStats.totalXP += xpAwarded;
            categoryStats.averageRating = this.calculateAverageRating(
                categoryStats.averageRating,
                categoryStats.tasksCompleted - 1,
                qualityScore / 20 // Convert to 1-5 scale
            );

            // Check for new badges
            const newBadges = await this.checkForNewBadges(
                userId,
                {
                    ...currentStats,
                    xpPoints: newXP,
                    trustScore: newTrustScore,
                    rwisScore: newRWIS,
                    currentLevel: newLevel,
                    categoryStats: currentStats.categoryStats
                },
                task
            );

            // Update user stats
            await client.query(`
                UPDATE user_stats 
                SET trust_score = $1, rwis_score = $2, xp_points = $3, 
                    current_level = $4, category_stats = $5
                WHERE user_id = $6
            `, [
                newTrustScore,
                newRWIS,
                newXP,
                newLevel,
                JSON.stringify(currentStats.categoryStats),
                userId
            ]);

            // Award badges
            for (const badgeId of newBadges) {
                await client.query(`
                    INSERT INTO user_achievements (user_id, badge_id, task_id)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, badge_id) DO NOTHING
                `, [userId, badgeId, task.id]);
            }

            // Create reward distribution record
            const rewardResult = await client.query(`
                INSERT INTO reward_distributions (
                    submission_id, user_id, xp_awarded, trust_score_change, 
                    rwis_awarded, badges_awarded, payment_amount, payment_status
                ) VALUES (
                    (SELECT id FROM task_submissions WHERE task_id = $1 AND user_id = $2),
                    $2, $3, $4, $5, $6, $7, $8
                ) RETURNING *
            `, [
                task.id,
                userId,
                xpAwarded,
                trustScoreChange,
                rwisAwarded,
                newBadges,
                task.rewards.payment || null,
                task.rewards.payment ? 'PENDING' : 'PROCESSED'
            ]);

            await client.query('COMMIT');

            // Check for zone unlocks if leveled up
            if (leveledUp) {
                this.checkZoneUnlocks(userId, newLevel, newTrustScore).catch(error => {
                    console.error('Zone unlock check failed:', error);
                });
            }

            return {
                ...rewardResult.rows[0],
                badgesAwarded: newBadges
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Calculate user level based on XP
     */
    private calculateLevel(xp: number): number {
        // Level progression: 100 XP for level 2, then +50 XP per level
        if (xp < 100) return 1;
        return Math.floor((xp - 50) / 50) + 1;
    }

    /**
     * Calculate average rating with new rating
     */
    private calculateAverageRating(
        currentAverage: number,
        previousCount: number,
        newRating: number
    ): number {
        if (previousCount === 0) return newRating;
        return ((currentAverage * previousCount) + newRating) / (previousCount + 1);
    }

    /**
     * Check for new badges based on updated stats
     */
    private async checkForNewBadges(
        userId: string,
        newStats: UserStats,
        completedTask: Task
    ): Promise<string[]> {
        const newBadges: string[] = [];

        // Get all available badges
        const badgesResult = await this.db.query('SELECT * FROM badges');
        const allBadges = badgesResult.rows;

        // Get user's current badges
        const userBadgesResult = await this.db.query(
            'SELECT badge_id FROM user_achievements WHERE user_id = $1',
            [userId]
        );
        const currentBadgeIds = new Set(userBadgesResult.rows.map(row => row.badge_id));

        for (const badge of allBadges) {
            if (currentBadgeIds.has(badge.id)) continue; // Already has this badge

            const criteria = JSON.parse(badge.unlock_criteria || '{}');
            
            if (this.checkBadgeCriteria(criteria, newStats, completedTask)) {
                newBadges.push(badge.id);
            }
        }

        return newBadges;
    }

    /**
     * Check if badge criteria are met
     */
    private checkBadgeCriteria(
        criteria: any,
        stats: UserStats,
        completedTask: Task
    ): boolean {
        // Trust score requirement
        if (criteria.trustScore && stats.trustScore < criteria.trustScore) {
            return false;
        }

        // Tasks completed requirement
        if (criteria.tasksCompleted) {
            const totalTasks = Object.values(stats.categoryStats)
                .reduce((sum, cat) => sum + cat.tasksCompleted, 0);
            if (totalTasks < criteria.tasksCompleted) {
                return false;
            }
        }

        // Category-specific task requirements
        if (criteria.categoryTasks) {
            for (const [category, required] of Object.entries(criteria.categoryTasks)) {
                const categoryKey = category as keyof typeof stats.categoryStats;
                if (stats.categoryStats[categoryKey].tasksCompleted < (required as number)) {
                    return false;
                }
            }
        }

        // Skill-based requirements
        if (criteria.skillTasks && completedTask.requirements.skills) {
            // This would require more complex tracking of skill-based completions
            // For now, we'll implement basic skill badge logic
        }

        return true;
    }

    /**
     * Check for zone unlocks based on new level and trust score
     */
    private async checkZoneUnlocks(
        userId: string,
        newLevel: number,
        newTrustScore: number
    ): Promise<void> {
        try {
            // Get all zones with unlock requirements
            const zonesResult = await this.db.query(`
                SELECT z.*, us.unlocked_zones 
                FROM zones z, user_stats us 
                WHERE us.user_id = $1
            `, [userId]);

            if (zonesResult.rows.length === 0) return;

            const zones = zonesResult.rows;
            const currentUnlockedZones = new Set(zones[0].unlocked_zones || []);
            const newUnlockedZones: string[] = [];

            for (const zone of zones) {
                if (currentUnlockedZones.has(zone.id)) continue;

                const requirements = JSON.parse(zone.unlock_requirements || '{}');
                
                const meetsRequirements = 
                    (!requirements.trustScore || newTrustScore >= requirements.trustScore) &&
                    (!requirements.level || newLevel >= requirements.level);

                if (meetsRequirements) {
                    newUnlockedZones.push(zone.id);
                    currentUnlockedZones.add(zone.id);
                }
            }

            if (newUnlockedZones.length > 0) {
                // Update unlocked zones
                await this.db.query(
                    'UPDATE user_stats SET unlocked_zones = $1 WHERE user_id = $2',
                    [Array.from(currentUnlockedZones), userId]
                );

                // Send zone unlock notifications
                // This would integrate with the notification service
            }

        } catch (error) {
            console.error('Zone unlock check failed:', error);
        }
    }

    /**
     * Get reward distribution history for user
     */
    async getUserRewardHistory(
        userId: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<RewardDistribution[]> {
        const result = await this.db.query(`
            SELECT rd.*, ts.task_id, t.title as task_title, t.category as task_category
            FROM reward_distributions rd
            JOIN task_submissions ts ON rd.submission_id = ts.id
            JOIN tasks t ON ts.task_id = t.id
            WHERE rd.user_id = $1
            ORDER BY rd.distributed_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        return result.rows;
    }

    /**
     * Process pending payments
     */
    async processPendingPayments(): Promise<void> {
        const pendingPayments = await this.db.query(`
            SELECT * FROM reward_distributions 
            WHERE payment_status = 'PENDING' AND payment_amount > 0
            ORDER BY distributed_at ASC
        `);

        for (const payment of pendingPayments.rows) {
            try {
                // Here you would integrate with a payment processor
                // For now, we'll just mark as processed
                await this.db.query(
                    'UPDATE reward_distributions SET payment_status = $1 WHERE id = $2',
                    ['PROCESSED', payment.id]
                );
            } catch (error) {
                console.error(`Payment processing failed for ${payment.id}:`, error);
                await this.db.query(
                    'UPDATE reward_distributions SET payment_status = $1 WHERE id = $2',
                    ['FAILED', payment.id]
                );
            }
        }
    }
}