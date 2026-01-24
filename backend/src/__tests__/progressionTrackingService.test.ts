import { ProgressionTrackingService } from '../services/progressionTrackingService';

// Mock the dependencies
jest.mock('../models/User');
jest.mock('../models/WorkHistory');
jest.mock('../models/Badge');

import { UserModel } from '../models/User';
import { WorkHistoryModel } from '../models/WorkHistory';
import { UserAchievementModel } from '../models/Badge';

const mockUserStats = {
  userId: 'test-user-id',
  trustScore: 75,
  rwisScore: 150,
  xpPoints: 500,
  currentLevel: 3,
  unlockedZones: ['zone-1', 'zone-2'],
  categoryStats: {
    freelance: { tasksCompleted: 10, totalXP: 200, averageRating: 4.2, specializations: [] },
    community: { tasksCompleted: 15, totalXP: 250, averageRating: 4.5, specializations: [] },
    corporate: { tasksCompleted: 5, totalXP: 100, averageRating: 3.8, specializations: [] }
  }
};

const mockTotalStats = {
  totalTasks: 30,
  totalXP: 550,
  totalRWIS: 150,
  averageRating: 4.2,
  totalTrustScoreChange: 75
};

const mockCategoryStats = {
  freelance: { tasksCompleted: 10, totalXP: 200, averageRating: 4.2 },
  community: { tasksCompleted: 15, totalXP: 250, averageRating: 4.5 },
  corporate: { tasksCompleted: 5, totalXP: 100, averageRating: 3.8 }
};

const mockAchievements = [
  {
    id: 'achievement-1',
    userId: 'test-user-id',
    badgeId: 'badge-1',
    earnedAt: new Date(),
    badge: {
      id: 'badge-1',
      name: 'First Steps',
      description: 'Complete your first task',
      category: 'ACHIEVEMENT' as const,
      rarity: 'COMMON' as const,
      unlockCriteria: { tasksCompleted: 1 },
      createdAt: new Date()
    }
  }
];

