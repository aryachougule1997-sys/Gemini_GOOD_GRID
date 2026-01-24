import { GamificationService } from '../services/gamificationService';
import { ProgressionTrackingService } from '../services/progressionTrackingService';
import { BadgeInitializationService } from '../services/badgeInitializationService';
import { TaskRewards } from '../../../shared/types';

// Mock the dependencies
jest.mock('../models/User');
jest.mock('../models/WorkHistory');
jest.mock('../models/Badge');
jest.mock('../config/database');

describe('Gamification Services Integration', () => {
  describe('GamificationService', () => {
    it('should calculate XP correctly for different scenarios', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      // Test different categories
      const freelanceXP = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 1, 1);
      const communityXP = GamificationService.calculateXP(taskRewards, 'COMMUNITY', 3, 1, 1);
      const corporateXP = GamificationService.calculateXP(taskRewards, 'CORPORATE', 3, 1, 1);

      expect(freelanceXP.totalXP).toBeGreaterThan(0);
      expect(communityXP.totalXP).toBeGreaterThan(freelanceXP.totalXP); // Community has higher multiplier
      expect(corporateXP.totalXP).toBeGreaterThan(freelanceXP.totalXP);
    });

    it('should calculate trust score with proper bonuses and penalties', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      // Test high quality, on-time completion
      const excellentResult = GamificationService.calculateTrustScore(
        taskRewards, 'COMMUNITY', 5, true, 'Excellent work!'
      );

      // Test poor quality, late completion
      const poorResult = GamificationService.calculateTrustScore(
        taskRewards, 'FREELANCE', 2, false
      );

      expect(excellentResult.totalTrustScore).toBeGreaterThan(poorResult.totalTrustScore);
      expect(excellentResult.totalTrustScore).toBeGreaterThan(0);
      expect(poorResult.totalTrustScore).toBeGreaterThanOrEqual(0); // Never negative
    });

    it('should calculate RWIS with category and complexity bonuses', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      // Test different complexities
      const lowComplexity = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 3, 'LOW');
      const highComplexity = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 3, 'HIGH');

      // Test different categories
      const freelanceRWIS = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 3, 'MEDIUM');
      const communityRWIS = GamificationService.calculateRWIS(taskRewards, 'COMMUNITY', 3, 'MEDIUM');

      expect(highComplexity.totalRWIS).toBeGreaterThan(lowComplexity.totalRWIS);
      expect(communityRWIS.totalRWIS).toBeGreaterThan(freelanceRWIS.totalRWIS); // Community has higher impact
    });

    it('should handle level progression correctly', () => {
      // Test level up scenarios
      const noLevelUp = GamificationService.calculateLevelProgression(50, 1);
      const levelUp = GamificationService.calculateLevelProgression(1000, 1);

      expect(noLevelUp.leveledUp).toBe(false);
      expect(noLevelUp.newLevel).toBe(1);
      expect(noLevelUp.xpToNextLevel).toBeGreaterThan(0);

      expect(levelUp.leveledUp).toBe(true);
      expect(levelUp.newLevel).toBeGreaterThan(1);
      expect(levelUp.unlockedFeatures.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('BadgeInitializationService', () => {
    it('should have proper badge definitions', () => {
      const achievementBadges = BadgeInitializationService.getBadgesByCategory('ACHIEVEMENT');
      const skillBadges = BadgeInitializationService.getBadgesByCategory('SKILL');
      const categoryBadges = BadgeInitializationService.getBadgesByCategory('CATEGORY');
      const specialBadges = BadgeInitializationService.getBadgesByCategory('SPECIAL');

      expect(achievementBadges.length).toBeGreaterThan(0);
      expect(skillBadges.length).toBeGreaterThan(0);
      expect(categoryBadges.length).toBeGreaterThan(0);
      expect(specialBadges.length).toBeGreaterThan(0);

      // Check that all badges have proper structure
      achievementBadges.forEach(badge => {
        expect(badge.name).toBeDefined();
        expect(badge.description).toBeDefined();
        expect(badge.category).toBe('ACHIEVEMENT');
        expect(badge.rarity).toBeDefined();
        expect(badge.unlockCriteria).toBeDefined();
      });
    });

    it('should have progressive requirements for task-based badges', () => {
      const firstSteps = BadgeInitializationService.getBadgeByName('First Steps');
      const taskWarrior = BadgeInitializationService.getBadgeByName('Task Warrior');
      const legend = BadgeInitializationService.getBadgeByName('Legend');

      expect(firstSteps?.unlockCriteria.tasksCompleted).toBe(1);
      expect(taskWarrior?.unlockCriteria.tasksCompleted).toBe(25);
      expect(legend?.unlockCriteria.tasksCompleted).toBe(250);
    });

    it('should have badges for all work categories', () => {
      const freelanceBadges = BadgeInitializationService.getBadgesByCategory('CATEGORY')
        .filter(badge => badge.unlockCriteria.categoryTasks?.freelance);
      const communityBadges = BadgeInitializationService.getBadgesByCategory('CATEGORY')
        .filter(badge => badge.unlockCriteria.categoryTasks?.community);
      const corporateBadges = BadgeInitializationService.getBadgesByCategory('CATEGORY')
        .filter(badge => badge.unlockCriteria.categoryTasks?.corporate);

      expect(freelanceBadges.length).toBeGreaterThan(0);
      expect(communityBadges.length).toBeGreaterThan(0);
      expect(corporateBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Gamification Flow', () => {
    it('should handle a complete task completion flow', () => {
      const taskRewards: TaskRewards = {
        xp: 150,
        trustScoreBonus: 8,
        rwisPoints: 75
      };

      // Calculate all progression components
      const xpResult = GamificationService.calculateXP(taskRewards, 'COMMUNITY', 5, 0.8, 3);
      const trustResult = GamificationService.calculateTrustScore(taskRewards, 'COMMUNITY', 5, true, 'Amazing work!');
      const rwisResult = GamificationService.calculateRWIS(taskRewards, 'COMMUNITY', 5, 'HIGH');
      const levelResult = GamificationService.calculateLevelProgression(500, 3);

      // Verify all calculations are positive and have reasoning
      expect(xpResult.totalXP).toBeGreaterThan(0);
      expect(xpResult.reasoning.length).toBeGreaterThan(0);

      expect(trustResult.totalTrustScore).toBeGreaterThan(0);
      expect(trustResult.reasoning.length).toBeGreaterThan(0);

      expect(rwisResult.totalRWIS).toBeGreaterThan(0);
      expect(rwisResult.reasoning.length).toBeGreaterThan(0);

      expect(levelResult.newLevel).toBeGreaterThanOrEqual(3);
      expect(levelResult.xpToNextLevel).toBeGreaterThanOrEqual(0);

      // Verify high quality work gets bonuses
      expect(xpResult.bonusXP).toBeGreaterThan(0);
      expect(trustResult.bonusTrustScore).toBeGreaterThan(0);
      expect(rwisResult.bonusRWIS).toBeGreaterThan(0);
    });

    it('should apply proper penalties for poor performance', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      // Poor quality, late completion
      const poorResult = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 1, false);
      
      // Should still be non-negative but with penalties applied
      expect(poorResult.totalTrustScore).toBeGreaterThanOrEqual(0);
      expect(poorResult.reasoning.some(r => r.includes('Late completion'))).toBe(true);
      expect(poorResult.reasoning.some(r => r.includes('Poor quality'))).toBe(true);
    });

    it('should scale properly with user level', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const lowLevelXP = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 1, 1);
      const highLevelXP = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 1, 20);

      // Higher level users should get less XP to prevent inflation
      expect(lowLevelXP.totalXP).toBeGreaterThan(highLevelXP.totalXP);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero and negative inputs gracefully', () => {
      const zeroRewards: TaskRewards = {
        xp: 0,
        trustScoreBonus: 0,
        rwisPoints: 0
      };

      const xpResult = GamificationService.calculateXP(zeroRewards, 'FREELANCE', 3, 1, 1);
      const trustResult = GamificationService.calculateTrustScore(zeroRewards, 'FREELANCE', 3, true);
      const rwisResult = GamificationService.calculateRWIS(zeroRewards, 'FREELANCE', 3, 'MEDIUM');

      expect(xpResult.totalXP).toBeGreaterThanOrEqual(0);
      expect(trustResult.totalTrustScore).toBeGreaterThanOrEqual(0);
      expect(rwisResult.totalRWIS).toBeGreaterThanOrEqual(0);
    });

    it('should handle extreme quality scores', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      // Test with quality score of 0 (should be handled gracefully)
      const zeroQuality = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 0, true);
      expect(zeroQuality.totalTrustScore).toBeGreaterThanOrEqual(0);

      // Test with quality score above 5 (should be capped)
      const highQuality = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 6, true);
      expect(highQuality.totalTrustScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle very high XP values for level calculation', () => {
      const veryHighXP = GamificationService.calculateLevelProgression(100000, 1);
      
      expect(veryHighXP.newLevel).toBeGreaterThan(1);
      expect(veryHighXP.leveledUp).toBe(true);
      expect(veryHighXP.unlockedFeatures.length).toBeGreaterThan(0);
    });
  });
});