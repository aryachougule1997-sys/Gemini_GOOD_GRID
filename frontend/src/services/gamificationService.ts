import { ApiResponse } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface UserProgressionStatus {
  stats: {
    userId: string;
    trustScore: number;
    rwisScore: number;
    xpPoints: number;
    currentLevel: number;
    unlockedZones: string[];
    categoryStats: {
      freelance: CategoryMetrics;
      community: CategoryMetrics;
      corporate: CategoryMetrics;
    };
  };
  levelProgress: {
    currentLevel: number;
    xpInCurrentLevel: number;
    xpRequiredForNextLevel: number;
    progressPercentage: number;
  };
  badges: Badge[];
  recentAchievements: any[];
}

export interface CategoryMetrics {
  tasksCompleted: number;
  totalXP: number;
  averageRating: number;
  specializations: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'SKILL' | 'ACHIEVEMENT' | 'CATEGORY' | 'SPECIAL';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  iconUrl?: string;
  unlockCriteria: any;
  createdAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  value: number;
  rank: number;
}

export interface XPCalculationResult {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  reasoning: string[];
}

export interface TrustScoreCalculationResult {
  baseTrustScore: number;
  bonusTrustScore: number;
  totalTrustScore: number;
  reasoning: string[];
}

export interface RWISCalculationResult {
  baseRWIS: number;
  bonusRWIS: number;
  totalRWIS: number;
  reasoning: string[];
}

export class GamificationService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Get user's progression status
   */
  static async getUserProgression(userId: string): Promise<UserProgressionStatus> {
    const response = await fetch(`${API_BASE_URL}/gamification/progression/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user progression: ${response.statusText}`);
    }

    const data: ApiResponse<UserProgressionStatus> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch user progression');
    }

    return data.data!;
  }

  /**
   * Get comprehensive progression summary
   */
  static async getProgressionSummary(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/gamification/summary/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch progression summary: ${response.statusText}`);
    }

    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch progression summary');
    }

    return data.data!;
  }

  /**
   * Get level progress for a user
   */
  static async getLevelProgress(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/gamification/level-progress/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch level progress: ${response.statusText}`);
    }

    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch level progress');
    }

    return data.data!;
  }

  /**
   * Get category recommendations
   */
  static async getCategoryRecommendations(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/gamification/recommendations/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
    }

    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch recommendations');
    }

    return data.data!;
  }

  /**
   * Get leaderboard data
   */
  static async getLeaderboard(
    metric: 'trustScore' | 'rwisScore' | 'xpPoints' | 'currentLevel' = 'trustScore',
    limit: number = 10,
    zone?: string
  ): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams({
      metric,
      limit: limit.toString(),
      ...(zone && { zone })
    });

    const response = await fetch(`${API_BASE_URL}/gamification/leaderboard?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }

    const data: ApiResponse<LeaderboardEntry[]> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch leaderboard');
    }

    return data.data!;
  }

  /**
   * Get all available badges
   */
  static async getBadges(category?: string, rarity?: string): Promise<Badge[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (rarity) params.append('rarity', rarity);

    const response = await fetch(`${API_BASE_URL}/gamification/badges?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch badges: ${response.statusText}`);
    }

    const data: ApiResponse<Badge[]> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch badges');
    }

    return data.data!;
  }

  /**
   * Get user's badges
   */
  static async getUserBadges(userId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/gamification/badges/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user badges: ${response.statusText}`);
    }

    const data: ApiResponse<any[]> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch user badges');
    }

    return data.data!;
  }

  /**
   * Calculate XP for a task
   */
  static async calculateXP(params: {
    taskRewards: any;
    category: string;
    qualityScore?: number;
    completionTime?: number;
    userLevel?: number;
  }): Promise<XPCalculationResult> {
    const response = await fetch(`${API_BASE_URL}/gamification/calculate-xp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate XP: ${response.statusText}`);
    }

    const data: ApiResponse<XPCalculationResult> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to calculate XP');
    }

    return data.data!;
  }

  /**
   * Calculate Trust Score for a task
   */
  static async calculateTrustScore(params: {
    taskRewards: any;
    category: string;
    qualityScore?: number;
    onTime?: boolean;
    clientFeedback?: string;
  }): Promise<TrustScoreCalculationResult> {
    const response = await fetch(`${API_BASE_URL}/gamification/calculate-trust-score`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate trust score: ${response.statusText}`);
    }

    const data: ApiResponse<TrustScoreCalculationResult> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to calculate trust score');
    }

    return data.data!;
  }

  /**
   * Calculate RWIS for a task
   */
  static async calculateRWIS(params: {
    taskRewards: any;
    category: string;
    qualityScore?: number;
    taskComplexity?: 'LOW' | 'MEDIUM' | 'HIGH';
  }): Promise<RWISCalculationResult> {
    const response = await fetch(`${API_BASE_URL}/gamification/calculate-rwis`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate RWIS: ${response.statusText}`);
    }

    const data: ApiResponse<RWISCalculationResult> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to calculate RWIS');
    }

    return data.data!;
  }
}