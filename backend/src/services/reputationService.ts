import { DatabaseService } from './databaseService';

export interface ReputationUpdate {
    userId: string;
    category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
    taskId: string;
    qualityScore: number;
    completionTime: number; // in hours
    clientFeedback?: string;
    bonusMultipliers?: {
        earlyCompletion?: number;
        exceptionalQuality?: number;
        clientReferral?: number;
        firstTimeClient?: number;
    };
}

export interface LevelProgression {
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
    totalXPRequired: number;
    levelBenefits: string[];
}

export interface BadgeEligibility {
    badgeId: string;
    name: string;
    description: string;
    progress: number;
    maxProgress: number;
    isEligible: boolean;
    requirements: any;
}

export class ReputationService {
    private db: DatabaseService;

    constructor(db: DatabaseService) {
        this.db = db;
    }

    async calculateReputationUpdate(update: ReputationUpdate): Promise<{
        xpEarned: number;
        trustScoreChange: number;
        rwisEarned: number;
        levelUp?: LevelProgression;
        badgesEarned?: string[];
    }> {
        try {
            // Base XP calculation
            let baseXP = this.calculateBaseXP(update.category, update.qualityScore);
            
            // Apply multipliers
            let xpMultiplier = 1;
            let trustMultiplier = 1;
            let rwisMultiplier = 1;

            // Quality bonus
            if (update.qualityScore >= 5) {
                xpMultiplier += 0.5; // 50% bonus for perfect rating
                trustMultiplier += 0.3;
            } else if (update.qualityScore >= 4) {
                xpMultiplier += 0.2; // 20% bonus for good rating
                trustMultiplier += 0.1;
            }

            // Early completion bonus
            if (update.bonusMultipliers?.earlyCompletion) {
                xpMultiplier += update.bonusMultipliers.earlyCompletion;
                trustMultiplier += update.bonusMultipliers.earlyCompletion * 0.5;
            }

            // Category-specific bonuses
            const categoryBonus = this.getCategoryBonus(update.category);
            rwisMultiplier += categoryBonus.rwisBonus;

            // Calculate final values
            const xpEarned = Math.round(baseXP * xpMultiplier);
            const trustScoreChange = Math.round(this.calculateTrustScoreChange(update) * trustMultiplier);
            const rwisEarned = Math.round(this.calculateRWIS(update) * rwisMultiplier);

            // Check for level up
            const levelUp = await this.checkLevelProgression(update.userId, xpEarned);

            // Check for new badges
            const badgesEarned = await this.checkBadgeEligibility(update.userId, update);

            return {
                xpEarned,
                trustScoreChange,
                rwisEarned,
                levelUp,
                badgesEarned
            };

        } catch (error) {
            console.error('Error calculating reputation update:', error);
            throw error;
        }
    }

    async updateUserReputation(update: ReputationUpdate): Promise<void> {
        try {
            const client = await this.db.getClient();
            
            const reputationResult = await this.calculateReputationUpdate(update);

            // Update user stats
            await client.query(`
                UPDATE user_stats 
                SET 
                    xp_points = xp_points + $2,
                    trust_score = trust_score + $3,
                    rwis_score = rwis_score + $4,
                    current_level = $5
                WHERE user_id = $1
            `, [
                update.userId,
                reputationResult.xpEarned,
                reputationResult.trustScoreChange,
                reputationResult.rwisEarned,
                reputationResult.levelUp?.currentLevel || null
            ]);

            // Update category stats
            await this.updateCategoryStats(update.userId, update.category, {
                xpEarned: reputationResult.xpEarned,
                trustScoreChange: reputationResult.trustScoreChange,
                qualityScore: update.qualityScore
            });

            // Award badges if earned
            if (reputationResult.badgesEarned && reputationResult.badgesEarned.length > 0) {
                await this.awardBadges(update.userId, reputationResult.badgesEarned, update.taskId);
            }

        } catch (error) {
            console.error('Error updating user reputation:', error);
            throw error;
        }
    }

