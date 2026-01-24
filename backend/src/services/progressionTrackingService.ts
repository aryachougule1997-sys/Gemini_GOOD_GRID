import { UserModel } from '../models/User';
import { WorkHistoryModel } from '../models/WorkHistory';
import { UserAchievementModel } from '../models/Badge';
import { UserStats, WorkCategory } from '../../../shared/types';

export interface MilestoneProgress {
  id: string;
  name: string;
  description: string;
  category: 'XP' | 'TRUST_SCORE' | 'RWIS' | 'TASKS' | 'CATEGORY' | 'LEVEL';
  currentValue: number;
  targetValue: number;
  progress: number; // 0-100 percentage
  completed: boolean;
  reward?: {
    xp?: number;
    trustScore?: number;
    badge?: string;
    zoneUnlock?: string;
  };
}

export interface ProgressionSummary {
  userId: string;
  overallProgress: {
    level: number;
    xp: number;
    trustScore: number;
    rwisScore: number;
    totalTasks: number;
  };
  milestones: {
    active: MilestoneProgress[];
    completed: MilestoneProgress[];
    upcoming: MilestoneProgress[];
  };
  categoryProgress: {
    freelance: CategoryProgress;
    community: CategoryProgress;
    corporate: CategoryProgress;
  };
  achievements: {
    totalBadges: number;
    recentBadges: any[];
    nextBadges: any[];
  };
}

export interface CategoryProgress {
  tasksCompleted: number;
  totalXP: number;
  averageRating: number;
  specializations: string[];
  nextMilestone?: MilestoneProgress;
}

