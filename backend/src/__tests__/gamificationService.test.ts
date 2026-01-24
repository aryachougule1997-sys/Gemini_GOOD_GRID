import { GamificationService } from '../services/gamificationService';
import { TaskRewards, WorkCategory } from '../../../shared/types';

describe('GamificationService', () => {
  describe('calculateXP', () => {
    it('should calculate base XP correctly', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const result = GamificationService.calculateXP(
        taskRewards,
        'FREELANCE',
        3, // quality score
        1, // completion time
        1  // user level
      );

      expect(result.baseXP).toBe(100);
      expect(result.totalXP).toBeGreaterThan(0);
      expect(result.reasoning).toContain('Base XP from task: 100');
    });

    it('should apply category multipliers correctly', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const freelanceResult = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 1, 1);
      const communityResult = GamificationService.calculateXP(taskRewards, 'COMMUNITY', 3, 1, 1);
      const corporateResult = GamificationService.calculateXP(taskRewards, 'CORPORATE', 3, 1, 1);

      // Community should have highest multiplier (1.2)
      expect(communityResult.totalXP).toBeGreaterThan(freelanceResult.totalXP);
      expect(corporateResult.totalXP).toBeGreaterThan(freelanceResult.totalXP);
      expect(communityResult.totalXP).toBeGreaterThan(corporateResult.totalXP);
    });

    it('should apply quality bonuses correctly', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const lowQualityResult = GamificationService.calculateXP(taskRewards, 'FREELANCE', 2, 1, 1);
      const goodQualityResult = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 1, 1);
      const highQualityResult = GamificationService.calculateXP(taskRewards, 'FREELANCE', 5, 1, 1);

      expect(highQualityResult.totalXP).toBeGreaterThan(goodQualityResult.totalXP);
      expect(goodQualityResult.totalXP).toBeGreaterThan(lowQualityResult.totalXP);
    });

    it('should apply early completion bonus', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const normalResult = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 1, 1);
      const earlyResult = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 0.5, 1);

      expect(earlyResult.totalXP).toBeGreaterThan(normalResult.totalXP);
      expect(earlyResult.reasoning.some(r => r.includes('Early completion bonus'))).toBe(true);
    });

    it('should apply level scaling', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const lowLevelResult = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 1, 1);
      const highLevelResult = GamificationService.calculateXP(taskRewards, 'FREELANCE', 3, 1, 20);

      expect(lowLevelResult.totalXP).toBeGreaterThan(highLevelResult.totalXP);
    });
  });

  describe('calculateTrustScore', () => {
    it('should calculate base trust score correctly', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const result = GamificationService.calculateTrustScore(
        taskRewards,
        'FREELANCE',
        3,
        true
      );

      expect(result.baseTrustScore).toBe(5);
      expect(result.totalTrustScore).toBeGreaterThan(5);
      expect(result.reasoning).toContain('Base trust score from task: 5');
    });

    it('should apply quality bonuses and penalties', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const excellentResult = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 5, true);
      const goodResult = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 4, true);
      const satisfactoryResult = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 3, true);
      const poorResult = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 2, true);

      expect(excellentResult.totalTrustScore).toBeGreaterThan(goodResult.totalTrustScore);
      expect(goodResult.totalTrustScore).toBeGreaterThan(satisfactoryResult.totalTrustScore);
      expect(satisfactoryResult.totalTrustScore).toBeGreaterThan(poorResult.totalTrustScore);
    });

    it('should penalize late completion', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const onTimeResult = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 3, true);
      const lateResult = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 3, false);

      expect(onTimeResult.totalTrustScore).toBeGreaterThan(lateResult.totalTrustScore);
      expect(lateResult.reasoning).toContain('Late completion: -3 trust score');
    });

    it('should give community work bonus', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const freelanceResult = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 3, true);
      const communityResult = GamificationService.calculateTrustScore(taskRewards, 'COMMUNITY', 3, true);

      expect(communityResult.totalTrustScore).toBeGreaterThan(freelanceResult.totalTrustScore);
      expect(communityResult.reasoning).toContain('Community work bonus: +1 trust score');
    });

    it('should never return negative trust score', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 1,
        rwisPoints: 50
      };

      const result = GamificationService.calculateTrustScore(taskRewards, 'FREELANCE', 1, false);
      expect(result.totalTrustScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateRWIS', () => {
    it('should calculate base RWIS correctly', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const result = GamificationService.calculateRWIS(
        taskRewards,
        'FREELANCE',
        3,
        'MEDIUM'
      );

      expect(result.baseRWIS).toBe(50);
      expect(result.totalRWIS).toBeGreaterThan(50);
      expect(result.reasoning).toContain('Base RWIS from task: 50');
    });

    it('should apply category multipliers correctly', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const freelanceResult = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 3, 'MEDIUM');
      const communityResult = GamificationService.calculateRWIS(taskRewards, 'COMMUNITY', 3, 'MEDIUM');
      const corporateResult = GamificationService.calculateRWIS(taskRewards, 'CORPORATE', 3, 'MEDIUM');

      // Community should have highest impact multiplier (1.5)
      expect(communityResult.totalRWIS).toBeGreaterThan(corporateResult.totalRWIS);
      expect(corporateResult.totalRWIS).toBeGreaterThan(freelanceResult.totalRWIS);
    });

    it('should apply complexity bonuses correctly', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const lowResult = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 3, 'LOW');
      const mediumResult = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 3, 'MEDIUM');
      const highResult = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 3, 'HIGH');

      expect(highResult.totalRWIS).toBeGreaterThan(mediumResult.totalRWIS);
      expect(mediumResult.totalRWIS).toBeGreaterThan(lowResult.totalRWIS);
    });

    it('should apply quality impact bonus', () => {
      const taskRewards: TaskRewards = {
        xp: 100,
        trustScoreBonus: 5,
        rwisPoints: 50
      };

      const normalResult = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 3, 'MEDIUM');
      const highQualityResult = GamificationService.calculateRWIS(taskRewards, 'FREELANCE', 5, 'MEDIUM');

      expect(highQualityResult.totalRWIS).toBeGreaterThan(normalResult.totalRWIS);
      expect(highQualityResult.reasoning.some(r => r.includes('High quality impact bonus'))).toBe(true);
    });
  });

  describe('calculateLevelProgression', () => {
    it('should calculate level progression correctly', () => {
      const result = GamificationService.calculateLevelProgression(150, 1);
      
      expect(result.newLevel).toBeGreaterThanOrEqual(1);
      expect(result.xpToNextLevel).toBeGreaterThan(0);
      expect(result.leveledUp).toBe(result.newLevel > 1);
    });

    it('should handle level up correctly', () => {
      const result = GamificationService.calculateLevelProgression(1000, 1);
      
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBeGreaterThan(1);
      expect(result.previousLevel).toBe(1);
    });

    it('should unlock features at specific levels', () => {
      const result = GamificationService.calculateLevelProgression(10000, 1);
      
      if (result.newLevel >= 5) {
        expect(result.unlockedFeatures).toContain('Advanced Task Filtering');
      }
      if (result.newLevel >= 10) {
        expect(result.unlockedFeatures).toContain('Mentor Status');
      }
    });

    it('should handle no level up', () => {
      const result = GamificationService.calculateLevelProgression(50, 1);
      
      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBe(1);
      expect(result.previousLevel).toBe(1);
      expect(result.unlockedFeatures).toHaveLength(0);
    });
  });

  describe('XP requirements scaling', () => {
    it('should have exponential XP growth', () => {
      const level1XP = GamificationService.calculateLevelProgression(0, 1).xpRequired;
      const level5XP = GamificationService.calculateLevelProgression(0, 5).xpRequired;
      const level10XP = GamificationService.calculateLevelProgression(0, 10).xpRequired;

      expect(level5XP).toBeGreaterThan(level1XP * 2);
      expect(level10XP).toBeGreaterThan(level5XP * 2);
    });
  });
});

