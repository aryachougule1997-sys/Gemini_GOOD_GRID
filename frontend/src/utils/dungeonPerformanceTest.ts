import { Dungeon, WorkCategory } from '../../../shared/types';
import { DungeonService } from '../services/dungeonService';

export interface PerformanceTestResult {
  testName: string;
  duration: number;
  success: boolean;
  metrics: {
    dungeonCount: number;
    visibleDungeons: number;
    culledDungeons: number;
    texturesCached: number;
    memoryUsage?: number;
  };
  errors: string[];
}

export class DungeonPerformanceTest {
  private static readonly TEST_DUNGEON_COUNTS = [10, 25, 50, 100];
  private static readonly CATEGORIES: WorkCategory[] = ['FREELANCE', 'COMMUNITY', 'CORPORATE'];

  /**
   * Generate test dungeons for performance testing
   */
  static generateTestDungeons(count: number): Dungeon[] {
    const dungeons: Dungeon[] = [];
    
    for (let i = 0; i < count; i++) {
      const category = this.CATEGORIES[i % this.CATEGORIES.length];
      
      dungeons.push({
        id: `test-dungeon-${i}`,
        name: `Test ${category} ${i}`,
        type: category,
        zoneId: 'test-zone',
        coordinates: {
          x: Math.random() * 2000,
          y: Math.random() * 2000
        },
        entryRequirements: {
          trustScore: Math.floor(Math.random() * 100),
          level: Math.floor(Math.random() * 10) + 1,
          badges: []
        },
        specialFeatures: ['performance-test'],
        createdAt: new Date()
      });
    }
    
    return dungeons;
  }

  /**
   * Test texture generation performance
   */
  static async testTextureGeneration(): Promise<PerformanceTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    let success = true;

