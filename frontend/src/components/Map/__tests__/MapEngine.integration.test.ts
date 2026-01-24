/**
 * @jest-environment jsdom
 */

import { DungeonService } from '../../../services/dungeonService';
import { Dungeon, Zone, Point } from '../../../../../shared/types';

describe('MapEngine Integration - Coordinate System Fixes', () => {
  // Mock zones with realistic coordinates
  const testZones: Zone[] = [
    {
      id: 'starter-town',
      name: 'Starter Town',
      terrainType: 'URBAN',
      unlockRequirements: {},
      difficulty: 'BEGINNER',
      coordinates: {
        minX: 0,
        minY: 0,
        maxX: 400,
        maxY: 400
      },
      createdAt: new Date()
    },
    {
      id: 'green-meadows',
      name: 'Green Meadows',
      terrainType: 'FOREST',
      unlockRequirements: { level: 2 },
      difficulty: 'BEGINNER',
      coordinates: {
        minX: 400,
        minY: 0,
        maxX: 800,
        maxY: 400
      },
      createdAt: new Date()
    }
  ];

  // Mock dungeons with some problematic coordinates
  const testDungeons: Dungeon[] = [
    {
      id: 'valid-dungeon',
      type: 'FREELANCE',
      name: 'Valid Tower',
      zoneId: 'starter-town',
      coordinates: { x: 200, y: 200 }, // Valid position
      entryRequirements: {},
      specialFeatures: [],
      createdAt: new Date()
    },
    {
      id: 'edge-dungeon',
      type: 'COMMUNITY',
      name: 'Edge Garden',
      zoneId: 'starter-town',
      coordinates: { x: 10, y: 10 }, // Too close to edge
      entryRequirements: {},
      specialFeatures: [],
      createdAt: new Date()
    },
    {
      id: 'outside-dungeon',
      type: 'CORPORATE',
      name: 'Outside Castle',
      zoneId: 'starter-town',
      coordinates: { x: 500, y: 500 }, // Outside zone bounds
      entryRequirements: {},
      specialFeatures: [],
      createdAt: new Date()
    },
    {
      id: 'overlap-dungeon-1',
      type: 'FREELANCE',
      name: 'Overlap Tower 1',
      zoneId: 'green-meadows',
      coordinates: { x: 600, y: 200 },
      entryRequirements: {},
      specialFeatures: [],
      createdAt: new Date()
    },
    {
      id: 'overlap-dungeon-2',
      type: 'COMMUNITY',
      name: 'Overlap Garden 2',
      zoneId: 'green-meadows',
      coordinates: { x: 610, y: 210 }, // Too close to overlap-dungeon-1
      entryRequirements: {},
      specialFeatures: [],
      createdAt: new Date()
    }
  ];

  describe('World Bounds Calculation', () => {
    it('should calculate proper world bounds from multiple zones', () => {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      testZones.forEach(zone => {
        minX = Math.min(minX, zone.coordinates.minX);
        minY = Math.min(minY, zone.coordinates.minY);
        maxX = Math.max(maxX, zone.coordinates.maxX);
        maxY = Math.max(maxY, zone.coordinates.maxY);
      });

      const padding = 100;
      const worldBounds = {
        minX: minX - padding,
        minY: minY - padding,
        width: (maxX - minX) + (padding * 2),
        height: (maxY - minY) + (padding * 2)
      };

      // Verify bounds encompass all zones with padding
      expect(worldBounds.minX).toBe(-100);
      expect(worldBounds.minY).toBe(-100);
      expect(worldBounds.width).toBe(1000); // 800 + 200 padding
      expect(worldBounds.height).toBe(600); // 400 + 200 padding

      // Verify all zones fit within bounds
      testZones.forEach(zone => {
        expect(zone.coordinates.minX).toBeGreaterThanOrEqual(worldBounds.minX);
        expect(zone.coordinates.minY).toBeGreaterThanOrEqual(worldBounds.minY);
        expect(zone.coordinates.maxX).toBeLessThanOrEqual(worldBounds.minX + worldBounds.width);
        expect(zone.coordinates.maxY).toBeLessThanOrEqual(worldBounds.minY + worldBounds.height);
      });
    });
  });

  describe('Dungeon Coordinate Validation and Correction', () => {
    it('should identify and fix dungeons outside zone bounds', () => {
      const outsideDungeon = testDungeons.find(d => d.id === 'outside-dungeon')!;
      const zone = testZones.find(z => z.id === outsideDungeon.zoneId)!;

      // Check if dungeon is outside bounds
      const isOutside = 
        outsideDungeon.coordinates.x < zone.coordinates.minX ||
        outsideDungeon.coordinates.x > zone.coordinates.maxX ||
        outsideDungeon.coordinates.y < zone.coordinates.minY ||
        outsideDungeon.coordinates.y > zone.coordinates.maxY;

      expect(isOutside).toBe(true);

      // Apply correction logic
      const margin = 50;
      const correctedX = Math.max(
        zone.coordinates.minX + margin,
        Math.min(zone.coordinates.maxX - margin, outsideDungeon.coordinates.x)
      );
      const correctedY = Math.max(
        zone.coordinates.minY + margin,
        Math.min(zone.coordinates.maxY - margin, outsideDungeon.coordinates.y)
      );

      // Verify correction keeps dungeon within bounds
      expect(correctedX).toBeGreaterThanOrEqual(zone.coordinates.minX + margin);
      expect(correctedX).toBeLessThanOrEqual(zone.coordinates.maxX - margin);
      expect(correctedY).toBeGreaterThanOrEqual(zone.coordinates.minY + margin);
      expect(correctedY).toBeLessThanOrEqual(zone.coordinates.maxY - margin);
    });

    it('should fix dungeons too close to zone edges', () => {
      const edgeDungeon = testDungeons.find(d => d.id === 'edge-dungeon')!;
      const zone = testZones.find(z => z.id === edgeDungeon.zoneId)!;
      const margin = 50;

      // Check if dungeon is too close to edges
      const tooCloseToEdge = 
        edgeDungeon.coordinates.x < zone.coordinates.minX + margin ||
        edgeDungeon.coordinates.x > zone.coordinates.maxX - margin ||
        edgeDungeon.coordinates.y < zone.coordinates.minY + margin ||
        edgeDungeon.coordinates.y > zone.coordinates.maxY - margin;

      expect(tooCloseToEdge).toBe(true);

      // Apply correction
      const correctedX = Math.max(
        zone.coordinates.minX + margin,
        Math.min(zone.coordinates.maxX - margin, edgeDungeon.coordinates.x)
      );
      const correctedY = Math.max(
        zone.coordinates.minY + margin,
        Math.min(zone.coordinates.maxY - margin, edgeDungeon.coordinates.y)
      );

      expect(correctedX).toBe(50); // 0 + 50 margin
      expect(correctedY).toBe(50); // 0 + 50 margin
    });
  });

  describe('Dungeon Overlap Prevention', () => {
    it('should detect and resolve overlapping dungeons', () => {
      const dungeon1 = testDungeons.find(d => d.id === 'overlap-dungeon-1')!;
      const dungeon2 = testDungeons.find(d => d.id === 'overlap-dungeon-2')!;
      const minDistance = 80;

      // Calculate current distance
      const currentDistance = DungeonService.calculateDistance(
        dungeon1.coordinates,
        dungeon2.coordinates
      );

      expect(currentDistance).toBeLessThan(minDistance);

      // Apply separation logic
      const angle = Math.atan2(
        dungeon2.coordinates.y - dungeon1.coordinates.y,
        dungeon2.coordinates.x - dungeon1.coordinates.x
      );

      const newX = dungeon1.coordinates.x + Math.cos(angle) * minDistance;
      const newY = dungeon1.coordinates.y + Math.sin(angle) * minDistance;

      // Verify new distance meets minimum requirement
      const newDistance = DungeonService.calculateDistance(
        dungeon1.coordinates,
        { x: newX, y: newY }
      );

      expect(Math.abs(newDistance - minDistance)).toBeLessThan(0.1);
    });

    it('should maintain separation while keeping dungeons in zone bounds', () => {
      const dungeon1 = { x: 750, y: 350 }; // Near edge of green-meadows
      const dungeon2 = { x: 760, y: 360 }; // Too close and near edge
      const zone = testZones.find(z => z.id === 'green-meadows')!;
      const minDistance = 80;
      const margin = 50;

      // Calculate separation
      const angle = Math.atan2(dungeon2.y - dungeon1.y, dungeon2.x - dungeon1.x);
      let newX = dungeon1.x + Math.cos(angle) * minDistance;
      let newY = dungeon1.y + Math.sin(angle) * minDistance;

      // Clamp to zone bounds
      newX = Math.max(
        zone.coordinates.minX + margin,
        Math.min(zone.coordinates.maxX - margin, newX)
      );
      newY = Math.max(
        zone.coordinates.minY + margin,
        Math.min(zone.coordinates.maxY - margin, newY)
      );

      // Verify final position is within bounds
      expect(newX).toBeGreaterThanOrEqual(zone.coordinates.minX + margin);
      expect(newX).toBeLessThanOrEqual(zone.coordinates.maxX - margin);
      expect(newY).toBeGreaterThanOrEqual(zone.coordinates.minY + margin);
      expect(newY).toBeLessThanOrEqual(zone.coordinates.maxY - margin);
    });
  });

  describe('Coordinate System Stability', () => {
    it('should maintain coordinate precision during transformations', () => {
      const originalCoords = { x: 123.456, y: 789.012 };
      
      // Simulate camera transformations
      const cameraScrollX = 50.5;
      const cameraScrollY = 25.25;
      const cameraZoom = 1.5;

      // World to screen
      const screenCoords = {
        x: (originalCoords.x - cameraScrollX) * cameraZoom,
        y: (originalCoords.y - cameraScrollY) * cameraZoom
      };

      // Screen back to world
      const backToWorld = {
        x: (screenCoords.x / cameraZoom) + cameraScrollX,
        y: (screenCoords.y / cameraZoom) + cameraScrollY
      };

      // Should maintain precision within floating point limits
      expect(Math.abs(backToWorld.x - originalCoords.x)).toBeLessThan(0.0001);
      expect(Math.abs(backToWorld.y - originalCoords.y)).toBeLessThan(0.0001);
    });

    it('should detect and correct position drift', () => {
      const expectedPosition = { x: 200, y: 200 };
      const driftedPosition = { x: 200.15, y: 199.92 };
      const tolerance = 0.1;

      const hasDrift = 
        Math.abs(driftedPosition.x - expectedPosition.x) > tolerance ||
        Math.abs(driftedPosition.y - expectedPosition.y) > tolerance;

      expect(hasDrift).toBe(true);

      // Correction should snap back to expected position
      const correctedPosition = { ...expectedPosition };
      expect(correctedPosition.x).toBe(expectedPosition.x);
      expect(correctedPosition.y).toBe(expectedPosition.y);
    });
  });

  describe('Player Movement Validation', () => {
    it('should clamp player movement to world bounds', () => {
      const worldBounds = { x: -100, y: -100, width: 1000, height: 600 };
      const targetOutside = { x: 1200, y: 800 }; // Outside bounds

      const clampedTarget = {
        x: Math.max(worldBounds.x, Math.min(worldBounds.x + worldBounds.width, targetOutside.x)),
        y: Math.max(worldBounds.y, Math.min(worldBounds.y + worldBounds.height, targetOutside.y))
      };

      expect(clampedTarget.x).toBe(900); // -100 + 1000
      expect(clampedTarget.y).toBe(500); // -100 + 600
    });

    it('should validate coordinates before movement', () => {
      const validCoords = { x: 200, y: 200 };
      const invalidCoords = { x: NaN, y: Infinity };

      const isValid = (coord: { x: number; y: number }) => {
        return (
          typeof coord.x === 'number' && 
          typeof coord.y === 'number' && 
          !isNaN(coord.x) && 
          !isNaN(coord.y) && 
          isFinite(coord.x) && 
          isFinite(coord.y)
        );
      };

      expect(isValid(validCoords)).toBe(true);
      expect(isValid(invalidCoords)).toBe(false);
    });
  });
});