// Mock data for testing
const mockTaskRewards: TaskRewards = {
  xp: 100,
  trustScoreBonus: 5,
  rwisPoints: 50,
  badges: ['test-badge'],
  payment: 25
};

describe('GamificationService Integration', () => {
  it('should handle complete progression calculation', () => {
    const xpResult = GamificationService.calculateXP(mockTaskRewards, 'COMMUNITY', 4, 0.8, 5);
    const trustResult = GamificationService.calculateTrustScore(mockTaskRewards, 'COMMUNITY', 4, true, 'Great work!');
    const rwisResult = GamificationService.calculateRWIS(mockTaskRewards, 'COMMUNITY', 4, 'HIGH');
    const levelResult = GamificationService.calculateLevelProgression(500, 3);

    expect(xpResult.totalXP).toBeGreaterThan(0);
    expect(trustResult.totalTrustScore).toBeGreaterThan(0);
    expect(rwisResult.totalRWIS).toBeGreaterThan(0);
    expect(levelResult.newLevel).toBeGreaterThanOrEqual(3);

    // All results should have reasoning
    expect(xpResult.reasoning.length).toBeGreaterThan(0);
    expect(trustResult.reasoning.length).toBeGreaterThan(0);
    expect(rwisResult.reasoning.length).toBeGreaterThan(0);
  });
});