    try {
      // Clear cache to ensure fresh test
      DungeonService.clearTextureCache();

      // Create a mock Phaser scene for testing
      const mockScene = {
        add: {
          graphics: () => ({
            clear: () => {},
            fillStyle: () => {},
            fillRect: () => {},
            fillCircle: () => {},
            fillEllipse: () => {},
            fillTriangle: () => {},
            lineStyle: () => {},
            lineBetween: () => {},
            strokeCircle: () => {},
            generateTexture: () => {},
            destroy: () => {}
          })
        },
        textures: {
          exists: () => false,
          addCanvas: () => {}
        }
      } as any;

      // Test sprite generation for all categories
      DungeonService.createEnhancedDungeonSprites(mockScene);

      const metrics = DungeonService.getPerformanceMetrics();
      
      return {
        testName: 'Texture Generation',
        duration: performance.now() - startTime,
        success,
        metrics: {
          dungeonCount: 0,
          visibleDungeons: 0,
          culledDungeons: 0,
          texturesCached: metrics.cachedTextures
        },
        errors
      };
    } catch (error) {
      success = false;
      errors.push(`Texture generation failed: ${error}`);
      
      return {
        testName: 'Texture Generation',
        duration: performance.now() - startTime,
        success,
        metrics: {
          dungeonCount: 0,
          visibleDungeons: 0,
          culledDungeons: 0,
          texturesCached: 0
        },
        errors
      };
    }
  }

  /**
   * Test dungeon state calculation performance
   */
  static testStateCalculation(dungeonCount: number): PerformanceTestResult {
    const startTime = performance.now();
    const errors: string[] = [];
    let success = true;

    try {
      const testDungeons = this.generateTestDungeons(dungeonCount);
      const userStats = {
        trustScore: 75,
        level: 5,
        badges: ['test-badge']
      };
      const userPosition = { x: 1000, y: 1000 };

      // Calculate states for all dungeons
      testDungeons.forEach(dungeon => {
        DungeonService.getDungeonState(dungeon, userStats, userPosition);
      });

      return {
        testName: `State Calculation (${dungeonCount} dungeons)`,
        duration: performance.now() - startTime,
        success,
        metrics: {
          dungeonCount,
          visibleDungeons: 0,
          culledDungeons: 0,
          texturesCached: 0
        },
        errors
      };
    } catch (error) {
      success = false;
      errors.push(`State calculation failed: ${error}`);
      
      return {
        testName: `State Calculation (${dungeonCount} dungeons)`,
        duration: performance.now() - startTime,
        success,
        metrics: {
          dungeonCount,
          visibleDungeons: 0,
          culledDungeons: 0,
          texturesCached: 0
        },
        errors
      };
    }
  }

  /**
   * Test distance calculation performance
   */
  static testDistanceCalculation(iterations: number = 10000): PerformanceTestResult {
    const startTime = performance.now();
    const errors: string[] = [];
    let success = true;

    try {
      const pos1 = { x: 100, y: 100 };
      const pos2 = { x: 200, y: 200 };

      // Perform many distance calculations
      for (let i = 0; i < iterations; i++) {
        DungeonService.calculateDistance(pos1, pos2);
      }

      return {
        testName: `Distance Calculation (${iterations} iterations)`,
        duration: performance.now() - startTime,
        success,
        metrics: {
          dungeonCount: 0,
          visibleDungeons: 0,
          culledDungeons: 0,
          texturesCached: 0
        },
        errors
      };
    } catch (error) {
      success = false;
      errors.push(`Distance calculation failed: ${error}`);
      
      return {
        testName: `Distance Calculation (${iterations} iterations)`,
        duration: performance.now() - startTime,
        success,
        metrics: {
          dungeonCount: 0,
          visibleDungeons: 0,
          culledDungeons: 0,
          texturesCached: 0
        },
        errors
      };
    }
  }

  /**
   * Run comprehensive performance test suite
   */
  static async runPerformanceTestSuite(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];

    console.log('🚀 Starting Dungeon Performance Test Suite...');

    // Test texture generation
    console.log('📊 Testing texture generation...');
    results.push(await this.testTextureGeneration());

    // Test state calculation with different dungeon counts
    for (const count of this.TEST_DUNGEON_COUNTS) {
      console.log(`📊 Testing state calculation with ${count} dungeons...`);
      results.push(this.testStateCalculation(count));
    }

    // Test distance calculation performance
    console.log('📊 Testing distance calculation performance...');
    results.push(this.testDistanceCalculation());

    // Log results summary
    console.log('✅ Performance Test Suite Complete');
    console.table(results.map(r => ({
      Test: r.testName,
      Duration: `${r.duration.toFixed(2)}ms`,
      Success: r.success ? '✅' : '❌',
      Errors: r.errors.length
    })));

    return results;
  }

  /**
   * Validate performance thresholds
   */
  static validatePerformance(results: PerformanceTestResult[]): {
    passed: boolean;
    failures: string[];
  } {
    const failures: string[] = [];
    const thresholds = {
      textureGeneration: 100, // ms
      stateCalculation10: 5,   // ms
      stateCalculation25: 10,  // ms
      stateCalculation50: 20,  // ms
      stateCalculation100: 40, // ms
      distanceCalculation: 50  // ms
    };

    results.forEach(result => {
      if (!result.success) {
        failures.push(`${result.testName} failed: ${result.errors.join(', ')}`);
        return;
      }

      // Check specific thresholds
      if (result.testName === 'Texture Generation' && result.duration > thresholds.textureGeneration) {
        failures.push(`Texture generation too slow: ${result.duration.toFixed(2)}ms > ${thresholds.textureGeneration}ms`);
      }
      
      if (result.testName.includes('State Calculation (10 dungeons)') && result.duration > thresholds.stateCalculation10) {
        failures.push(`State calculation (10) too slow: ${result.duration.toFixed(2)}ms > ${thresholds.stateCalculation10}ms`);
      }
      
      if (result.testName.includes('State Calculation (25 dungeons)') && result.duration > thresholds.stateCalculation25) {
        failures.push(`State calculation (25) too slow: ${result.duration.toFixed(2)}ms > ${thresholds.stateCalculation25}ms`);
      }
      
      if (result.testName.includes('State Calculation (50 dungeons)') && result.duration > thresholds.stateCalculation50) {
        failures.push(`State calculation (50) too slow: ${result.duration.toFixed(2)}ms > ${thresholds.stateCalculation50}ms`);
      }
      
      if (result.testName.includes('State Calculation (100 dungeons)') && result.duration > thresholds.stateCalculation100) {
        failures.push(`State calculation (100) too slow: ${result.duration.toFixed(2)}ms > ${thresholds.stateCalculation100}ms`);
      }
      
      if (result.testName.includes('Distance Calculation') && result.duration > thresholds.distanceCalculation) {
        failures.push(`Distance calculation too slow: ${result.duration.toFixed(2)}ms > ${thresholds.distanceCalculation}ms`);
      }
    });

    return {
      passed: failures.length === 0,
      failures
    };
  }
}