describe('ProgressionTrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (UserModel.getStats as jest.Mock).mockResolvedValue(mockUserStats);
    (WorkHistoryModel.getUserTotalStats as jest.Mock).mockResolvedValue(mockTotalStats);
    (WorkHistoryModel.getUserCategoryStats as jest.Mock).mockResolvedValue(mockCategoryStats);
    (UserAchievementModel.findByUser as jest.Mock).mockResolvedValue(mockAchievements);
    (UserAchievementModel.checkUnlockableBadges as jest.Mock).mockResolvedValue([]);
  });

  describe('getUserProgressionSummary', () => {
    it('should return comprehensive progression summary', async () => {
      const result = await ProgressionTrackingService.getUserProgressionSummary('test-user-id');

      expect(result).toBeDefined();
      expect(result!.userId).toBe('test-user-id');
      expect(result!.overallProgress.level).toBe(3);
      expect(result!.overallProgress.xp).toBe(500);
      expect(result!.overallProgress.trustScore).toBe(75);
      expect(result!.overallProgress.rwisScore).toBe(150);
      expect(result!.overallProgress.totalTasks).toBe(30);
    });

    it('should categorize milestones correctly', async () => {
      const result = await ProgressionTrackingService.getUserProgressionSummary('test-user-id');

      expect(result!.milestones.active).toBeDefined();
      expect(result!.milestones.completed).toBeDefined();
      expect(result!.milestones.upcoming).toBeDefined();

      // Should have some active milestones (partially completed)
      expect(result!.milestones.active.length).toBeGreaterThan(0);
      
      // Should have some completed milestones
      expect(result!.milestones.completed.length).toBeGreaterThan(0);
    });

    it('should include category progress with next milestones', async () => {
      const result = await ProgressionTrackingService.getUserProgressionSummary('test-user-id');

      expect(result!.categoryProgress.freelance.tasksCompleted).toBe(10);
      expect(result!.categoryProgress.community.tasksCompleted).toBe(15);
      expect(result!.categoryProgress.corporate.tasksCompleted).toBe(5);

      // Should have next milestones for each category
      expect(result!.categoryProgress.freelance.nextMilestone).toBeDefined();
      expect(result!.categoryProgress.community.nextMilestone).toBeDefined();
      expect(result!.categoryProgress.corporate.nextMilestone).toBeDefined();
    });

    it('should return null for non-existent user', async () => {
      (UserModel.getStats as jest.Mock).mockResolvedValue(null);

      const result = await ProgressionTrackingService.getUserProgressionSummary('non-existent-user');
      expect(result).toBeNull();
    });
  });

  describe('getLevelProgress', () => {
    it('should calculate level progress correctly', async () => {
      const result = await ProgressionTrackingService.getLevelProgress('test-user-id');

      expect(result).toBeDefined();
      expect(result!.currentLevel).toBe(3);
      expect(result!.currentXP).toBe(500);
      expect(result!.progressToNextLevel).toBeGreaterThanOrEqual(0);
      expect(result!.progressToNextLevel).toBeLessThanOrEqual(100);
      expect(result!.xpNeeded).toBeGreaterThanOrEqual(0);
    });

    it('should return null for non-existent user', async () => {
      (UserModel.getStats as jest.Mock).mockResolvedValue(null);

      const result = await ProgressionTrackingService.getLevelProgress('non-existent-user');
      expect(result).toBeNull();
    });

    it('should handle edge case of exactly at level boundary', async () => {
      // Mock user with exact XP for level boundary
      const exactLevelStats = {
        ...mockUserStats,
        xpPoints: 100, // Exactly level 1 requirement
        currentLevel: 1
      };
      (UserModel.getStats as jest.Mock).mockResolvedValue(exactLevelStats);

      const result = await ProgressionTrackingService.getLevelProgress('test-user-id');

      expect(result!.progressToNextLevel).toBe(100);
      expect(result!.xpNeeded).toBe(0);
    });
  });

  describe('getCategoryRecommendations', () => {
    it('should recommend balancing categories', async () => {
      const result = await ProgressionTrackingService.getCategoryRecommendations('test-user-id');

      expect(result.recommendations).toBeDefined();
      expect(result.balanceScore).toBeGreaterThanOrEqual(0);
      expect(result.balanceScore).toBeLessThanOrEqual(100);

      // Should recommend corporate (least used category)
      const corporateRecommendation = result.recommendations.find(r => r.category === 'CORPORATE');
      expect(corporateRecommendation).toBeDefined();
      expect(corporateRecommendation!.reason).toContain('Balance your experience');
    });

    it('should calculate balance score correctly', async () => {
      // Mock perfectly balanced categories
      const balancedStats = {
        freelance: { tasksCompleted: 10, totalXP: 200, averageRating: 4.0 },
        community: { tasksCompleted: 10, totalXP: 200, averageRating: 4.0 },
        corporate: { tasksCompleted: 10, totalXP: 200, averageRating: 4.0 }
      };
      (WorkHistoryModel.getUserCategoryStats as jest.Mock).mockResolvedValue(balancedStats);

      const result = await ProgressionTrackingService.getCategoryRecommendations('test-user-id');

      expect(result.balanceScore).toBeGreaterThan(90); // Should be very high for balanced categories
    });

    it('should handle zero tasks case', async () => {
      const zeroStats = {
        freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
        community: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
        corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0 }
      };
      (WorkHistoryModel.getUserCategoryStats as jest.Mock).mockResolvedValue(zeroStats);

      const result = await ProgressionTrackingService.getCategoryRecommendations('test-user-id');

      expect(result.balanceScore).toBe(100); // Perfect balance when no tasks
      expect(result.recommendations).toHaveLength(0); // No recommendations needed
    });
  });

  describe('checkMilestoneCompletions', () => {
    it('should identify newly completed milestones', async () => {
      (UserModel.updateStats as jest.Mock).mockResolvedValue(undefined);

      const result = await ProgressionTrackingService.checkMilestoneCompletions('test-user-id');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should award rewards for completed milestones', async () => {
      const updateStatsSpy = jest.spyOn(UserModel, 'updateStats');
      
      await ProgressionTrackingService.checkMilestoneCompletions('test-user-id');

      // Should be called if there are milestone rewards to award
      // The exact number depends on which milestones are completed
      expect(updateStatsSpy).toHaveBeenCalledWith('test-user-id', expect.any(Object));
    });
  });

  describe('trackDailyActivity', () => {
    it('should track daily activity without errors', async () => {
      (UserModel.updateStats as jest.Mock).mockResolvedValue(undefined);

      await expect(
        ProgressionTrackingService.trackDailyActivity('test-user-id')
      ).resolves.not.toThrow();

      expect(UserModel.updateStats).toHaveBeenCalledWith('test-user-id', expect.any(Object));
    });

    it('should handle non-existent user gracefully', async () => {
      (UserModel.getStats as jest.Mock).mockResolvedValue(null);

      await expect(
        ProgressionTrackingService.trackDailyActivity('non-existent-user')
      ).resolves.not.toThrow();
    });
  });

  describe('milestone calculations', () => {
    it('should create milestones with correct progress calculations', async () => {
      const result = await ProgressionTrackingService.getUserProgressionSummary('test-user-id');

      const xpMilestones = result!.milestones.active.concat(result!.milestones.completed)
        .filter(m => m.category === 'XP');

      expect(xpMilestones.length).toBeGreaterThan(0);

      xpMilestones.forEach(milestone => {
        expect(milestone.progress).toBeGreaterThanOrEqual(0);
        expect(milestone.progress).toBeLessThanOrEqual(100);
        expect(milestone.currentValue).toBe(mockUserStats.xpPoints);
      });
    });

    it('should mark milestones as completed when target is reached', async () => {
      const result = await ProgressionTrackingService.getUserProgressionSummary('test-user-id');

      const completedMilestones = result!.milestones.completed;
      
      completedMilestones.forEach(milestone => {
        expect(milestone.completed).toBe(true);
        expect(milestone.currentValue).toBeGreaterThanOrEqual(milestone.targetValue);
      });
    });

    it('should include rewards for milestones', async () => {
      const result = await ProgressionTrackingService.getUserProgressionSummary('test-user-id');

      const milestonesWithRewards = result!.milestones.active
        .concat(result!.milestones.completed)
        .filter(m => m.reward);

      expect(milestonesWithRewards.length).toBeGreaterThan(0);

      milestonesWithRewards.forEach(milestone => {
        expect(milestone.reward).toBeDefined();
        expect(
          milestone.reward!.xp || 
          milestone.reward!.trustScore || 
          milestone.reward!.badge || 
          milestone.reward!.zoneUnlock
        ).toBeDefined();
      });
    });
  });
});