    async getCategoryReputation(userId: string, category: string): Promise<{
        level: number;
        xp: number;
        trustScore: number;
        tasksCompleted: number;
        averageRating: number;
        specializations: string[];
        nextLevelRequirements: any;
    }> {
        try {
            const client = await this.db.getClient();
            
            // Get category stats from user_stats
            const statsQuery = `
                SELECT category_stats
                FROM user_stats
                WHERE user_id = $1
            `;
            
            const statsResult = await client.query(statsQuery, [userId]);
            const categoryStats = statsResult.rows[0]?.category_stats?.[category.toLowerCase()] || {};

            // Get work history for this category
            const workQuery = `
                SELECT 
                    COUNT(*) as tasks_completed,
                    AVG(quality_score) as average_rating,
                    SUM(xp_earned) as total_xp,
                    AVG(trust_score_change) as avg_trust_change
                FROM work_history 
                WHERE user_id = $1 AND category = $2 AND completion_date IS NOT NULL
            `;
            
            const workResult = await client.query(workQuery, [userId, category.toUpperCase()]);
            const workStats = workResult.rows[0];

            const totalXP = parseInt(workStats.total_xp) || 0;
            const level = Math.floor(totalXP / 200) + 1;
            const xpToNextLevel = (level * 200) - totalXP;

            return {
                level,
                xp: totalXP,
                trustScore: Math.round(parseFloat(workStats.avg_trust_change) * 10) || 0,
                tasksCompleted: parseInt(workStats.tasks_completed) || 0,
                averageRating: parseFloat(workStats.average_rating) || 0,
                specializations: categoryStats.specializations || [],
                nextLevelRequirements: {
                    xpNeeded: xpToNextLevel,
                    benefits: this.getLevelBenefits(level + 1, category)
                }
            };

        } catch (error) {
            console.error('Error getting category reputation:', error);
            throw error;
        }
    }

    async checkBadgeEligibility(userId: string, update?: ReputationUpdate): Promise<string[]> {
        try {
            const client = await this.db.getClient();
            
            // Get all badges user doesn't have yet
            const badgesQuery = `
                SELECT b.*
                FROM badges b
                WHERE b.id NOT IN (
                    SELECT badge_id 
                    FROM user_achievements 
                    WHERE user_id = $1
                )
            `;
            
            const badgesResult = await client.query(badgesQuery, [userId]);
            const availableBadges = badgesResult.rows;

            const earnedBadges: string[] = [];

            for (const badge of availableBadges) {
                const isEligible = await this.evaluateBadgeCriteria(userId, badge, update);
                if (isEligible) {
                    earnedBadges.push(badge.id);
                }
            }

            return earnedBadges;

        } catch (error) {
            console.error('Error checking badge eligibility:', error);
            return [];
        }
    }

    async awardBadges(userId: string, badgeIds: string[], taskId?: string): Promise<void> {
        try {
            const client = await this.db.getClient();
            
            for (const badgeId of badgeIds) {
                await client.query(`
                    INSERT INTO user_achievements (user_id, badge_id, task_id, earned_at)
                    VALUES ($1, $2, $3, NOW())
                    ON CONFLICT (user_id, badge_id) DO NOTHING
                `, [userId, badgeId, taskId]);
            }

        } catch (error) {
            console.error('Error awarding badges:', error);
            throw error;
        }
    }

    private calculateBaseXP(category: string, qualityScore: number): number {
        const baseXPByCategory = {
            FREELANCE: 50,
            COMMUNITY: 40,
            CORPORATE: 60
        };

        const baseXP = baseXPByCategory[category as keyof typeof baseXPByCategory] || 40;
        return baseXP * (qualityScore / 5); // Scale by quality
    }

    private calculateTrustScoreChange(update: ReputationUpdate): number {
        let trustChange = 0;

        // Base trust score based on quality
        if (update.qualityScore >= 5) trustChange = 10;
        else if (update.qualityScore >= 4) trustChange = 5;
        else if (update.qualityScore >= 3) trustChange = 2;
        else if (update.qualityScore >= 2) trustChange = 0;
        else trustChange = -5; // Penalty for poor quality

        // Bonus for positive feedback
        if (update.clientFeedback && update.clientFeedback.length > 50) {
            trustChange += 2;
        }

        return trustChange;
    }

    private calculateRWIS(update: ReputationUpdate): number {
        const baseRWIS = {
            FREELANCE: 10,
            COMMUNITY: 25, // Higher impact for community work
            CORPORATE: 15
        };

        const base = baseRWIS[update.category] || 10;
        return Math.round(base * (update.qualityScore / 5));
    }

    private getCategoryBonus(category: string): { rwisBonus: number } {
        switch (category) {
            case 'COMMUNITY':
                return { rwisBonus: 0.5 }; // 50% more RWIS for community work
            case 'CORPORATE':
                return { rwisBonus: 0.2 }; // 20% more RWIS for corporate work
            default:
                return { rwisBonus: 0 };
        }
    }

