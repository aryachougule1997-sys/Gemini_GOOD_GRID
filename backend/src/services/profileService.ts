import { Pool } from 'pg';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    characterData: any;
    locationData: any;
    createdAt: Date;
    updatedAt: Date;
}

interface UserStats {
    userId: string;
    trustScore: number;
    rwisScore: number;
    xpPoints: number;
    currentLevel: number;
    unlockedZones: string[];
    categoryStats: {
        freelance: CategoryStats;
        community: CategoryStats;
        corporate: CategoryStats;
    };
}

interface CategoryStats {
    tasksCompleted: number;
    totalXP: number;
    averageRating: number;
    specializations: string[];
    trustScore: number;
    impactScore: number;
    level: number;
    nextLevelXP: number;
}

interface WorkHistoryItem {
    id: string;
    userId: string;
    taskId: string;
    category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
    completionDate: Date;
    qualityScore: number;
    clientFeedback: string;
    xpEarned: number;
    trustScoreChange: number;
    rwisEarned: number;
    taskTitle: string;
    taskDescription: string;
    organizationName: string;
    skills: string[];
    impact: string;
    duration: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'VERIFIED';
    rating: number;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    category: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    iconUrl: string;
    earnedDate: Date;
    requirements: string;
}

export class ProfileService {
    constructor(private db: Pool) {}

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const result = await this.db.query(
                'SELECT * FROM users WHERE id = $1',
                [userId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    async getUserStats(userId: string): Promise<UserStats | null> {
        try {
            const result = await this.db.query(
                'SELECT * FROM user_stats WHERE user_id = $1',
                [userId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    async getWorkHistory(userId: string, category?: string, limit?: number, offset?: number): Promise<WorkHistoryItem[]> {
        try {
            let query = `
                SELECT 
                    wh.*,
                    t.title as task_title,
                    t.description as task_description,
                    COALESCE(o.name, 'Individual Client') as organization_name
                FROM work_history wh
                JOIN tasks t ON wh.task_id = t.id
                LEFT JOIN organizations o ON t.organization_id = o.id
                WHERE wh.user_id = $1
            `;
            
            const params: any[] = [userId];
            let paramIndex = 2;

            if (category && category !== 'ALL') {
                query += ` AND wh.category = $${paramIndex}`;
                params.push(category);
                paramIndex++;
            }

            query += ' ORDER BY wh.completion_date DESC';

            if (limit) {
                query += ` LIMIT $${paramIndex}`;
                params.push(limit);
                paramIndex++;
            }

            if (offset) {
                query += ` OFFSET $${paramIndex}`;
                params.push(offset);
            }

            const result = await this.db.query(query, params);
            
            return result.rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                taskId: row.task_id,
                category: row.category,
                completionDate: row.completion_date,
                qualityScore: row.quality_score,
                clientFeedback: row.client_feedback,
                xpEarned: row.xp_earned,
                trustScoreChange: row.trust_score_change,
                rwisEarned: row.rwis_earned,
                taskTitle: row.task_title,
                taskDescription: row.task_description,
                organizationName: row.organization_name,
                skills: [], // This would need to be extracted from task requirements or separate skills table
                impact: row.client_feedback, // Using feedback as impact for now
                duration: '2 weeks', // This would need to be calculated from task data
                status: 'COMPLETED', // Default status
                rating: row.quality_score
            }));
        } catch (error) {
            console.error('Error fetching work history:', error);
            throw error;
        }
    }

    async getUserBadges(userId: string): Promise<Badge[]> {
        try {
            const result = await this.db.query(`
                SELECT 
                    b.*,
                    ua.earned_at
                FROM user_achievements ua
                JOIN badges b ON ua.badge_id = b.id
                WHERE ua.user_id = $1
                ORDER BY ua.earned_at DESC
            `, [userId]);

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                category: row.category,
                rarity: row.rarity,
                iconUrl: row.icon_url,
                earnedDate: row.earned_at,
                requirements: row.unlock_criteria?.description || 'Achievement unlocked'
            }));
        } catch (error) {
            console.error('Error fetching user badges:', error);
            throw error;
        }
    }

