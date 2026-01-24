import { UserModel } from '../models/User';
import { WorkHistoryModel } from '../models/WorkHistory';
import { BadgeModel, UserAchievementModel } from '../models/Badge';
import { 
  UserStats, 
  WorkCategory, 
  TaskRewards, 
  Badge, 
  BadgeUnlockCriteria,
  WorkHistoryItem,
  CategoryStats
} from '../../../shared/types';

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

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  xpRequired: number;
  xpToNextLevel: number;
  unlockedFeatures: string[];
}

export interface ProgressionUpdate {
  xpResult: XPCalculationResult;
  trustScoreResult: TrustScoreCalculationResult;
  rwisResult: RWISCalculationResult;
  levelUpResult: LevelUpResult;
  badgesEarned: Badge[];
  zonesUnlocked: string[];
}

export class GamificationService {
  /**
   * Calculate XP reward for a completed task
   */
  static calculateXP(
    taskRewards: TaskRewards,
    category: WorkCategory,
    qualityScore: number = 3,
    completionTime: number = 1,
    userLevel: number = 1
  ): XPCalculationResult {
    const reasoning: string[] = [];
    
    // Base XP from task rewards
    let baseXP = taskRewards.xp || 0;
    reasoning.push(`Base XP from task: ${baseXP}`);
    
    // Category multipliers
    const categoryMultipliers = {
      FREELANCE: 1.0,
      COMMUNITY: 1.2, // Community work gets slight bonus
      CORPORATE: 1.1
    };
    
    baseXP = Math.floor(baseXP * categoryMultipliers[category]);
    reasoning.push(`Category multiplier (${category}): x${categoryMultipliers[category]}`);
    
    // Quality bonus (1-5 scale)
    let bonusXP = 0;
    if (qualityScore >= 4) {
      bonusXP += Math.floor(baseXP * 0.25); // 25% bonus for high quality
      reasoning.push(`High quality bonus (${qualityScore}/5): +${Math.floor(baseXP * 0.25)} XP`);
    } else if (qualityScore >= 3) {
      bonusXP += Math.floor(baseXP * 0.1); // 10% bonus for good quality
      reasoning.push(`Good quality bonus (${qualityScore}/5): +${Math.floor(baseXP * 0.1)} XP`);
    }
    
    // Early completion bonus (if completed faster than expected)
    if (completionTime < 1) {
      const timeBonus = Math.floor(baseXP * (1 - completionTime) * 0.2);
      bonusXP += timeBonus;
      reasoning.push(`Early completion bonus: +${timeBonus} XP`);
    }
    
    // Level scaling (higher level users get slightly less XP to prevent inflation)
    const levelScaling = Math.max(0.5, 1 - (userLevel - 1) * 0.02);
    const scaledXP = Math.floor((baseXP + bonusXP) * levelScaling);
    
    if (levelScaling < 1) {
      reasoning.push(`Level scaling (Level ${userLevel}): x${levelScaling.toFixed(2)}`);
    }
    
    return {
      baseXP,
      bonusXP,
      totalXP: scaledXP,
      reasoning
    };
  }

