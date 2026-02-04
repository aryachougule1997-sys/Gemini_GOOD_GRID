import { useState, useEffect, useCallback } from 'react';
import { 
    profileService, 
    UserProfile, 
    UserStats, 
    WorkHistoryItem, 
    Badge, 
    CategoryStats,
    ProfileAnalytics 
} from '../services/profileService';

interface UseProfileOptions {
    userId: string;
    autoFetch?: boolean;
}

interface UseProfileReturn {
    // Data
    profile: UserProfile | null;
    stats: UserStats | null;
    workHistory: WorkHistoryItem[];
    badges: Badge[];
    categoryStats: Record<string, CategoryStats> | null;
    analytics: ProfileAnalytics | null;
    
    // Loading states
    loading: boolean;
    profileLoading: boolean;
    statsLoading: boolean;
    workHistoryLoading: boolean;
    badgesLoading: boolean;
    analyticsLoading: boolean;
    
    // Error states
    error: string | null;
    profileError: string | null;
    statsError: string | null;
    workHistoryError: string | null;
    badgesError: string | null;
    analyticsError: string | null;
    
    // Actions
    fetchProfile: () => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchWorkHistory: (options?: { category?: string; limit?: number; offset?: number }) => Promise<void>;
    fetchBadges: () => Promise<void>;
    fetchCategoryStats: () => Promise<void>;
    fetchAnalytics: (timeRange?: 'week' | 'month' | 'year') => Promise<void>;
    fetchAll: () => Promise<void>;
    updateCharacterCustomization: (customizationData: any) => Promise<void>;
    exportProfile: (format?: 'json' | 'csv') => Promise<void>;
    searchWorkHistory: (searchTerm: string, filters?: any) => Promise<WorkHistoryItem[]>;
    
    // Computed values
    totalTasks: number;
    totalXP: number;
    totalRWIS: number;
    averageRating: number;
    profileCompletion: number;
}

