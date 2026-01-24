/**
 * Test file for MapEngine dungeon interaction logic
 * Note: This tests the interaction logic without actually running Phaser
 */

import { DungeonService } from '../../../services/dungeonService';
import { Dungeon, Point } from '../../../../../shared/types';

// Mock dungeon data for testing
const mockDungeon: Dungeon = {
  id: 'test-dungeon-1',
  name: 'Test Freelance Tower',
  type: 'FREELANCE',
  coordinates: { x: 100, y: 100 },
  zoneId: 'starter-town',
  entryRequirements: {
    trustScore: 10,
    level: 1,
    badges: []
  },
  tasks: [],
  description: 'A test dungeon',
  rewards: {
    xp: 100,
    currency: 50,
    items: []
  }
};

const mockUserStats = {
  trustScore: 50,
  level: 5,
  badges: ['starter']
};

describe('MapEngine Dungeon Interaction Logic', () => {
  describe('Distance Checking', () => {
    it('should correctly calculate if user is within interaction range', () => {
      const userPosition: Point = { x: 150, y: 150 }; // 70.7 units away
      const isInRange = DungeonService.isWithinInteractionRange(userPosition, mockDungeon.coordinates);
      
      expect(isInRange).toBe(true); // Should be within 100 unit range
    });

    it('should correctly identify when user is too far', () => {
      const userPosition: Point = { x: 250, y: 250 }; // ~212 units away
      const isInRange = DungeonService.isWithinInteractionRange(userPosition, mockDungeon.coordinates);
      
      expect(isInRange).toBe(false); // Should be outside 100 unit range
    });

    it('should calculate exact distance correctly', () => {
      const userPosition: Point = { x: 103, y: 104 }; // 3,4,5 triangle = 5 units away
      const distance = DungeonService.calculateDistance(userPosition, mockDungeon.coordinates);
      
      expect(distance).toBe(5);
    });
  });

  describe('Dungeon State Management', () => {
    it('should return accessible and in-range state for qualified user', () => {
      const userPosition: Point = { x: 150, y: 150 }; // ~70.7 units away
      const state = DungeonService.getDungeonState(mockDungeon, mockUserStats, userPosition);
      
      expect(state.isAccessible).toBe(true);
      expect(state.isInRange).toBe(true);
      expect(state.isLocked).toBe(false);
      expect(state.proximityLevel).toBe('near'); // 70.7 units is within 80% range (80 units)
    });

    it('should return not accessible for unqualified user', () => {
      const unqualifiedUserStats = {
        trustScore: 5, // Below requirement
        level: 1,
        badges: []
      };
      const userPosition: Point = { x: 150, y: 150 };
      const state = DungeonService.getDungeonState(mockDungeon, unqualifiedUserStats, userPosition);
      
      expect(state.isAccessible).toBe(false);
      expect(state.isLocked).toBe(true);
    });

    it('should return correct proximity levels', () => {
      // Close proximity (within 40% of interaction range = 40 units)
      const closePosition: Point = { x: 120, y: 120 }; // ~28 units away
      const closeState = DungeonService.getDungeonState(mockDungeon, mockUserStats, closePosition);
      expect(closeState.proximityLevel).toBe('close');

      // Near proximity (within 80% of interaction range = 80 units)
      const nearPosition: Point = { x: 150, y: 150 }; // ~70.7 units away
      const nearState = DungeonService.getDungeonState(mockDungeon, mockUserStats, nearPosition);
      expect(nearState.proximityLevel).toBe('near');

      // Far proximity (outside interaction range)
      const farPosition: Point = { x: 250, y: 250 }; // ~212 units away
      const farState = DungeonService.getDungeonState(mockDungeon, mockUserStats, farPosition);
      expect(farState.proximityLevel).toBe('far');
    });

    it('should generate appropriate visual effects based on state', () => {
      const userPosition: Point = { x: 120, y: 120 }; // Close and accessible
      const state = DungeonService.getDungeonState(mockDungeon, mockUserStats, userPosition);
      
      expect(state.visualEffects.length).toBeGreaterThan(0);
      
      // Should have glow effect for accessible dungeon
      const hasGlow = state.visualEffects.some(effect => effect.type === 'glow');
      expect(hasGlow).toBe(true);
      
      // Should have scale effect for close proximity
      const hasScale = state.visualEffects.some(effect => effect.type === 'scale');
      expect(hasScale).toBe(true);
    });
  });

  describe('Interaction Range Constants', () => {
    it('should expose INTERACTION_RANGE as public constant', () => {
      expect(DungeonService.INTERACTION_RANGE).toBe(100);
    });
  });
});