  /**
   * Calculate Trust Score change for a completed task
   */
  static calculateTrustScore(
    taskRewards: TaskRewards,
    category: WorkCategory,
    qualityScore: number = 3,
    onTime: boolean = true,
    clientFeedback?: string
  ): TrustScoreCalculationResult {
    const reasoning: string[] = [];
    
    // Base trust score from task rewards
    let baseTrustScore = taskRewards.trustScoreBonus || 0;
    reasoning.push(`Base trust score from task: ${baseTrustScore}`);
    
    // Quality impact on trust score
    let bonusTrustScore = 0;
    if (qualityScore >= 5) {
      bonusTrustScore += 3; // Excellent work
      reasoning.push(`Excellent quality (5/5): +3 trust score`);
    } else if (qualityScore >= 4) {
      bonusTrustScore += 2; // Good work
      reasoning.push(`Good quality (4/5): +2 trust score`);
    } else if (qualityScore >= 3) {
      bonusTrustScore += 1; // Satisfactory work
      reasoning.push(`Satisfactory quality (3/5): +1 trust score`);
    } else if (qualityScore < 3) {
      bonusTrustScore -= 2; // Poor quality penalizes trust
      reasoning.push(`Poor quality (${qualityScore}/5): -2 trust score`);
    }
    
    // On-time completion bonus
    if (onTime) {
      bonusTrustScore += 1;
      reasoning.push(`On-time completion: +1 trust score`);
    } else {
      bonusTrustScore -= 3;
      reasoning.push(`Late completion: -3 trust score`);
    }
    
    // Positive client feedback bonus
    if (clientFeedback && clientFeedback.length > 50) {
      bonusTrustScore += 1;
      reasoning.push(`Detailed client feedback: +1 trust score`);
    }
    
    // Category-specific adjustments
    if (category === 'COMMUNITY') {
      bonusTrustScore += 1; // Community work builds more trust
      reasoning.push(`Community work bonus: +1 trust score`);
    }
    
    const totalTrustScore = Math.max(0, baseTrustScore + bonusTrustScore);
    
    return {
      baseTrustScore,
      bonusTrustScore,
      totalTrustScore,
      reasoning
    };
  }

  /**
   * Calculate RWIS (Real-World Impact Score) for a completed task
   */
  static calculateRWIS(
    taskRewards: TaskRewards,
    category: WorkCategory,
    qualityScore: number = 3,
    taskComplexity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  ): RWISCalculationResult {
    const reasoning: string[] = [];
    
    // Base RWIS from task rewards
    let baseRWIS = taskRewards.rwisPoints || 0;
    reasoning.push(`Base RWIS from task: ${baseRWIS}`);
    
    // Category multipliers for real-world impact
    const categoryMultipliers = {
      FREELANCE: 1.0,
      COMMUNITY: 1.5, // Community work has higher real-world impact
      CORPORATE: 1.2
    };
    
    baseRWIS = Math.floor(baseRWIS * categoryMultipliers[category]);
    reasoning.push(`Category impact multiplier (${category}): x${categoryMultipliers[category]}`);
    
    // Quality impact on RWIS
    let bonusRWIS = 0;
    if (qualityScore >= 4) {
      bonusRWIS += Math.floor(baseRWIS * 0.3); // High quality increases impact
      reasoning.push(`High quality impact bonus: +${Math.floor(baseRWIS * 0.3)} RWIS`);
    }
    
    // Task complexity bonus
    const complexityMultipliers = {
      LOW: 1.0,
      MEDIUM: 1.2,
      HIGH: 1.5
    };
    
    const complexityBonus = Math.floor(baseRWIS * (complexityMultipliers[taskComplexity] - 1));
    bonusRWIS += complexityBonus;
    reasoning.push(`Task complexity bonus (${taskComplexity}): +${complexityBonus} RWIS`);
    
    return {
      baseRWIS,
      bonusRWIS,
      totalRWIS: baseRWIS + bonusRWIS,
      reasoning
    };
  }

  /**
   * Calculate level progression and check for level up
   */
  static calculateLevelProgression(currentXP: number, currentLevel: number): LevelUpResult {
    // XP required for each level (exponential growth)
    const getXPRequiredForLevel = (level: number): number => {
      return Math.floor(100 * Math.pow(1.5, level - 1));
    };
    
    // Calculate total XP required for current level
    let totalXPForCurrentLevel = 0;
    for (let i = 1; i < currentLevel; i++) {
      totalXPForCurrentLevel += getXPRequiredForLevel(i);
    }
    
    // Check if user has enough XP for next level
    let newLevel = currentLevel;
    let totalXPRequired = totalXPForCurrentLevel;
    
    while (currentXP >= totalXPRequired + getXPRequiredForLevel(newLevel)) {
      totalXPRequired += getXPRequiredForLevel(newLevel);
      newLevel++;
    }
    
    const xpToNextLevel = totalXPRequired + getXPRequiredForLevel(newLevel) - currentXP;
    const unlockedFeatures: string[] = [];
    
    // Define features unlocked at each level
    if (newLevel > currentLevel) {
      for (let level = currentLevel + 1; level <= newLevel; level++) {
        if (level === 5) unlockedFeatures.push('Advanced Task Filtering');
        if (level === 10) unlockedFeatures.push('Mentor Status');
        if (level === 15) unlockedFeatures.push('Custom Character Accessories');
        if (level === 20) unlockedFeatures.push('Zone Fast Travel');
        if (level === 25) unlockedFeatures.push('Expert Task Access');
        if (level % 10 === 0) unlockedFeatures.push(`Level ${level} Badge`);
      }
    }
    
    return {
      leveledUp: newLevel > currentLevel,
      newLevel,
      previousLevel: currentLevel,
      xpRequired: getXPRequiredForLevel(newLevel),
      xpToNextLevel,
      unlockedFeatures
    };
  }