export const useProfile = ({ userId, autoFetch = true }: UseProfileOptions): UseProfileReturn => {
    // Data states
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [categoryStats, setCategoryStats] = useState<Record<string, CategoryStats> | null>(null);
    const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [workHistoryLoading, setWorkHistoryLoading] = useState(false);
    const [badgesLoading, setBadgesLoading] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    
    // Error states
    const [error, setError] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [workHistoryError, setWorkHistoryError] = useState<string | null>(null);
    const [badgesError, setBadgesError] = useState<string | null>(null);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);

    // Fetch profile data
    const fetchProfile = useCallback(async () => {
        if (!userId) return;
        
        setProfileLoading(true);
        setProfileError(null);
        
        try {
            const profileData = await profileService.getUserProfile(userId);
            setProfile(profileData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
            setProfileError(errorMessage);
            console.error('Error fetching profile:', err);
        } finally {
            setProfileLoading(false);
        }
    }, [userId]);

    // Fetch user stats
    const fetchStats = useCallback(async () => {
        if (!userId) return;
        
        setStatsLoading(true);
        setStatsError(null);
        
        try {
            const statsData = await profileService.getUserStats(userId);
            setStats(statsData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
            setStatsError(errorMessage);
            console.error('Error fetching stats:', err);
        } finally {
            setStatsLoading(false);
        }
    }, [userId]);

    // Fetch work history
    const fetchWorkHistory = useCallback(async (options?: { category?: string; limit?: number; offset?: number }) => {
        if (!userId) return;
        
        setWorkHistoryLoading(true);
        setWorkHistoryError(null);
        
        try {
            const workHistoryData = await profileService.getWorkHistory(userId, options);
            setWorkHistory(workHistoryData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work history';
            setWorkHistoryError(errorMessage);
            console.error('Error fetching work history:', err);
        } finally {
            setWorkHistoryLoading(false);
        }
    }, [userId]);

    // Fetch badges
    const fetchBadges = useCallback(async () => {
        if (!userId) return;
        
        setBadgesLoading(true);
        setBadgesError(null);
        
        try {
            const badgesData = await profileService.getUserBadges(userId);
            setBadges(badgesData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch badges';
            setBadgesError(errorMessage);
            console.error('Error fetching badges:', err);
        } finally {
            setBadgesLoading(false);
        }
    }, [userId]);

    // Fetch category stats
    const fetchCategoryStats = useCallback(async () => {
        if (!userId) return;
        
        try {
            const categoryStatsData = await profileService.getCategoryStats(userId);
            setCategoryStats(categoryStatsData);
        } catch (err) {
            console.error('Error fetching category stats:', err);
        }
    }, [userId]);

    // Fetch analytics
    const fetchAnalytics = useCallback(async (timeRange: 'week' | 'month' | 'year' = 'month') => {
        if (!userId) return;
        
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        
        try {
            const analyticsData = await profileService.getProfileAnalytics(userId, timeRange);
            setAnalytics(analyticsData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
            setAnalyticsError(errorMessage);
            console.error('Error fetching analytics:', err);
        } finally {
            setAnalyticsLoading(false);
        }
    }, [userId]);

    // Fetch all data
    const fetchAll = useCallback(async () => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const comprehensiveData = await profileService.getComprehensiveProfile(userId);
            setProfile(comprehensiveData.profile);
            setStats(comprehensiveData.stats);
            setWorkHistory(comprehensiveData.workHistory);
            setBadges(comprehensiveData.badges);
            setCategoryStats(comprehensiveData.categoryStats);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile data';
            setError(errorMessage);
            console.error('Error fetching comprehensive profile:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Update character customization
    const updateCharacterCustomization = useCallback(async (customizationData: any) => {
        if (!userId) return;
        
        try {
            await profileService.updateCharacterCustomization(userId, customizationData);
            // Refresh profile data to get updated character data
            await fetchProfile();
        } catch (err) {
            console.error('Error updating character customization:', err);
            throw err;
        }
    }, [userId, fetchProfile]);

    // Export profile
    const exportProfile = useCallback(async (format: 'json' | 'csv' = 'json') => {
        if (!userId) return;
        
        try {
            await profileService.exportProfileData(userId, format);
        } catch (err) {
            console.error('Error exporting profile:', err);
            throw err;
        }
    }, [userId]);

    // Search work history
    const searchWorkHistory = useCallback(async (searchTerm: string, filters?: any): Promise<WorkHistoryItem[]> => {
        if (!userId) return [];
        
        try {
            return await profileService.searchWorkHistory(userId, searchTerm, filters);
        } catch (err) {
            console.error('Error searching work history:', err);
            throw err;
        }
    }, [userId]);

    // Computed values
    const totalTasks = workHistory.length;
    const totalXP = stats?.xpPoints || 0;
    const totalRWIS = stats?.rwisScore || 0;
    const averageRating = workHistory.length > 0 
        ? workHistory.reduce((sum, item) => sum + item.rating, 0) / workHistory.length 
        : 0;
    
    // Calculate profile completion percentage
    const profileCompletion = profile ? 
        Object.values(profile).filter(value => value !== null && value !== undefined && value !== '').length / 
        Object.keys(profile).length * 100 : 0;

    // Auto-fetch data on mount
    useEffect(() => {
        if (autoFetch && userId) {
            fetchAll();
        }
    }, [autoFetch, userId, fetchAll]);

    return {
        // Data
        profile,
        stats,
        workHistory,
        badges,
        categoryStats,
        analytics,
        
        // Loading states
        loading,
        profileLoading,
        statsLoading,
        workHistoryLoading,
        badgesLoading,
        analyticsLoading,
        
        // Error states
        error,
        profileError,
        statsError,
        workHistoryError,
        badgesError,
        analyticsError,
        
        // Actions
        fetchProfile,
        fetchStats,
        fetchWorkHistory,
        fetchBadges,
        fetchCategoryStats,
        fetchAnalytics,
        fetchAll,
        updateCharacterCustomization,
        exportProfile,
        searchWorkHistory,
        
        // Computed values
        totalTasks,
        totalXP,
        totalRWIS,
        averageRating,
        profileCompletion
    };
};