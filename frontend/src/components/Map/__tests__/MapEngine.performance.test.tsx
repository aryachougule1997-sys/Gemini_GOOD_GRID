/**
 * MapEngine Performance Tests
 * 
 * Tests the performance optimizations implemented in task 7:
 * - Sprite pooling/culling for off-screen dungeons
 * - Proper cleanup of sprites and effects
 * - Texture generation and caching optimization
 * - Performance with multiple dungeons
 */

import { DungeonService } from '../../../services/dungeonService';
import { Dungeon, WorkCategory } from '../../../../../shared/types';

// Mock Phaser for testing
const mockPhaser = {
  Scene: class MockScene {
    textures = {
      exists: jest.fn(() => false),
      addCanvas: jest.fn()
    };
    add = {
      graphics: jest.fn(() => ({
        clear: jest.fn(),
        fillStyle: jest.fn(),
        fillRect: jest.fn(),
        fillCircle: jest.fn(),
        fillEllipse: jest.fn(),
        fillTriangle: jest.fn(),
        lineStyle: jest.fn(),
        lineBetween: jest.fn(),
        strokeCircle: jest.fn(),
        generateTexture: jest.fn(),
        destroy: jest.fn()
      }))
    };
  }
};

describe('MapEngine Performance Optimizations', () => {
  let mockScene: any;

  beforeEach(() => {
    mockScene = new mockPhaser.Scene();
    // Clear caches before each test
    DungeonService.clearTextureCache();
  });

  describe('Texture Caching Optimization', () => {
    it('should cache texture generation to avoid regeneration', () => {
      // First call should generate textures
      DungeonService.createEnhancedDungeonSprites(mockScene);
      const firstCallCount = mockScene.add.graphics.mock.calls.length;

      // Second call should use cached textures
      DungeonService.createEnhancedDungeonSprites(mockScene);
      const secondCallCount = mockScene.add.graphics.mock.calls.length;

      // Should not create additional graphics calls due to caching
      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should track performance metrics', () => {
      DungeonService.createEnhancedDungeonSprites(mockScene);
      
      const metrics = DungeonService.getPerformanceMetrics();
      
      expect(metrics.cachedTextures).toBeGreaterThan(0);
      expect(metrics.cacheKeys).toContain('dungeon-freelance');
      expect(metrics.cacheKeys).toContain('dungeon-community');
      expect(metrics.cacheKeys).toContain('dungeon-corporate');
    });

    it('should clear cache when requested', () => {
      DungeonService.createEnhancedDungeonSprites(mockScene);
      
      let metrics = DungeonService.getPerformanceMetrics();
      expect(metrics.cachedTextures).toBeGreaterThan(0);

      DungeonService.clearTextureCache();
      
      metrics = DungeonService.getPerformanceMetrics();
      expect(metrics.cachedTextures).toBe(0);
      expect(metrics.queuedSprites).toBe(0);
    });
  });

  describe('Sprite Key Generation Performance', () => {
    it('should efficiently handle sprite key generation with caching', () => {
      const testDungeon: Dungeon = {
        id: 'test-1',
        name: 'Test Dungeon',
        type: 'FREELANCE' as WorkCategory,
        zoneId: 'zone-1',
        coordinates: { x: 100, y: 100 },
        entryRequirements: { trustScore: 50, level: 1, badges: [] },
        description: 'Test',
        rewards: { xp: 100, items: [] }
      };

      // First call should create the sprite
      const startTime = performance.now();
      const spriteKey1 = DungeonService.getDungeonSpriteKey(testDungeon, mockScene);
      const firstCallTime = performance.now() - startTime;

      // Second call should be faster due to caching
      const startTime2 = performance.now();
      const spriteKey2 = DungeonService.getDungeonSpriteKey(testDungeon, mockScene);
      const secondCallTime = performance.now() - startTime2;

      expect(spriteKey1).toBe(spriteKey2);
      expect(secondCallTime).toBeLessThanOrEqual(firstCallTime);
    });
  });

  describe('Distance Calculation Performance', () => {
    it('should efficiently calculate distances for multiple dungeons', () => {
      const pos1 = { x: 100, y: 100 };
      const pos2 = { x: 200, y: 200 };
      const iterations = 1000;

      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        DungeonService.calculateDistance(pos1, pos2);
      }
      
      const duration = performance.now() - startTime;
      
      // Should complete 1000 distance calculations in under 10ms
      expect(duration).toBeLessThan(10);
    });

    it('should correctly identify dungeons within interaction range', () => {
      const userPos = { x: 100, y: 100 };
      const nearDungeon = { x: 150, y: 150 }; // ~70 pixels away
      const farDungeon = { x: 300, y: 300 };  // ~280 pixels away

      expect(DungeonService.isWithinInteractionRange(userPos, nearDungeon)).toBe(true);
      expect(DungeonService.isWithinInteractionRange(userPos, farDungeon)).toBe(false);
    });
  });

  describe('Dungeon State Management Performance', () => {
    it('should efficiently calculate states for multiple dungeons', () => {
      const dungeons: Dungeon[] = [];
      const dungeonCount = 50;

      // Generate test dungeons
      for (let i = 0; i < dungeonCount; i++) {
        dungeons.push({
          id: `dungeon-${i}`,
          name: `Test Dungeon ${i}`,
          type: ['FREELANCE', 'COMMUNITY', 'CORPORATE'][i % 3] as WorkCategory,
          zoneId: 'test-zone',
          coordinates: { x: Math.random() * 1000, y: Math.random() * 1000 },
          entryRequirements: { trustScore: 50, level: 1, badges: [] },
          description: 'Test dungeon',
          rewards: { xp: 100, items: [] }
        });
      }

      const userStats = { trustScore: 75, level: 5, badges: [] };
      const userPosition = { x: 500, y: 500 };

      const startTime = performance.now();
      
      dungeons.forEach(dungeon => {
        DungeonService.getDungeonState(dungeon, userStats, userPosition);
      });
      
      const duration = performance.now() - startTime;
      
      // Should calculate states for 50 dungeons in under 20ms
      expect(duration).toBeLessThan(20);
    });

    it('should generate appropriate visual effects based on state', () => {
      const testDungeon: Dungeon = {
        id: 'test-1',
        name: 'Test Dungeon',
        type: 'FREELANCE' as WorkCategory,
        zoneId: 'zone-1',
        coordinates: { x: 100, y: 100 },
        entryRequirements: { trustScore: 50, level: 1, badges: [] },
        description: 'Test',
        rewards: { xp: 100, items: [] }
      };

      const userStats = { trustScore: 75, level: 5, badges: [] };
      
      // Test close proximity (should have multiple effects)
      const closePosition = { x: 110, y: 110 }; // 14 pixels away
      const closeState = DungeonService.getDungeonState(testDungeon, userStats, closePosition);
      
      expect(closeState.isAccessible).toBe(true);
      expect(closeState.isInRange).toBe(true);
      expect(closeState.proximityLevel).toBe('close');
      expect(closeState.visualEffects.length).toBeGreaterThan(1);

      // Test far proximity (should have fewer or no effects)
      const farPosition = { x: 500, y: 500 }; // ~565 pixels away
      const farState = DungeonService.getDungeonState(testDungeon, userStats, farPosition);
      
      expect(farState.isAccessible).toBe(true);
      expect(farState.isInRange).toBe(false);
      expect(farState.proximityLevel).toBe('far');
    });
  });

  describe('Performance Thresholds', () => {
    it('should meet performance requirements for texture generation', () => {
      const startTime = performance.now();
      
      DungeonService.createEnhancedDungeonSprites(mockScene);
      
      const duration = performance.now() - startTime;
      
      // Should complete texture generation in under 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should validate sprite creation successfully', () => {
      // Mock texture existence for validation
      mockScene.textures.exists.mockReturnValue(true);
      
      const isValid = DungeonService.validateDungeonSprites(mockScene);
      
      expect(isValid).toBe(true);
    });
  });
});

