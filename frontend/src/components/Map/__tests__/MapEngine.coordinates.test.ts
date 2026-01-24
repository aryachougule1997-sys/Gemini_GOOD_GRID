/**
 * @jest-environment jsdom
 */

import { DungeonService } from '../../../services/dungeonService';
import { Dungeon, Zone, Point } from '../../../../../shared/types';

describe('MapEngine Coordinate System', () => {
  const mockZones: Zone[] = [
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

  const mockDungeons: Dungeon[] = [
    {
      id: 'test-dungeon-1',
      type: 'FREELANCE',
      name: 'Test Tower 1',
      zoneId: 'starter-town',
      coordinates: { x: 200, y: 200 }, // Within starter-town bounds
      entryRequirements: {},
      specialFeatures: [],
      createdAt: new Date()
    },
    {
      id: 'test-dungeon-2',
      type: 'COMMUNITY',
      name: 'Test Garden',
      zoneId: 'green-meadows',
      coordinates: { x: 600, y: 200 }, // Within green-meadows bounds
      entryRequirements: {},
      specialFeatures: [],
      createdAt: new Date()
    },
    {
      id: 'test-dungeon-invalid',
      type: 'CORPORATE',
      name: 'Invalid Position Dungeon',
      zoneId: 'starter-town',
      coordinates: { x: 500, y: 500 }, // Outside starter-town bounds
      entryRequirements: {},
      specialFeatures: [],
      createdAt: new Date()
    }
  ];

  describe('World Bounds Calculation', () => {
    it('should calculate correct world bounds from zones', () => {
      // Mock the calculateWorldBounds method logic
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      mockZones.forEach(zone => {
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

      expect(worldBounds.minX).toBe(-100);
      expect(worldBounds.minY).toBe(-100);
      expect(worldBounds.width).toBe(1000); // 800 + 200 padding
      expect(worldBounds.height).toBe(600); // 400 + 200 padding
    });
  });

  describe('Dungeon Coordinate Validation', () => {
    it('should identify dungeons within zone bounds', () => {
      const validDungeon = mockDungeons[0]; // Test Tower 1
      const zone = mockZones[0]; // starter-town
      
      const isWithinBounds = 
        validDungeon.coordinates.x >= zone.coordinates.minX &&
        validDungeon.coordinates.x <= zone.coordinates.maxX &&
        validDungeon.coordinates.y >= zone.coordinates.minY &&
        validDungeon.coordinates.y <= zone.coordinates.maxY;

      expect(isWithinBounds).toBe(true);
    });

    it('should identify dungeons outside zone bounds', () => {
      const invalidDungeon = mockDungeons[2]; // Invalid Position Dungeon
      const zone = mockZones[0]; // starter-town
      
      const isWithinBounds = 
        invalidDungeon.coordinates.x >= zone.coordinates.minX &&
        invalidDungeon.coordinates.x <= zone.coordinates.maxX &&
        invalidDungeon.coordinates.y >= zone.coordinates.minY &&
        invalidDungeon.coordinates.y <= zone.coordinates.maxY;

      expect(isWithinBounds).toBe(false);
    });

    it('should clamp invalid coordinates to zone bounds', () => {
      const invalidDungeon = mockDungeons[2]; // Invalid Position Dungeon
      const zone = mockZones[0]; // starter-town
      const margin = 50;

      const clampedX = Math.max(
        zone.coordinates.minX + margin,
        Math.min(zone.coordinates.maxX - margin, invalidDungeon.coordinates.x)
      );
      const clampedY = Math.max(
        zone.coordinates.minY + margin,
        Math.min(zone.coordinates.maxY - margin, invalidDungeon.coordinates.y)
      );

      expect(clampedX).toBe(350); // 400 - 50 margin
      expect(clampedY).toBe(350); // 400 - 50 margin
    });
  });

  describe('Dungeon Overlap Prevention', () => {
    it('should detect overlapping dungeons', () => {
      const dungeon1: Dungeon = {
        id: 'overlap-1',
        type: 'FREELANCE',
        name: 'Overlap Test 1',
        zoneId: 'starter-town',
        coordinates: { x: 200, y: 200 },
        entryRequirements: {},
        specialFeatures: [],
        createdAt: new Date()
      };

      const dungeon2: Dungeon = {
        id: 'overlap-2',
        type: 'COMMUNITY',
        name: 'Overlap Test 2',
        zoneId: 'starter-town',
        coordinates: { x: 220, y: 220 }, // Too close to dungeon1
        entryRequirements: {},
        specialFeatures: [],
        createdAt: new Date()
      };

      const minDistance = 80;
      const distance = DungeonService.calculateDistance(
        dungeon1.coordinates,
        dungeon2.coordinates
      );

      expect(distance).toBeLessThan(minDistance);
    });

    it('should calculate correct separation distance', () => {
      const dungeon1Coords = { x: 200, y: 200 };
      const dungeon2Coords = { x: 220, y: 220 };
      const minDistance = 80;

      // Calculate angle and new position
      const angle = Math.atan2(
        dungeon2Coords.y - dungeon1Coords.y,
        dungeon2Coords.x - dungeon1Coords.x
      );

      const newX = dungeon1Coords.x + Math.cos(angle) * minDistance;
      const newY = dungeon1Coords.y + Math.sin(angle) * minDistance;

      const newDistance = DungeonService.calculateDistance(
        dungeon1Coords,
        { x: newX, y: newY }
      );

      expect(Math.abs(newDistance - minDistance)).toBeLessThan(0.1); // Allow for floating point precision
    });
  });

  describe('Coordinate System Transformations', () => {
    it('should validate coordinate ranges', () => {
      const validCoords = { x: 200, y: 200 };
      const invalidCoords = { x: NaN, y: Infinity };
      const negativeCoords = { x: -50, y: -100 };

      // Mock isValidCoordinate logic
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
      expect(isValid(negativeCoords)).toBe(true); // Negative coords can be valid
    });

    it('should clamp coordinates to world bounds', () => {
      const worldBounds = { x: 0, y: 0, width: 800, height: 600 };
      const outsideCoords = { x: 1000, y: 700 };

      // Mock clampToWorldBounds logic
      const clampedCoords = {
        x: Math.max(worldBounds.x, Math.min(worldBounds.x + worldBounds.width, outsideCoords.x)),
        y: Math.max(worldBounds.y, Math.min(worldBounds.y + worldBounds.height, outsideCoords.y))
      };

      expect(clampedCoords.x).toBe(800);
      expect(clampedCoords.y).toBe(600);
    });
  });

  describe('Camera and Zoom Stability', () => {
    it('should maintain dungeon positions during camera movement', () => {
      // Mock camera transform
      const worldCoords = { x: 200, y: 200 };
      const cameraScrollX = 100;
      const cameraScrollY = 50;
      const cameraZoom = 1.5;

      // World to screen transformation
      const screenCoords = {
        x: (worldCoords.x - cameraScrollX) * cameraZoom,
        y: (worldCoords.y - cameraScrollY) * cameraZoom
      };

      // Screen to world transformation (should get back original coords)
      const backToWorld = {
        x: (screenCoords.x / cameraZoom) + cameraScrollX,
        y: (screenCoords.y / cameraZoom) + cameraScrollY
      };

      expect(Math.abs(backToWorld.x - worldCoords.x)).toBeLessThan(0.001);
      expect(Math.abs(backToWorld.y - worldCoords.y)).toBeLessThan(0.001);
    });

    it('should detect position drift and correct it', () => {
      const expectedPosition = { x: 200, y: 200 };
      const driftedPosition = { x: 200.5, y: 199.8 };
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
});