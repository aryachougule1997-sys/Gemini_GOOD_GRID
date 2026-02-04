import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    characterData: any;
    locationData: any;
    createdAt: string;
    updatedAt: string;
}

export interface UserStats {
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

export interface CategoryStats {
    tasksCompleted: number;
    totalXP: number;
    averageRating: number;
    specializations: string[];
    trustScore: number;
    impactScore: number;
    level: number;
    nextLevelXP: number;
}

export interface WorkHistoryItem {
    id: string;
    userId: string;
    taskId: string;
    category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
    completionDate: string;
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

export interface Badge {
    id: string;
    name: string;
    description: string;
    category: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    iconUrl: string;
    earnedDate: string;
    requirements: string;
}

export interface ProfileAnalytics {
    timeRange: 'week' | 'month' | 'year';
    data: Array<{
        category: string;
        tasks_completed: number;
        total_xp: number;
        total_rwis: number;
        avg_rating: number;
        completion_day: string;
    }>;
    summary: {
        totalTasks: number;
        totalXP: number;
        totalRWIS: number;
        averageRating: number;
    };
}

class ProfileService {
    private api = axios.create({
        baseURL: `${API_BASE_URL}/profile`,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Set auth token for requests
    setAuthToken(token: string) {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Get user profile
    async getUserProfile(userId: string): Promise<UserProfile> {
        try {
            const response = await this.api.get(`/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    // Get user stats
    async getUserStats(userId: string): Promise<UserStats> {
        try {
            const response = await this.api.get(`/${userId}/stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    // Get work history
    async getWorkHistory(
        userId: string,
        options?: {
            category?: string;
            limit?: number;
            offset?: number;
        }
    ): Promise<WorkHistoryItem[]> {
        try {
            const params = new URLSearchParams();
            if (options?.category) params.append('category', options.category);
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.offset) params.append('offset', options.offset.toString());

            const response = await this.api.get(`/${userId}/work-history?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching work history:', error);
            throw error;
        }
    }

    // Get user badges
    async getUserBadges(userId: string): Promise<Badge[]> {
        try {
            const response = await this.api.get(`/${userId}/badges`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user badges:', error);
            throw error;
        }
    }

    // Get category stats
    async getCategoryStats(userId: string): Promise<Record<string, CategoryStats>> {
        try {
            const response = await this.api.get(`/${userId}/category-stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category stats:', error);
            throw error;
        }
    }

    // Update character customization
    async updateCharacterCustomization(userId: string, customizationData: any): Promise<void> {
        try {
            await this.api.put(`/${userId}/character`, customizationData);
        } catch (error) {
            console.error('Error updating character customization:', error);
            throw error;
        }
    }

    // Get profile analytics
    async getProfileAnalytics(
        userId: string,
        timeRange: 'week' | 'month' | 'year' = 'month'
    ): Promise<ProfileAnalytics> {
        try {
            const response = await this.api.get(`/${userId}/analytics?timeRange=${timeRange}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching profile analytics:', error);
            throw error;
        }
    }

    // Export profile data
    async exportProfileData(userId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
        try {
            const response = await this.api.get(`/${userId}/export?format=${format}`, {
                responseType: format === 'csv' ? 'blob' : 'json'
            });

            if (format === 'csv') {
                // Create download link for CSV
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `profile-export-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
                return;
            }

            return response.data;
        } catch (error) {
            console.error('Error exporting profile data:', error);
            throw error;
        }
    }

    // Get comprehensive profile data (combines multiple endpoints)
    async getComprehensiveProfile(userId: string): Promise<{
        profile: UserProfile;
        stats: UserStats;
        workHistory: WorkHistoryItem[];
        badges: Badge[];
        categoryStats: Record<string, CategoryStats>;
    }> {
        try {
            const [profile, stats, workHistory, badges, categoryStats] = await Promise.all([
                this.getUserProfile(userId),
                this.getUserStats(userId),
                this.getWorkHistory(userId, { limit: 50 }),
                this.getUserBadges(userId),
                this.getCategoryStats(userId)
            ]);

            return {
                profile,
                stats,
                workHistory,
                badges,
                categoryStats
            };
        } catch (error) {
            console.error('Error fetching comprehensive profile:', error);
            throw error;
        }
    }

    // Search work history
    async searchWorkHistory(
        userId: string,
        searchTerm: string,
        filters?: {
            category?: string;
            dateFrom?: string;
            dateTo?: string;
            minRating?: number;
        }
    ): Promise<WorkHistoryItem[]> {
        try {
            const params = new URLSearchParams();
            params.append('search', searchTerm);
            if (filters?.category) params.append('category', filters.category);
            if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters?.dateTo) params.append('dateTo', filters.dateTo);
            if (filters?.minRating) params.append('minRating', filters.minRating.toString());

            const response = await this.api.get(`/${userId}/work-history/search?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error searching work history:', error);
            throw error;
        }
    }

    // Get profile completion percentage
    async getProfileCompletion(userId: string): Promise<{
        percentage: number;
        missingFields: string[];
        suggestions: string[];
    }> {
        try {
            const response = await this.api.get(`/${userId}/completion`);
            return response.data;
        } catch (error) {
            console.error('Error fetching profile completion:', error);
            throw error;
        }
    }

    // Get achievement progress
    async getAchievementProgress(userId: string): Promise<{
        availableBadges: Array<{
            id: string;
            name: string;
            description: string;
            progress: number;
            requirement: number;
            category: string;
        }>;
        nextMilestones: Array<{
            type: 'level' | 'trust' | 'rwis';
            current: number;
            target: number;
            progress: number;
        }>;
    }> {
        try {
            const response = await this.api.get(`/${userId}/achievement-progress`);
            return response.data;
        } catch (error) {
            console.error('Error fetching achievement progress:', error);
            throw error;
        }
    }
}

export const profileService = new ProfileService();