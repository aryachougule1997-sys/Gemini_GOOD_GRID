import { InMemoryUserModel } from '../models/InMemoryUser';

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

// In-memory badge storage
const userBadges: Map<string, Badge[]> = new Map();

export class InMemoryProfileService {
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const user = await InMemoryUserModel.findById(userId);
            return user;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    async getUserStats(userId: string): Promise<UserStats | null> {
        try {
            return await InMemoryUserModel.getStats(userId);
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    async getUserBadges(userId: string): Promise<Badge[]> {
        try {
            return userBadges.get(userId) || [];
        } catch (error) {
            console.error('Error fetching user badges:', error);
            throw error;
        }
    }

    async addBadge(userId: string, badge: Omit<Badge, 'earnedDate'>): Promise<void> {
        try {
            const currentBadges = userBadges.get(userId) || [];
            const newBadge: Badge = {
                ...badge,
                earnedDate: new Date()
            };
            currentBadges.push(newBadge);
            userBadges.set(userId, currentBadges);
        } catch (error) {
            console.error('Error adding badge:', error);
            throw error;
        }
    }

    async updateCharacterCustomization(userId: string, customizationData: any): Promise<void> {
        try {
            await InMemoryUserModel.updateCharacterData(userId, customizationData);
        } catch (error) {
            console.error('Error updating character customization:', error);
            throw error;
        }
    }

    async updateCategoryStats(userId: string, category: string, stats: any): Promise<void> {
        try {
            const currentStats = await InMemoryUserModel.getStats(userId);
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

            await InMemoryUserModel.updateStats(userId, {
                categoryStats: updatedCategoryStats
            });
        } catch (error) {
            console.error('Error updating category stats:', error);
            throw error;
        }
    }

    async getCategoryReputation(userId: string, category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'): Promise<any> {
        try {
            const stats = await InMemoryUserModel.getStats(userId);
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

    async getWorkHistory(userId: string, category?: string, limit?: number, offset?: number): Promise<any[]> {
        // For demo purposes, return empty array
        // In a real implementation, this would fetch from work_history table
        return [];
    }

    async generateProfileExport(userId: string, format: string): Promise<any> {
        try {
            const profile = await this.getUserProfile(userId);
            const stats = await this.getUserStats(userId);
            const badges = await this.getUserBadges(userId);

            return {
                profile,
                stats,
                badges,
                exportedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating profile export:', error);
            throw error;
        }
    }
}