    async getCategoryStats(userId: string): Promise<Record<string, CategoryStats>> {
        try {
            const stats = await this.getUserStats(userId);
            if (!stats) {
                throw new Error('User stats not found');
            }

            // Calculate category-specific stats
            const categoryStats: Record<string, CategoryStats> = {
                FREELANCE: {
                    tasksCompleted: stats.categoryStats.freelance.tasksCompleted,
                    totalXP: stats.categoryStats.freelance.totalXP,
                    averageRating: stats.categoryStats.freelance.averageRating,
                    specializations: stats.categoryStats.freelance.specializations,
                    trustScore: Math.floor(stats.trustScore * 0.9), // Slightly lower for freelance
                    impactScore: Math.floor(stats.rwisScore * 0.6), // Lower impact score for freelance
                    level: Math.floor(stats.categoryStats.freelance.totalXP / 200) + 1,
                    nextLevelXP: (Math.floor(stats.categoryStats.freelance.totalXP / 200) + 1) * 200
                },
                COMMUNITY: {
                    tasksCompleted: stats.categoryStats.community.tasksCompleted,
                    totalXP: stats.categoryStats.community.totalXP,
                    averageRating: stats.categoryStats.community.averageRating,
                    specializations: stats.categoryStats.community.specializations,
                    trustScore: Math.floor(stats.trustScore * 1.1), // Higher trust for community work
                    impactScore: Math.floor(stats.rwisScore * 1.2), // Higher impact for community
                    level: Math.floor(stats.categoryStats.community.totalXP / 200) + 1,
                    nextLevelXP: (Math.floor(stats.categoryStats.community.totalXP / 200) + 1) * 200
                },
                CORPORATE: {
                    tasksCompleted: stats.categoryStats.corporate.tasksCompleted,
                    totalXP: stats.categoryStats.corporate.totalXP,
                    averageRating: stats.categoryStats.corporate.averageRating,
                    specializations: stats.categoryStats.corporate.specializations,
                    trustScore: Math.floor(stats.trustScore * 0.8), // Lower trust initially for corporate
                    impactScore: Math.floor(stats.rwisScore * 0.8), // Moderate impact for corporate
                    level: Math.floor(stats.categoryStats.corporate.totalXP / 200) + 1,
                    nextLevelXP: (Math.floor(stats.categoryStats.corporate.totalXP / 200) + 1) * 200
                }
            };

            return categoryStats;
        } catch (error) {
            console.error('Error calculating category stats:', error);
            throw error;
        }
    }

    async updateCharacterCustomization(userId: string, customizationData: any): Promise<void> {
        try {
            await this.db.query(
                'UPDATE users SET character_data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(customizationData), userId]
            );
        } catch (error) {
            console.error('Error updating character customization:', error);
            throw error;
        }
    }

