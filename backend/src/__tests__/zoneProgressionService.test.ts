import { ZoneProgressionService } from '../services/zoneProgressionService';
import { UserModel } from '../models/User';
import { ZoneModel, DungeonModel } from '../models/Zone';
import { WorkHistoryModel } from '../models/WorkHistory';
import { UserAchievementModel } from '../models/Badge';

// Mock the dependencies
jest.mock('../models/User');
jest.mock('../models/Zone');
jest.mock('../models/WorkHistory');
jest.mock('../models/Badge');

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockZoneModel = ZoneModel as jest.Mocked<typeof ZoneModel>;
const mockDungeonModel = DungeonModel as jest.Mocked<typeof DungeonModel>;
const mockWorkHistoryModel = WorkHistoryModel as jest.Mocked<typeof WorkHistoryModel>;
const mockUserAchievementModel = UserAchievementModel as jest.Mocked<typeof UserAchievementModel>;

describe('ZoneProgressionService', () => {
  const mockUserId = 'test-user-id';
  const mockUserStats = {
    userId: mockUserId,
    trustScore: 75,
    rwisScore: 150,
    xpPoints: 1200,
    currentLevel: 8,
    unlockedZones: ['zone-1', 'zone-2'],
    categoryStats: {
      freelance: { tasksCompleted: 15, totalXP: 500, averageRating: 4.2, specializations: [] },
      community: { tasksCompleted: 20, totalXP: 800, averageRating: 4.5, specializations: [] },
      corporate: { tasksCompleted: 10, totalXP: 400, averageRating: 3.8, specializations: [] }
    }
  };

  const mockZones = [
    {
      id: 'zone-1',
      name: 'Starter Valley',
      terrainType: 'URBAN' as const,
      unlockRequirements: { trustScore: 0, level: 1 },
      difficulty: 'BEGINNER' as const,
      coordinates: { minX: 0, minY: 0, maxX: 500, maxY: 500 },
      createdAt: new Date()
    },
    {
      id: 'zone-2',
      name: 'Tech District',
      terrainType: 'URBAN' as const,
      unlockRequirements: { trustScore: 25, level: 3 },
      difficulty: 'INTERMEDIATE' as const,
      coordinates: { minX: 500, minY: 0, maxX: 1000, maxY: 500 },
      createdAt: new Date()
    },
    {
      id: 'zone-3',
      name: 'Innovation Heights',
      terrainType: 'MOUNTAIN' as const,
      unlockRequirements: { trustScore: 100, level: 10 },
      difficulty: 'ADVANCED' as const,
      coordinates: { minX: 0, minY: 500, maxX: 500, maxY: 1000 },
      createdAt: new Date()
    }
  ];

  const mockDungeons = [
    {
      id: 'dungeon-1',
      type: 'FREELANCE' as const,
      name: 'Startup Hub',
      zoneId: 'zone-1',
      coordinates: { x: 250, y: 250 },
      entryRequirements: { trustScore: 10 },
      specialFeatures: [],
      createdAt: new Date()
    }
  ];

  const mockWorkHistory = [
    { id: '1', userId: mockUserId, taskId: 'task-1', category: 'FREELANCE' as const, completionDate: new Date(), xpEarned: 50, trustScoreChange: 5, rwisEarned: 10, createdAt: new Date() },
    { id: '2', userId: mockUserId, taskId: 'task-2', category: 'COMMUNITY' as const, completionDate: new Date(), xpEarned: 75, trustScoreChange: 8, rwisEarned: 20, createdAt: new Date() }
  ];

  const mockUserBadges = [
    { id: '1', userId: mockUserId, badgeId: 'badge-1', earnedAt: new Date(), badge: { id: 'badge-1', name: 'First Steps', description: 'Complete first task', category: 'ACHIEVEMENT' as const, rarity: 'COMMON' as const, unlockCriteria: {}, createdAt: new Date() } }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUserModel.getStats.mockResolvedValue(mockUserStats);
    mockZoneModel.findAll.mockResolvedValue(mockZones);
    mockZoneModel.findById.mockImplementation((id) => {
      const zone = mockZones.find(z => z.id === id);
      return Promise.resolve(zone || null);
    });
    mockDungeonModel.findAll.mockResolvedValue(mockDungeons);
    mockDungeonModel.findByZone.mockResolvedValue(mockDungeons);
    mockWorkHistoryModel.findByUser.mockResolvedValue(mockWorkHistory);
    mockWorkHistoryModel.getUserCategoryStats.mockResolvedValue(mockUserStats.categoryStats);
    mockUserAchievementModel.findByUser.mockResolvedValue(mockUserBadges);
  });

  describe('checkZoneUnlocks', () => {
    it('should identify unlockable zones based on user stats', async () => {
      const result = await ZoneProgressionService.checkZoneUnlocks(mockUserId);
      
      expect(mockUserModel.getStats).toHaveBeenCalledWith(mockUserId);
      expect(mockZoneModel.findAll).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
    });

    it('should not unlock zones that are already unlocked', async () => {
      const result = await ZoneProgressionService.checkZoneUnlocks(mockUserId);
      
      // Should not include zone-1 and zone-2 as they're already unlocked
      const unlockedZoneIds = result.filter(r => r.unlocked).map(r => r.zoneId);
      expect(unlockedZoneIds).not.toContain('zone-1');
      expect(unlockedZoneIds).not.toContain('zone-2');
    });

    it('should unlock zone-3 when user meets requirements', async () => {
      // Update mock user stats to meet zone-3 requirements
      const highLevelUserStats = {
        ...mockUserStats,
        trustScore: 100,
        currentLevel: 10
      };
      mockUserModel.getStats.mockResolvedValue(highLevelUserStats);

      const result = await ZoneProgressionService.checkZoneUnlocks(mockUserId);
      
      const zone3Unlock = result.find(r => r.zoneId === 'zone-3');
      expect(zone3Unlock?.unlocked).toBe(true);
    });

    it('should generate appropriate celebration data for unlocked zones', async () => {
      const highLevelUserStats = {
        ...mockUserStats,
        trustScore: 100,
        currentLevel: 10
      };
      mockUserModel.getStats.mockResolvedValue(highLevelUserStats);

      const result = await ZoneProgressionService.checkZoneUnlocks(mockUserId);
      
      const zone3Unlock = result.find(r => r.zoneId === 'zone-3');
      expect(zone3Unlock?.celebrationData).toBeDefined();
      expect(zone3Unlock?.celebrationData.title).toContain('Unlocked');
      expect(zone3Unlock?.celebrationData.visualEffects.mapRevealAnimation).toBe(true);
    });
  });

  describe('getAdvancedDungeonUnlocks', () => {
    it('should return advanced dungeon unlock status for all categories', async () => {
      const result = await ZoneProgressionService.getAdvancedDungeonUnlocks(mockUserId);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      // Should have dungeons for all three categories
      const categories = result.map(d => d.category);
      expect(categories).toContain('FREELANCE');
      expect(categories).toContain('COMMUNITY');
      expect(categories).toContain('CORPORATE');
    });

    it('should calculate progress correctly for advanced dungeons', async () => {
      const result = await ZoneProgressionService.getAdvancedDungeonUnlocks(mockUserId);
      
      const freelanceAdvanced = result.find(d => d.category === 'FREELANCE' && d.tier === 'ADVANCED');
      expect(freelanceAdvanced).toBeDefined();
      expect(freelanceAdvanced?.progressToUnlock).toBeGreaterThanOrEqual(0);
      expect(freelanceAdvanced?.progressToUnlock).toBeLessThanOrEqual(100);
    });

    it('should mark dungeons as unlocked when requirements are met', async () => {
      const result = await ZoneProgressionService.getAdvancedDungeonUnlocks(mockUserId);
      
      // With current mock stats, some basic tier dungeons should be unlocked
      const basicDungeons = result.filter(d => d.tier === 'BASIC');
      expect(basicDungeons.some(d => d.unlocked)).toBe(true);
    });
  });

  describe('getZoneSpecificContent', () => {
    it('should return zone-specific content for valid zone', async () => {
      const result = await ZoneProgressionService.getZoneSpecificContent('zone-1');
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      // Should include different content types
      const contentTypes = result.map(c => c.contentType);
      expect(contentTypes).toContain('TASK_DIFFICULTY_SCALING');
      expect(contentTypes).toContain('TERRAIN_BONUSES');
    });

    it('should return empty array for invalid zone', async () => {
      mockZoneModel.findById.mockResolvedValue(null);
      
      const result = await ZoneProgressionService.getZoneSpecificContent('invalid-zone');
      
      expect(result).toEqual([]);
    });

    it('should include terrain-specific bonuses', async () => {
      mockZoneModel.findById.mockResolvedValue(mockZones[0]); // Urban zone
      
      const result = await ZoneProgressionService.getZoneSpecificContent('zone-1');
      
      const terrainBonuses = result.find(c => c.contentType === 'TERRAIN_BONUSES');
      expect(terrainBonuses?.content.terrainBonuses).toBeDefined();
      expect(terrainBonuses?.content.terrainBonuses).toHaveProperty('tech_tasks_xp_bonus');
    });
  });

  describe('getZoneProgressionStatus', () => {
    it('should return comprehensive progression status', async () => {
      const result = await ZoneProgressionService.getZoneProgressionStatus(mockUserId);
      
      expect(result).toBeDefined();
      expect(result.unlockedZones).toBeInstanceOf(Array);
      expect(result.lockedZones).toBeInstanceOf(Array);
      expect(result.advancedDungeons).toBeInstanceOf(Array);
      expect(result.zoneSpecificContent).toBeInstanceOf(Array);
    });

    it('should correctly categorize zones as locked/unlocked', async () => {
      const result = await ZoneProgressionService.getZoneProgressionStatus(mockUserId);
      
      expect(result.unlockedZones.length).toBe(2); // zone-1 and zone-2
      expect(result.lockedZones.length).toBe(1); // zone-3
      
      const unlockedIds = result.unlockedZones.map((z: any) => z.id);
      expect(unlockedIds).toContain('zone-1');
      expect(unlockedIds).toContain('zone-2');
      expect(unlockedIds).not.toContain('zone-3');
    });

    it('should identify next unlockable zone', async () => {
      const result = await ZoneProgressionService.getZoneProgressionStatus(mockUserId);
      
      expect(result.nextUnlockableZone).toBeDefined();
      expect(result.nextUnlockableZone?.id).toBe('zone-3');
      expect(result.progressToNextZone).toBeGreaterThanOrEqual(0);
      expect(result.progressToNextZone).toBeLessThanOrEqual(100);
    });
  });

  describe('Error handling', () => {
    it('should handle missing user stats gracefully', async () => {
      mockUserModel.getStats.mockResolvedValue(null);
      
      await expect(ZoneProgressionService.checkZoneUnlocks(mockUserId))
        .rejects.toThrow('User stats not found');
    });

    it('should handle database errors gracefully', async () => {
      mockZoneModel.findAll.mockRejectedValue(new Error('Database error'));
      
      await expect(ZoneProgressionService.checkZoneUnlocks(mockUserId))
        .rejects.toThrow('Database error');
    });
  });

  describe('Zone unlock criteria evaluation', () => {
    it('should correctly evaluate trust score requirements', async () => {
      const lowTrustUserStats = {
        ...mockUserStats,
        trustScore: 10,
        currentLevel: 15
      };
      mockUserModel.getStats.mockResolvedValue(lowTrustUserStats);

      const result = await ZoneProgressionService.checkZoneUnlocks(mockUserId);
      
      const zone3Unlock = result.find(r => r.zoneId === 'zone-3');
      expect(zone3Unlock?.unlocked).toBe(false);
      expect(zone3Unlock?.reason).toContain('Trust Score');
    });

    it('should correctly evaluate level requirements', async () => {
      const lowLevelUserStats = {
        ...mockUserStats,
        trustScore: 150,
        currentLevel: 5
      };
      mockUserModel.getStats.mockResolvedValue(lowLevelUserStats);

      const result = await ZoneProgressionService.checkZoneUnlocks(mockUserId);
      
      const zone3Unlock = result.find(r => r.zoneId === 'zone-3');
      expect(zone3Unlock?.unlocked).toBe(false);
      expect(zone3Unlock?.reason).toContain('Level');
    });

    it('should handle multiple requirement failures', async () => {
      const lowStatsUserStats = {
        ...mockUserStats,
        trustScore: 10,
        currentLevel: 5
      };
      mockUserModel.getStats.mockResolvedValue(lowStatsUserStats);

      const result = await ZoneProgressionService.checkZoneUnlocks(mockUserId);
      
      const zone3Unlock = result.find(r => r.zoneId === 'zone-3');
      expect(zone3Unlock?.unlocked).toBe(false);
      expect(zone3Unlock?.reason).toContain('Trust Score');
      expect(zone3Unlock?.reason).toContain('Level');
    });
  });
});