    private async checkLevelProgression(userId: string, xpEarned: number): Promise<LevelProgression | undefined> {
        try {
            const client = await this.db.getClient();
            
            const currentStatsQuery = `
                SELECT xp_points, current_level
                FROM user_stats
                WHERE user_id = $1
            `;
            
            const result = await client.query(currentStatsQuery, [userId]);
            const currentStats = result.rows[0];

            if (!currentStats) return undefined;

            const currentXP = currentStats.xp_points + xpEarned;
            const currentLevel = currentStats.current_level;
            const newLevel = Math.floor(currentXP / 200) + 1;

            if (newLevel > currentLevel) {
                return {
                    currentLevel: newLevel,
                    currentXP,
                    xpToNextLevel: (newLevel * 200) - currentXP,
                    totalXPRequired: newLevel * 200,
                    levelBenefits: this.getLevelBenefits(newLevel)
                };
            }

            return undefined;

        } catch (error) {
            console.error('Error checking level progression:', error);
            return undefined;
        }
    }

    private async updateCategoryStats(userId: string, category: string, stats: any): Promise<void> {
        try {
            const client = await this.db.getClient();
            
            // Get current category stats
            const currentStatsQuery = `
                SELECT category_stats
                FROM user_stats
                WHERE user_id = $1
            `;
            
            const result = await client.query(currentStatsQuery, [userId]);
            const currentCategoryStats = result.rows[0]?.category_stats || {};
            const categoryKey = category.toLowerCase();
            
            // Update the specific category
            const updatedStats = {
                ...currentCategoryStats,
                [categoryKey]: {
                    ...currentCategoryStats[categoryKey],
                    tasksCompleted: (currentCategoryStats[categoryKey]?.tasksCompleted || 0) + 1,
                    totalXP: (currentCategoryStats[categoryKey]?.totalXP || 0) + stats.xpEarned,
                    averageRating: this.calculateNewAverage(
                        currentCategoryStats[categoryKey]?.averageRating || 0,
                        currentCategoryStats[categoryKey]?.tasksCompleted || 0,
                        stats.qualityScore
                    ),
                    trustScore: (currentCategoryStats[categoryKey]?.trustScore || 0) + stats.trustScoreChange
                }
            };

            await client.query(`
                UPDATE user_stats 
                SET category_stats = $2
                WHERE user_id = $1
            `, [userId, JSON.stringify(updatedStats)]);

        } catch (error) {
            console.error('Error updating category stats:', error);
            throw error;
        }
    }

    private calculateNewAverage(currentAverage: number, currentCount: number, newValue: number): number {
        if (currentCount === 0) return newValue;
        return ((currentAverage * currentCount) + newValue) / (currentCount + 1);
    }

    private async evaluateBadgeCriteria(userId: string, badge: any, update?: ReputationUpdate): Promise<boolean> {
        try {
            const criteria = badge.unlock_criteria;
            if (!criteria) return false;

            const client = await this.db.getClient();

            // Example criteria evaluation
            if (criteria.tasksCompleted) {
                const taskCountQuery = `
                    SELECT COUNT(*) as count
                    FROM work_history
                    WHERE user_id = $1 AND category = $2
                `;
                
                const result = await client.query(taskCountQuery, [userId, criteria.category || update?.category]);
                const taskCount = parseInt(result.rows[0].count);
                
                if (taskCount < criteria.tasksCompleted) return false;
            }

            if (criteria.averageRating) {
                const ratingQuery = `
                    SELECT AVG(quality_score) as avg_rating
                    FROM work_history
                    WHERE user_id = $1 AND category = $2
                `;
                
                const result = await client.query(ratingQuery, [userId, criteria.category || update?.category]);
                const avgRating = parseFloat(result.rows[0].avg_rating) || 0;
                
                if (avgRating < criteria.averageRating) return false;
            }

            return true;

        } catch (error) {
            console.error('Error evaluating badge criteria:', error);
            return false;
        }
    }

    private getLevelBenefits(level: number, category?: string): string[] {
        const benefits = [];
        
        if (level >= 5) benefits.push('Access to premium tasks');
        if (level >= 10) benefits.push('Mentor status available');
        if (level >= 15) benefits.push('Priority task matching');
        if (level >= 20) benefits.push('Custom profile themes');
        
        if (category) {
            switch (category.toUpperCase()) {
                case 'FREELANCE':
                    if (level >= 8) benefits.push('Higher rate recommendations');
                    if (level >= 12) benefits.push('Featured freelancer status');
                    break;
                case 'COMMUNITY':
                    if (level >= 6) benefits.push('Event organization privileges');
                    if (level >= 10) benefits.push('Community leader badge');
                    break;
                case 'CORPORATE':
                    if (level >= 7) benefits.push('Corporate partnership opportunities');
                    if (level >= 11) benefits.push('Executive task access');
                    break;
            }
        }

        return benefits;
    }
}