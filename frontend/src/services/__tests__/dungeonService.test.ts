import { DungeonService } from '../dungeonService';
import { WorkCategory } from '../../../../shared/types';

// Mock fetch
global.fetch = jest.fn();

describe('DungeonService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('API calls', () => {
    test('getAllDungeons should fetch all dungeons', async () => {
      const mockDungeons = [
        {
          id: 'dungeon-1',
          type: 'FREELANCE',
          name: 'Test Tower',
          zoneId: 'zone-1',
          coordinates: { x: 100, y: 100 },
          entryRequirements: {},
          specialFeatures: [],
          availableTasks: [],
          createdAt: new Date()
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockDungeons })
      });

      const result = await DungeonService.getAllDungeons();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/dungeons');
      expect(result).toEqual(mockDungeons);
    });

    test('getDungeonsByCategory should fetch dungeons by category', async () => {
      const mockDungeons = [
        {
          id: 'dungeon-1',
          type: 'FREELANCE',
          name: 'Freelance Tower',
          zoneId: 'zone-1',
          coordinates: { x: 100, y: 100 },
          entryRequirements: {},
          specialFeatures: [],
          availableTasks: [],
          createdAt: new Date()
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockDungeons })
      });

      const result = await DungeonService.getDungeonsByCategory('FREELANCE');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/dungeons/category/freelance');
      expect(result).toEqual(mockDungeons);
    });

    test('checkDungeonAccess should check user access', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, data: { canAccess: true } })
      });

      const result = await DungeonService.checkDungeonAccess(
        'dungeon-1',
        { trustScore: 50, level: 3, badges: ['badge-1'] },
        'test-token'
      );

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/dungeons/dungeon-1/access-check',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({ trustScore: 50, level: 3, badges: ['badge-1'] })
        })
      );
      expect(result).toBe(true);
    });

    test('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: false, error: 'Server error' })
      });

      await expect(DungeonService.getAllDungeons()).rejects.toThrow('Server error');
    });
  });

  describe('Utility functions', () => {
    test('getCategoryInfo should return correct info for each category', () => {
      const freelanceInfo = DungeonService.getCategoryInfo('FREELANCE');
      const communityInfo = DungeonService.getCategoryInfo('COMMUNITY');
      const corporateInfo = DungeonService.getCategoryInfo('CORPORATE');

      expect(freelanceInfo.name).toBe('Freelance Towers');
      expect(freelanceInfo.color).toBe('#3B82F6');
      expect(freelanceInfo.icon).toBe('🏗️');

      expect(communityInfo.name).toBe('Community Gardens');
      expect(communityInfo.color).toBe('#10B981');
      expect(communityInfo.icon).toBe('🌱');

      expect(corporateInfo.name).toBe('Corporate Castles');
      expect(corporateInfo.color).toBe('#8B5CF6');
      expect(corporateInfo.icon).toBe('🏰');
    });

    test('getDungeonSpriteUrl should return correct sprite URLs', () => {
      const freelanceUrl = DungeonService.getDungeonSpriteUrl('FREELANCE');
      const communityUrl = DungeonService.getDungeonSpriteUrl('COMMUNITY');
      const corporateUrl = DungeonService.getDungeonSpriteUrl('CORPORATE');
      const customUrl = DungeonService.getDungeonSpriteUrl('FREELANCE', 'custom-sprite.png');

      expect(freelanceUrl).toBe('/assets/dungeons/freelance-tower.png');
      expect(communityUrl).toBe('/assets/dungeons/community-garden.png');
      expect(corporateUrl).toBe('/assets/dungeons/corporate-castle.png');
      expect(customUrl).toBe('/assets/dungeons/custom-sprite.png');
    });

    test('calculateDistance should calculate correct distance', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };
      const distance = DungeonService.calculateDistance(point1, point2);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    test('isWithinInteractionRange should check interaction range correctly', () => {
      const userPos = { x: 100, y: 100 };
      const nearDungeon = { x: 110, y: 110 }; // Distance ~14.14
      const farDungeon = { x: 200, y: 200 }; // Distance ~141.42

      expect(DungeonService.isWithinInteractionRange(userPos, nearDungeon, 30)).toBe(true);
      expect(DungeonService.isWithinInteractionRange(userPos, farDungeon, 30)).toBe(false);
      expect(DungeonService.isWithinInteractionRange(userPos, farDungeon, 150)).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should throw error when API returns error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: false, error: 'Not found' })
      });

      await expect(DungeonService.getDungeonById('invalid-id')).rejects.toThrow('Not found');
    });

    test('should throw error when no data returned', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, data: null })
      });

      await expect(DungeonService.getDungeonById('invalid-id')).rejects.toThrow('Dungeon not found');
    });

    test('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(DungeonService.getAllDungeons()).rejects.toThrow('Network error');
    });
  });
});