  /**
   * Check and award badges based on user achievements
   */
  static async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) return [];
    
    const workHistory = await WorkHistoryModel.findByUser(userId);
    const categoryStats = await WorkHistoryModel.getUserCategoryStats(userId);
    const totalStats = await WorkHistoryModel.getUserTotalStats(userId);
    
    // Get badges user can unlock
    const unlockableBadges = await UserAchievementModel.checkUnlockableBadges(userId, {
      tasksCompleted: totalStats.totalTasks,
      trustScore: userStats.trustScore,
      categoryStats
    });
    
    const newBadges: Badge[] = [];
    
    for (const badge of unlockableBadges) {
      // Award the badge
      await UserAchievementModel.awardBadge(userId, badge.id);
      newBadges.push(badge);
    }
    
    return newBadges;
  }

  /**
   * Check for zone unlocks based on user progression
   */
  static async checkZoneUnlocks(userId: string): Promise<string[]> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) return [];
    
    const newUnlockedZones: string[] = [];
    
    // Define zone unlock criteria
    const zoneUnlockCriteria = [
      { zoneId: 'zone-2', trustScore: 25, level: 3 },
      { zoneId: 'zone-3', trustScore: 50, level: 5 },
      { zoneId: 'zone-4', trustScore: 100, level: 8 },
      { zoneId: 'zone-5', trustScore: 200, level: 12 },
      { zoneId: 'zone-6', trustScore: 400, level: 18 },
      { zoneId: 'zone-7', trustScore: 800, level: 25 }
    ];
    
    for (const criteria of zoneUnlockCriteria) {
      if (!userStats.unlockedZones.includes(criteria.zoneId) &&
          userStats.trustScore >= criteria.trustScore &&
          userStats.currentLevel >= criteria.level) {
        
        // Unlock the zone
        const updatedZones = [...userStats.unlockedZones, criteria.zoneId];
        await UserModel.updateStats(userId, { unlockedZones: updatedZones });
        newUnlockedZones.push(criteria.zoneId);
      }
    }
    
    return newUnlockedZones;
  }

  /**
   * Process complete progression update for a user after task completion
   */
  static async processProgressionUpdate(
    userId: string,
    taskRewards: TaskRewards,
    category: WorkCategory,
    qualityScore: number = 3,
    completionTime: number = 1,
    onTime: boolean = true,
    clientFeedback?: string,
    taskComplexity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  ): Promise<ProgressionUpdate> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) {
      throw new Error('User stats not found');
    }
    
    // Calculate all progression components
    const xpResult = this.calculateXP(taskRewards, category, qualityScore, completionTime, userStats.currentLevel);
    const trustScoreResult = this.calculateTrustScore(taskRewards, category, qualityScore, onTime, clientFeedback);
    const rwisResult = this.calculateRWIS(taskRewards, category, qualityScore, taskComplexity);
    
    // Update user stats
    const newXP = userStats.xpPoints + xpResult.totalXP;
    const newTrustScore = Math.max(0, userStats.trustScore + trustScoreResult.totalTrustScore);
    const newRWIS = userStats.rwisScore + rwisResult.totalRWIS;
    
    // Check for level up
    const levelUpResult = this.calculateLevelProgression(newXP, userStats.currentLevel);
    
    // Update category stats
    const updatedCategoryStats = { ...userStats.categoryStats };
    const categoryKey = category.toLowerCase() as keyof CategoryStats;
    updatedCategoryStats[categoryKey] = {
      ...updatedCategoryStats[categoryKey],
      tasksCompleted: updatedCategoryStats[categoryKey].tasksCompleted + 1,
      totalXP: updatedCategoryStats[categoryKey].totalXP + xpResult.totalXP,
      averageRating: qualityScore > 0 ? 
        ((updatedCategoryStats[categoryKey].averageRating * (updatedCategoryStats[categoryKey].tasksCompleted - 1)) + qualityScore) / updatedCategoryStats[categoryKey].tasksCompleted :
        updatedCategoryStats[categoryKey].averageRating
    };
    
    // Update user stats in database
    await UserModel.updateStats(userId, {
      xpPoints: newXP,
      trustScore: newTrustScore,
      rwisScore: newRWIS,
      currentLevel: levelUpResult.newLevel,
      categoryStats: updatedCategoryStats
    });
    
    // Check for new badges and zone unlocks
    const badgesEarned = await this.checkAndAwardBadges(userId);
    const zonesUnlocked = await this.checkZoneUnlocks(userId);
    
    return {
      xpResult,
      trustScoreResult,
      rwisResult,
      levelUpResult,
      badgesEarned,
      zonesUnlocked
    };
  }

  /**
   * Get user's current progression status
   */
  static async getUserProgressionStatus(userId: string): Promise<{
    stats: UserStats;
    levelProgress: {
      currentLevel: number;
      xpInCurrentLevel: number;
      xpRequiredForNextLevel: number;
      progressPercentage: number;
    };
    badges: Badge[];
    recentAchievements: any[];
  } | null> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) return null;
    
    // Calculate level progress
    const getXPRequiredForLevel = (level: number): number => {
      return Math.floor(100 * Math.pow(1.5, level - 1));
    };
    
    let totalXPForCurrentLevel = 0;
    for (let i = 1; i < userStats.currentLevel; i++) {
      totalXPForCurrentLevel += getXPRequiredForLevel(i);
    }
    
    const xpInCurrentLevel = userStats.xpPoints - totalXPForCurrentLevel;
    const xpRequiredForNextLevel = getXPRequiredForLevel(userStats.currentLevel);
    const progressPercentage = Math.min(100, (xpInCurrentLevel / xpRequiredForNextLevel) * 100);
    
    // Get user badges
    const achievements = await UserAchievementModel.findByUser(userId);
    const badges = achievements.map(achievement => achievement.badge!);
    
    // Get recent achievements (last 30 days)
    const recentAchievements = achievements
      .filter(achievement => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return achievement.earnedAt >= thirtyDaysAgo;
      })
      .slice(0, 10);
    
    return {
      stats: userStats,
      levelProgress: {
        currentLevel: userStats.currentLevel,
        xpInCurrentLevel,
        xpRequiredForNextLevel,
        progressPercentage
      },
      badges,
      recentAchievements
    };
  }

  /**
   * Get leaderboard data for a specific metric
   */
  static async getLeaderboard(
    metric: 'trustScore' | 'rwisScore' | 'xpPoints' | 'currentLevel',
    limit: number = 10,
    zoneId?: string
  ): Promise<Array<{
    userId: string;
    username: string;
    value: number;
    rank: number;
  }>> {
    let query = `
      SELECT 
        u.id as user_id,
        u.username,
        us.${metric} as value,
        ROW_NUMBER() OVER (ORDER BY us.${metric} DESC) as rank
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
    `;
    
    const params: any[] = [];
    
    if (zoneId) {
      query += ` WHERE $1 = ANY(us.unlocked_zones)`;
      params.push(zoneId);
    }
    
    query += ` ORDER BY us.${metric} DESC LIMIT ${params.length + 1}`;
    params.push(limit);
    
    const pool = require('../config/database').default;
    const result = await pool.query(query, params);
    
    return result.rows.map((row: any) => ({
      userId: row.user_id,
      username: row.username,
      value: parseInt(row.value),
      rank: parseInt(row.rank)
    }));
  }
}