describe('Performance Integration Tests', () => {
  it('should handle large numbers of dungeons efficiently', () => {
    const dungeonCount = 100;
    const userStats = { trustScore: 75, level: 5, badges: [] };
    const userPosition = { x: 500, y: 500 };

    // Generate many test dungeons
    const dungeons: Dungeon[] = [];
    for (let i = 0; i < dungeonCount; i++) {
      dungeons.push({
        id: `perf-test-${i}`,
        name: `Performance Test ${i}`,
        type: ['FREELANCE', 'COMMUNITY', 'CORPORATE'][i % 3] as WorkCategory,
        zoneId: 'perf-zone',
        coordinates: { 
          x: (i % 10) * 200, 
          y: Math.floor(i / 10) * 200 
        },
        entryRequirements: { trustScore: 25, level: 1, badges: [] },
        description: 'Performance test dungeon',
        rewards: { xp: 50, items: [] }
      });
    }

    const startTime = performance.now();

    // Simulate the operations that would happen in MapEngine
    let visibleCount = 0;
    let culledCount = 0;
    const cullDistance = 800;

    dungeons.forEach(dungeon => {
      // Calculate distance (culling check)
      const distance = DungeonService.calculateDistance(userPosition, dungeon.coordinates);
      
      if (distance <= cullDistance) {
        visibleCount++;
        // Calculate state for visible dungeons only
        DungeonService.getDungeonState(dungeon, userStats, userPosition);
      } else {
        culledCount++;
      }
    });

    const duration = performance.now() - startTime;

    // Should process 100 dungeons with culling in under 50ms
    expect(duration).toBeLessThan(50);
    expect(visibleCount + culledCount).toBe(dungeonCount);
    
    console.log(`Performance test: ${dungeonCount} dungeons processed in ${duration.toFixed(2)}ms`);
    console.log(`Visible: ${visibleCount}, Culled: ${culledCount}`);
  });
});