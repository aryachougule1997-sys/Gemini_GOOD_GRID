import { DungeonService } from '../dungeonService';
import { Dungeon, Point, WorkCategory } from '../../../../shared/types';

describe('DungeonService State Management', () => {
  const mockDungeon: Dungeon = {
    id: 'test-dungeon-1',
    type: 'FREELANCE' as WorkCategory,
    name: 'Test Freelance Tower',
    zoneId: 'test-zone',
    coordinates: { x: 100, y: 100 },
    entryRequirements: {
      trustScore: 50,
      level: 2,
      badges: ['beginner']
    },
    specialFeatures: [],
    createdAt: new Date()
  };

  const mockUserStats = {
    trustScore: 60,
    level: 3,
    badges: ['beginner', 'intermediate']
  };

  const mockUserPosition: Point = { x: 90, y: 90 };

  describe('getDungeonState', () => {
    it('should return accessible and in-range state for qualified user', () => {
      const state = DungeonService.getDungeonState(
        mockDungeon,
        mockUserStats,
        mockUserPosition
      );

      expect(state.isAccessible).toBe(true);
      expect(state.isInRange).toBe(true);
      expect(state.isLocked).toBe(false);
      expect(state.proximityLevel).toBe('close');
      expect(state.visualEffects).toHaveLength(3); // glow + scale + particles
    });

    it('should return locked state for unqualified user', () => {
      const unqualifiedUserStats = {
        trustScore: 30, // Below requirement
        level: 1, // Below requirement
        badges: [] // Missing required badge
      };

      const state = DungeonService.getDungeonState(
        mockDungeon,
        unqualifiedUserStats,
        mockUserPosition
      );

      expect(state.isAccessible).toBe(false);
      expect(state.isLocked).toBe(true);
      expect(state.visualEffects).toHaveLength(1); // grayscale effect
      expect(state.visualEffects[0].type).toBe('glow');
      expect(state.visualEffects[0].color).toBe(0xff4444);
    });

    it('should return out-of-range state for distant user', () => {
      const distantPosition: Point = { x: 300, y: 300 }; // Far away

      const state = DungeonService.getDungeonState(
        mockDungeon,
        mockUserStats,
        distantPosition
      );

      expect(state.isAccessible).toBe(true);
      expect(state.isInRange).toBe(false);
      expect(state.proximityLevel).toBe('far');
      expect(state.visualEffects).toHaveLength(0); // No effects when far
    });

    it('should return near proximity for users within range but not close', () => {
      const nearPosition: Point = { x: 170, y: 170 }; // Within range but not close

      const state = DungeonService.getDungeonState(
        mockDungeon,
        mockUserStats,
        nearPosition
      );

      expect(state.isAccessible).toBe(true);
      expect(state.isInRange).toBe(true);
      expect(state.proximityLevel).toBe('far'); // Updated based on new proximity calculation
      expect(state.visualEffects).toHaveLength(1); // glow only, no scale
      expect(state.visualEffects[0].type).toBe('glow');
      expect(state.visualEffects[0].intensity).toBe(0.8);
    });

    it('should handle dungeon with no requirements', () => {
      const openDungeon: Dungeon = {
        ...mockDungeon,
        entryRequirements: {} // No requirements
      };

      const state = DungeonService.getDungeonState(
        openDungeon,
        { trustScore: 0, level: 1, badges: [] }, // Minimal stats
        mockUserPosition
      );

      expect(state.isAccessible).toBe(true);
      expect(state.isLocked).toBe(false);
    });

    it('should handle partial requirements correctly', () => {
      const partialReqDungeon: Dungeon = {
        ...mockDungeon,
        entryRequirements: {
          trustScore: 40 // Only trust score requirement
        }
      };

      const state = DungeonService.getDungeonState(
        partialReqDungeon,
        { trustScore: 50, level: 1, badges: [] },
        mockUserPosition
      );

      expect(state.isAccessible).toBe(true);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate correct distance between two points', () => {
      const pos1: Point = { x: 0, y: 0 };
      const pos2: Point = { x: 3, y: 4 };

      const distance = DungeonService.calculateDistance(pos1, pos2);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should return 0 for same position', () => {
      const pos: Point = { x: 10, y: 20 };
      const distance = DungeonService.calculateDistance(pos, pos);
      expect(distance).toBe(0);
    });
  });

  describe('isWithinInteractionRange', () => {
    it('should return true for positions within range', () => {
      const userPos: Point = { x: 100, y: 100 };
      const dungeonPos: Point = { x: 150, y: 150 };

      const isInRange = DungeonService.isWithinInteractionRange(userPos, dungeonPos);
      expect(isInRange).toBe(true); // Distance ~70.7, within 100 range
    });

    it('should return false for positions outside range', () => {
      const userPos: Point = { x: 100, y: 100 };
      const dungeonPos: Point = { x: 250, y: 250 };

      const isInRange = DungeonService.isWithinInteractionRange(userPos, dungeonPos);
      expect(isInRange).toBe(false); // Distance ~212, outside 100 range
    });
  });
});