export class ProgressionTrackingService {
  /**
   * Get comprehensive progression summary for a user
   */
  static async getUserProgressionSummary(userId: string): Promise<ProgressionSummary | null> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) return null;

    const totalStats = await WorkHistoryModel.getUserTotalStats(userId);
    const categoryStats = await WorkHistoryModel.getUserCategoryStats(userId);
    const achievements = await UserAchievementModel.findByUser(userId);

    // Get all milestones
    const allMilestones = await this.getAllMilestones(userStats, totalStats, categoryStats);
    
    // Categorize milestones
    const activeMilestones = allMilestones.filter(m => !m.completed && m.progress > 0);
    const completedMilestones = allMilestones.filter(m => m.completed);
    const upcomingMilestones = allMilestones.filter(m => !m.completed && m.progress === 0).slice(0, 5);

    // Get recent badges (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBadges = achievements.filter(a => a.earnedAt >= sevenDaysAgo);

    // Get next possible badges
    const nextBadges = await UserAchievementModel.checkUnlockableBadges(userId, {
      tasksCompleted: totalStats.totalTasks,
      trustScore: userStats.trustScore,
      categoryStats
    });

    return {
      userId,
      overallProgress: {
        level: userStats.currentLevel,
        xp: userStats.xpPoints,
        trustScore: userStats.trustScore,
        rwisScore: userStats.rwisScore,
        totalTasks: totalStats.totalTasks
      },
      milestones: {
        active: activeMilestones,
        completed: completedMilestones.slice(-10), // Last 10 completed
        upcoming: upcomingMilestones
      },
      categoryProgress: {
        freelance: {
          ...categoryStats.freelance,
          specializations: [],
          nextMilestone: this.getNextCategoryMilestone('freelance', categoryStats.freelance.tasksCompleted)
        },
        community: {
          ...categoryStats.community,
          specializations: [],
          nextMilestone: this.getNextCategoryMilestone('community', categoryStats.community.tasksCompleted)
        },
        corporate: {
          ...categoryStats.corporate,
          specializations: [],
          nextMilestone: this.getNextCategoryMilestone('corporate', categoryStats.corporate.tasksCompleted)
        }
      },
      achievements: {
        totalBadges: achievements.length,
        recentBadges: recentBadges.slice(0, 5),
        nextBadges: nextBadges.slice(0, 3)
      }
    };
  }

  /**
   * Get all milestone definitions and their current progress
   */
  private static async getAllMilestones(
    userStats: UserStats,
    totalStats: any,
    categoryStats: any
  ): Promise<MilestoneProgress[]> {
    const milestones: MilestoneProgress[] = [];

    // XP Milestones
    const xpMilestones = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
    xpMilestones.forEach((target, index) => {
      milestones.push({
        id: `xp-${target}`,
        name: `XP Milestone ${target}`,
        description: `Earn ${target.toLocaleString()} total XP`,
        category: 'XP',
        currentValue: userStats.xpPoints,
        targetValue: target,
        progress: Math.min(100, (userStats.xpPoints / target) * 100),
        completed: userStats.xpPoints >= target,
        reward: {
          xp: Math.floor(target * 0.1),
          badge: index >= 5 ? `XP Master ${target}` : undefined
        }
      });
    });

    // Trust Score Milestones
    const trustMilestones = [10, 25, 50, 100, 200, 400, 800, 1600];
    trustMilestones.forEach((target, index) => {
      milestones.push({
        id: `trust-${target}`,
        name: `Trust Level ${target}`,
        description: `Reach ${target} Trust Score`,
        category: 'TRUST_SCORE',
        currentValue: userStats.trustScore,
        targetValue: target,
        progress: Math.min(100, (userStats.trustScore / target) * 100),
        completed: userStats.trustScore >= target,
        reward: {
          trustScore: Math.floor(target * 0.05),
          zoneUnlock: index >= 2 ? `zone-${index}` : undefined
        }
      });
    });

    // RWIS Milestones
    const rwisMilestones = [50, 100, 250, 500, 1000, 2500, 5000, 10000];
    rwisMilestones.forEach((target) => {
      milestones.push({
        id: `rwis-${target}`,
        name: `Impact Score ${target}`,
        description: `Achieve ${target.toLocaleString()} Real-World Impact Score`,
        category: 'RWIS',
        currentValue: userStats.rwisScore,
        targetValue: target,
        progress: Math.min(100, (userStats.rwisScore / target) * 100),
        completed: userStats.rwisScore >= target,
        reward: {
          xp: Math.floor(target * 0.2),
          badge: target >= 1000 ? `Impact Champion ${target}` : undefined
        }
      });
    });

    // Task Completion Milestones
    const taskMilestones = [1, 5, 10, 25, 50, 100, 200, 500, 1000];
    taskMilestones.forEach((target, index) => {
      milestones.push({
        id: `tasks-${target}`,
        name: `Task Milestone ${target}`,
        description: `Complete ${target} total tasks`,
        category: 'TASKS',
        currentValue: totalStats.totalTasks,
        targetValue: target,
        progress: Math.min(100, (totalStats.totalTasks / target) * 100),
        completed: totalStats.totalTasks >= target,
        reward: {
          xp: target * 10,
          badge: index >= 3 ? `Task Master ${target}` : undefined
        }
      });
    });

    // Level Milestones
    const levelMilestones = [5, 10, 15, 20, 25, 30, 40, 50];
    levelMilestones.forEach((target) => {
      milestones.push({
        id: `level-${target}`,
        name: `Level ${target}`,
        description: `Reach level ${target}`,
        category: 'LEVEL',
        currentValue: userStats.currentLevel,
        targetValue: target,
        progress: Math.min(100, (userStats.currentLevel / target) * 100),
        completed: userStats.currentLevel >= target,
        reward: {
          xp: target * 50,
          badge: `Level ${target} Master`
        }
      });
    });

    // Category-specific milestones
    const categories: Array<{ key: keyof typeof categoryStats; name: string }> = [
      { key: 'freelance', name: 'Freelance' },
      { key: 'community', name: 'Community' },
      { key: 'corporate', name: 'Corporate' }
    ];

    categories.forEach(({ key, name }) => {
      const categoryMilestones = [5, 10, 20, 35, 50, 75, 100];
      categoryMilestones.forEach((target) => {
        milestones.push({
          id: `${String(key)}-${target}`,
          name: `${name} Specialist ${target}`,
          description: `Complete ${target} ${name.toLowerCase()} tasks`,
          category: 'CATEGORY',
          currentValue: categoryStats[key].tasksCompleted,
          targetValue: target,
          progress: Math.min(100, (categoryStats[key].tasksCompleted / target) * 100),
          completed: categoryStats[key].tasksCompleted >= target,
          reward: {
            xp: target * 15,
            badge: target >= 20 ? `${name} Expert ${target}` : undefined
          }
        });
      });
    });

    return milestones;
  }

  /**
   * Get the next milestone for a specific category
   */
  private static getNextCategoryMilestone(category: string, currentTasks: number): MilestoneProgress | undefined {
    const milestones = [5, 10, 20, 35, 50, 75, 100, 150, 200];
    const nextTarget = milestones.find(target => target > currentTasks);
    
    if (!nextTarget) return undefined;

    return {
      id: `${category}-${nextTarget}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Specialist ${nextTarget}`,
      description: `Complete ${nextTarget} ${category} tasks`,
      category: 'CATEGORY',
      currentValue: currentTasks,
      targetValue: nextTarget,
      progress: (currentTasks / nextTarget) * 100,
      completed: false,
      reward: {
        xp: nextTarget * 15,
        badge: nextTarget >= 20 ? `${category} Expert ${nextTarget}` : undefined
      }
    };
  }

  /**
   * Track daily activity for consistency badges
   */
  static async trackDailyActivity(userId: string): Promise<void> {
    // This would typically be called when a user completes a task
    // Store daily activity data for consistency tracking
    const today = new Date().toISOString().split('T')[0];
    
    // Implementation would store daily activity in a separate table
    // For now, we'll use a simple approach with user stats
    const userStats = await UserModel.getStats(userId);
    if (!userStats) return;

    // Update category stats to include daily activity tracking
    // This is a simplified implementation
    const updatedStats = { ...userStats.categoryStats };
    
    await UserModel.updateStats(userId, {
      categoryStats: updatedStats
    });
  }

  /**
   * Check for milestone completions and award rewards
   */
  static async checkMilestoneCompletions(userId: string): Promise<MilestoneProgress[]> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) return [];

    const totalStats = await WorkHistoryModel.getUserTotalStats(userId);
    const categoryStats = await WorkHistoryModel.getUserCategoryStats(userId);
    
    const allMilestones = await this.getAllMilestones(userStats, totalStats, categoryStats);
    const newlyCompleted = allMilestones.filter(m => 
      m.completed && m.progress === 100 && m.currentValue === m.targetValue
    );

    // Award rewards for newly completed milestones
    for (const milestone of newlyCompleted) {
      if (milestone.reward) {
        if (milestone.reward.xp) {
          await UserModel.updateStats(userId, {
            xpPoints: userStats.xpPoints + milestone.reward.xp
          });
        }
        
        if (milestone.reward.trustScore) {
          await UserModel.updateStats(userId, {
            trustScore: userStats.trustScore + milestone.reward.trustScore
          });
        }
        
        // Badge rewards would be handled by the badge system
        // Zone unlocks would be handled by the zone system
      }
    }

    return newlyCompleted;
  }

  /**
   * Get user's progress towards next level
   */
  static async getLevelProgress(userId: string): Promise<{
    currentLevel: number;
    currentXP: number;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    progressToNextLevel: number;
    xpNeeded: number;
  } | null> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) return null;

    const getXPRequiredForLevel = (level: number): number => {
      return Math.floor(100 * Math.pow(1.5, level - 1));
    };

    // Calculate total XP required for current level
    let xpForCurrentLevel = 0;
    for (let i = 1; i < userStats.currentLevel; i++) {
      xpForCurrentLevel += getXPRequiredForLevel(i);
    }

    const xpForNextLevel = xpForCurrentLevel + getXPRequiredForLevel(userStats.currentLevel);
    const xpInCurrentLevel = userStats.xpPoints - xpForCurrentLevel;
    const xpRequiredForCurrentLevel = getXPRequiredForLevel(userStats.currentLevel);
    const progressToNextLevel = (xpInCurrentLevel / xpRequiredForCurrentLevel) * 100;
    const xpNeeded = xpRequiredForCurrentLevel - xpInCurrentLevel;

    return {
      currentLevel: userStats.currentLevel,
      currentXP: userStats.xpPoints,
      xpForCurrentLevel,
      xpForNextLevel,
      progressToNextLevel: Math.min(100, progressToNextLevel),
      xpNeeded: Math.max(0, xpNeeded)
    };
  }

  /**
   * Get category-specific progress and recommendations
   */
  static async getCategoryRecommendations(userId: string): Promise<{
    recommendations: Array<{
      category: WorkCategory;
      reason: string;
      nextMilestone: string;
      tasksNeeded: number;
    }>;
    balanceScore: number; // 0-100, higher means more balanced across categories
  }> {
    const categoryStats = await WorkHistoryModel.getUserCategoryStats(userId);
    
    const recommendations: Array<{
      category: WorkCategory;
      reason: string;
      nextMilestone: string;
      tasksNeeded: number;
    }> = [];

    // Find the category with the least tasks
    const categories = [
      { category: 'FREELANCE' as WorkCategory, tasks: categoryStats.freelance.tasksCompleted },
      { category: 'COMMUNITY' as WorkCategory, tasks: categoryStats.community.tasksCompleted },
      { category: 'CORPORATE' as WorkCategory, tasks: categoryStats.corporate.tasksCompleted }
    ];

    categories.sort((a, b) => a.tasks - b.tasks);
    const leastUsedCategory = categories[0];
    const mostUsedCategory = categories[2];

    // Recommend balancing if there's a significant difference
    if (mostUsedCategory.tasks - leastUsedCategory.tasks >= 5) {
      const nextMilestone = [5, 10, 20, 35, 50, 75, 100].find(m => m > leastUsedCategory.tasks) || 100;
      recommendations.push({
        category: leastUsedCategory.category,
        reason: `Balance your experience across all work categories`,
        nextMilestone: `${leastUsedCategory.category.toLowerCase()} specialist ${nextMilestone}`,
        tasksNeeded: nextMilestone - leastUsedCategory.tasks
      });
    }

    // Calculate balance score
    const totalTasks = categories.reduce((sum, cat) => sum + cat.tasks, 0);
    if (totalTasks === 0) {
      return { recommendations, balanceScore: 100 };
    }

    const idealPercentage = 33.33;
    const actualPercentages = categories.map(cat => (cat.tasks / totalTasks) * 100);
    const deviations = actualPercentages.map(pct => Math.abs(pct - idealPercentage));
    const averageDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / 3;
    const balanceScore = Math.max(0, 100 - (averageDeviation * 3));

    return {
      recommendations,
      balanceScore: Math.round(balanceScore)
    };
  }
}