    async getProfileAnalytics(userId: string, timeRange: 'week' | 'month' | 'year' = 'month'): Promise<any> {
        try {
            let dateFilter = '';
            switch (timeRange) {
                case 'week':
                    dateFilter = "AND completion_date >= NOW() - INTERVAL '7 days'";
                    break;
                case 'month':
                    dateFilter = "AND completion_date >= NOW() - INTERVAL '30 days'";
                    break;
                case 'year':
                    dateFilter = "AND completion_date >= NOW() - INTERVAL '365 days'";
                    break;
            }

            const result = await this.db.query(`
                SELECT 
                    category,
                    COUNT(*) as tasks_completed,
                    SUM(xp_earned) as total_xp,
                    SUM(rwis_earned) as total_rwis,
                    AVG(quality_score) as avg_rating,
                    DATE_TRUNC('day', completion_date) as completion_day
                FROM work_history 
                WHERE user_id = $1 ${dateFilter}
                GROUP BY category, DATE_TRUNC('day', completion_date)
                ORDER BY completion_day DESC
            `, [userId]);

            return {
                timeRange,
                data: result.rows,
                summary: {
                    totalTasks: result.rows.reduce((sum, row) => sum + parseInt(row.tasks_completed), 0),
                    totalXP: result.rows.reduce((sum, row) => sum + parseInt(row.total_xp || 0), 0),
                    totalRWIS: result.rows.reduce((sum, row) => sum + parseInt(row.total_rwis || 0), 0),
                    averageRating: result.rows.length > 0 
                        ? result.rows.reduce((sum, row) => sum + parseFloat(row.avg_rating || 0), 0) / result.rows.length 
                        : 0
                }
            };
        } catch (error) {
            console.error('Error fetching profile analytics:', error);
            throw error;
        }
    }

    async exportProfileData(userId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
        try {
            const profile = await this.getUserProfile(userId);
            const stats = await this.getUserStats(userId);
            const workHistory = await this.getWorkHistory(userId);
            const badges = await this.getUserBadges(userId);
            const categoryStats = await this.getCategoryStats(userId);

            const exportData = {
                profile,
                stats,
                workHistory,
                badges,
                categoryStats,
                exportedAt: new Date().toISOString()
            };

            if (format === 'json') {
                return exportData;
            } else if (format === 'csv') {
                // Convert to CSV format - simplified version
                const csvData = workHistory.map(item => ({
                    'Task Title': item.taskTitle,
                    'Category': item.category,
                    'Organization': item.organizationName,
                    'Completion Date': item.completionDate,
                    'Rating': item.rating,
                    'XP Earned': item.xpEarned,
                    'RWIS Earned': item.rwisEarned,
                    'Trust Score Change': item.trustScoreChange
                }));
                return csvData;
            }

            return exportData;
        } catch (error) {
            console.error('Error exporting profile data:', error);
            throw error;
        }
    }

    async getCategoryReputation(userId: string, category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'): Promise<any> {
        try {
            const stats = await this.getUserStats(userId);
            if (!stats) {
                throw new Error('User stats not found');
            }

            const categoryKey = category.toLowerCase() as 'freelance' | 'community' | 'corporate';
            const categoryStats = stats.categoryStats[categoryKey];

            return {
                category,
                reputation: {
                    score: categoryStats.averageRating * 20, // Convert 5-star to 100-point scale
                    level: Math.floor(categoryStats.totalXP / 200) + 1,
                    tasksCompleted: categoryStats.tasksCompleted,
                    specializations: categoryStats.specializations,
                    trustMultiplier: category === 'COMMUNITY' ? 1.2 : category === 'FREELANCE' ? 0.9 : 0.8
                }
            };
        } catch (error) {
            console.error('Error fetching category reputation:', error);
            throw error;
        }
    }

    async updateCategoryStats(userId: string, category: string, stats: any): Promise<void> {
        try {
            const currentStats = await this.getUserStats(userId);
            if (!currentStats) {
                throw new Error('User stats not found');
            }

            const updatedCategoryStats = {
                ...currentStats.categoryStats,
                [category]: {
                    ...currentStats.categoryStats[category as keyof typeof currentStats.categoryStats],
                    ...stats
                }
            };

            await this.db.query(
                'UPDATE user_stats SET category_stats = $1 WHERE user_id = $2',
                [JSON.stringify(updatedCategoryStats), userId]
            );
        } catch (error) {
            console.error('Error updating category stats:', error);
            throw error;
        }
    }

    async generateProfileExport(userId: string, format: string): Promise<any> {
        try {
            return await this.exportProfileData(userId, format as 'json' | 'csv');
        } catch (error) {
            console.error('Error generating profile export:', error);
            throw error;
        }
    }
}