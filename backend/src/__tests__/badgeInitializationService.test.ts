import { BadgeInitializationService } from '../services/badgeInitializationService';
import { BadgeCategory, BadgeRarity } from '../../../shared/types';

// Mock the BadgeModel
jest.mock('../models/Badge');
import { BadgeModel } from '../models/Badge';

describe('BadgeInitializationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeDefaultBadges', () => {
    it('should create badges that do not exist', async () => {
      (BadgeModel.findAll as jest.Mock).mockResolvedValue([]);
      (BadgeModel.create as jest.Mock).mockResolvedValue({});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await BadgeInitializationService.initializeDefaultBadges();

      expect(BadgeModel.create).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Created badge:'));

      consoleSpy.mockRestore();
    });

    it('should skip badges that already exist', async () => {
      const existingBadges = [
        { name: 'First Steps', id: 'existing-1' },
        { name: 'Getting Started', id: 'existing-2' }
      ];
      (BadgeModel.findAll as jest.Mock).mockResolvedValue(existingBadges);
      (BadgeModel.create as jest.Mock).mockResolvedValue({});

      await BadgeInitializationService.initializeDefaultBadges();

      // Should not create badges that already exist
      const createCalls = (BadgeModel.create as jest.Mock).mock.calls;
      const createdBadgeNames = createCalls.map(call => call[0].name);
      
      expect(createdBadgeNames).not.toContain('First Steps');
      expect(createdBadgeNames).not.toContain('Getting Started');
    });

    it('should handle badge creation errors gracefully', async () => {
      (BadgeModel.findAll as jest.Mock).mockResolvedValue([]);
      (BadgeModel.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        BadgeInitializationService.initializeDefaultBadges()
      ).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error creating badge'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getBadgesByCategory', () => {
    it('should return badges filtered by category', () => {
      const achievementBadges = BadgeInitializationService.getBadgesByCategory('ACHIEVEMENT');
      const skillBadges = BadgeInitializationService.getBadgesByCategory('SKILL');
      const categoryBadges = BadgeInitializationService.getBadgesByCategory('CATEGORY');
      const specialBadges = BadgeInitializationService.getBadgesByCategory('SPECIAL');

      expect(achievementBadges.every(badge => badge.category === 'ACHIEVEMENT')).toBe(true);
      expect(skillBadges.every(badge => badge.category === 'SKILL')).toBe(true);
      expect(categoryBadges.every(badge => badge.category === 'CATEGORY')).toBe(true);
      expect(specialBadges.every(badge => badge.category === 'SPECIAL')).toBe(true);

      expect(achievementBadges.length).toBeGreaterThan(0);
      expect(skillBadges.length).toBeGreaterThan(0);
      expect(categoryBadges.length).toBeGreaterThan(0);
      expect(specialBadges.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent category', () => {
      // TypeScript would prevent this, but testing runtime behavior
      const result = BadgeInitializationService.getBadgesByCategory('NON_EXISTENT' as BadgeCategory);
      expect(result).toEqual([]);
    });
  });

  describe('getBadgesByRarity', () => {
    it('should return badges filtered by rarity', () => {
      const commonBadges = BadgeInitializationService.getBadgesByRarity('COMMON');
      const uncommonBadges = BadgeInitializationService.getBadgesByRarity('UNCOMMON');
      const rareBadges = BadgeInitializationService.getBadgesByRarity('RARE');
      const epicBadges = BadgeInitializationService.getBadgesByRarity('EPIC');
      const legendaryBadges = BadgeInitializationService.getBadgesByRarity('LEGENDARY');

      expect(commonBadges.every(badge => badge.rarity === 'COMMON')).toBe(true);
      expect(uncommonBadges.every(badge => badge.rarity === 'UNCOMMON')).toBe(true);
      expect(rareBadges.every(badge => badge.rarity === 'RARE')).toBe(true);
      expect(epicBadges.every(badge => badge.rarity === 'EPIC')).toBe(true);
      expect(legendaryBadges.every(badge => badge.rarity === 'LEGENDARY')).toBe(true);

      expect(commonBadges.length).toBeGreaterThan(0);
      expect(uncommonBadges.length).toBeGreaterThan(0);
      expect(rareBadges.length).toBeGreaterThan(0);
      expect(epicBadges.length).toBeGreaterThan(0);
      expect(legendaryBadges.length).toBeGreaterThan(0);
    });
  });

  describe('getBadgeByName', () => {
    it('should return specific badge by name', () => {
      const firstSteps = BadgeInitializationService.getBadgeByName('First Steps');
      const taskWarrior = BadgeInitializationService.getBadgeByName('Task Warrior');
      const legend = BadgeInitializationService.getBadgeByName('Legend');

      expect(firstSteps).toBeDefined();
      expect(firstSteps!.name).toBe('First Steps');
      expect(firstSteps!.category).toBe('ACHIEVEMENT');
      expect(firstSteps!.rarity).toBe('COMMON');

      expect(taskWarrior).toBeDefined();
      expect(taskWarrior!.name).toBe('Task Warrior');
      expect(taskWarrior!.unlockCriteria.tasksCompleted).toBe(25);

      expect(legend).toBeDefined();
      expect(legend!.name).toBe('Legend');
      expect(legend!.rarity).toBe('LEGENDARY');
    });

    it('should return undefined for non-existent badge', () => {
      const result = BadgeInitializationService.getBadgeByName('Non-existent Badge');
      expect(result).toBeUndefined();
    });
  });

  describe('badge definitions validation', () => {
    it('should have valid unlock criteria for all badges', () => {
      const allBadges = BadgeInitializationService['getDefaultBadgeDefinitions']();

      allBadges.forEach(badge => {
        expect(badge.unlockCriteria).toBeDefined();
        expect(typeof badge.unlockCriteria).toBe('object');

        // At least one unlock criterion should be defined
        const hasValidCriteria = 
          badge.unlockCriteria.tasksCompleted !== undefined ||
          badge.unlockCriteria.trustScore !== undefined ||
          badge.unlockCriteria.categoryTasks !== undefined ||
          badge.unlockCriteria.skillTasks !== undefined ||
          badge.unlockCriteria.mentorships !== undefined ||
          badge.unlockCriteria.zonesFullyExplored !== undefined ||
          badge.unlockCriteria.allZonesUnlocked !== undefined;

        expect(hasValidCriteria).toBe(true);
      });
    });

    it('should have proper rarity distribution', () => {
      const allBadges = BadgeInitializationService['getDefaultBadgeDefinitions']();
      const rarityCount = {
        COMMON: 0,
        UNCOMMON: 0,
        RARE: 0,
        EPIC: 0,
        LEGENDARY: 0
      };

      allBadges.forEach(badge => {
        rarityCount[badge.rarity]++;
      });

      // Should have more common badges than legendary
      expect(rarityCount.COMMON).toBeGreaterThan(rarityCount.LEGENDARY);
      expect(rarityCount.UNCOMMON).toBeGreaterThan(rarityCount.EPIC);

      // Should have at least one badge of each rarity
      Object.values(rarityCount).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });

    it('should have proper category distribution', () => {
      const allBadges = BadgeInitializationService['getDefaultBadgeDefinitions']();
      const categoryCount = {
        ACHIEVEMENT: 0,
        SKILL: 0,
        CATEGORY: 0,
        SPECIAL: 0
      };

      allBadges.forEach(badge => {
        categoryCount[badge.category]++;
      });

      // Should have badges in all categories
      Object.values(categoryCount).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });

      // Achievement badges should be the most common
      expect(categoryCount.ACHIEVEMENT).toBeGreaterThan(categoryCount.SKILL);
    });

    it('should have progressive task requirements', () => {
      const taskBadges = BadgeInitializationService['getDefaultBadgeDefinitions']()
        .filter(badge => badge.unlockCriteria.tasksCompleted !== undefined)
        .sort((a, b) => a.unlockCriteria.tasksCompleted! - b.unlockCriteria.tasksCompleted!);

      // Should have progressive requirements (allowing for some badges with same requirements)
      for (let i = 1; i < taskBadges.length; i++) {
        expect(taskBadges[i].unlockCriteria.tasksCompleted!)
          .toBeGreaterThanOrEqual(taskBadges[i - 1].unlockCriteria.tasksCompleted!);
      }

      // First badge should require only 1 task
      expect(taskBadges[0].unlockCriteria.tasksCompleted).toBe(1);
    });

    it('should have progressive trust score requirements', () => {
      const trustBadges = BadgeInitializationService['getDefaultBadgeDefinitions']()
        .filter(badge => badge.unlockCriteria.trustScore !== undefined)
        .sort((a, b) => a.unlockCriteria.trustScore! - b.unlockCriteria.trustScore!);

      // Should have progressive requirements
      for (let i = 1; i < trustBadges.length; i++) {
        expect(trustBadges[i].unlockCriteria.trustScore!)
          .toBeGreaterThan(trustBadges[i - 1].unlockCriteria.trustScore!);
      }
    });

    it('should have category-specific badges for all work categories', () => {
      const categoryBadges = BadgeInitializationService.getBadgesByCategory('CATEGORY');
      
      const hasFreelance = categoryBadges.some(badge => 
        badge.unlockCriteria.categoryTasks?.freelance !== undefined
      );
      const hasCommunity = categoryBadges.some(badge => 
        badge.unlockCriteria.categoryTasks?.community !== undefined
      );
      const hasCorporate = categoryBadges.some(badge => 
        badge.unlockCriteria.categoryTasks?.corporate !== undefined
      );

      expect(hasFreelance).toBe(true);
      expect(hasCommunity).toBe(true);
      expect(hasCorporate).toBe(true);
    });
  });
});