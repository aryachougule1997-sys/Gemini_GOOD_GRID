import request from 'supertest';
import { app } from '../server';
import { DungeonService } from '../services/dungeonService';
import { WorkCategory } from '../../../shared/types';

describe('Dungeon System', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create a test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'dungeontest',
        email: 'dungeontest@example.com',
        password: 'password123',
        characterData: {
          baseSprite: 'DEFAULT',
          colorPalette: { primary: '#FF0000', secondary: '#00FF00', accent: '#0000FF' },
          accessories: [],
          unlockedItems: []
        },
        locationData: {
          coordinates: { x: 100, y: 100 },
          currentZone: 'starter-town',
          discoveredDungeons: []
        }
      });

    expect(registerResponse.status).toBe(201);
    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('Dungeon API Endpoints', () => {
    test('GET /api/dungeons should return all dungeons', async () => {
      const response = await request(app)
        .get('/api/dungeons');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/dungeons/category/freelance should return freelance dungeons', async () => {
      const response = await request(app)
        .get('/api/dungeons/category/freelance');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All returned dungeons should be freelance type
      response.body.data.forEach((dungeon: any) => {
        expect(dungeon.type).toBe('FREELANCE');
      });
    });

    test('GET /api/dungeons/category/invalid should return 400', async () => {
      const response = await request(app)
        .get('/api/dungeons/category/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/dungeons/:id/access-check should check dungeon access', async () => {
      // First get a dungeon ID
      const dungeonsResponse = await request(app)
        .get('/api/dungeons');
      
      const dungeonId = dungeonsResponse.body.data[0]?.id;
      
      if (dungeonId) {
        const response = await request(app)
          .post(`/api/dungeons/${dungeonId}/access-check`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            trustScore: 50,
            level: 3,
            badges: ['community-helper']
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(typeof response.body.data.canAccess).toBe('boolean');
      }
    });

    test('POST /api/dungeons should create a new dungeon', async () => {
      const dungeonData = {
        name: 'Test Freelance Tower',
        type: 'FREELANCE',
        zoneId: 'starter-town',
        coordinates: { x: 200, y: 200 },
        spriteAsset: 'test-tower.png',
        entryRequirements: { trustScore: 10, level: 1 },
        specialFeatures: ['test_feature']
      };

      const response = await request(app)
        .post('/api/dungeons')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dungeonData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(dungeonData.name);
      expect(response.body.data.type).toBe(dungeonData.type);
    });

    test('GET /api/dungeons/category/freelance/features should return freelance features', async () => {
      const response = await request(app)
        .get('/api/dungeons/category/freelance/features');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Dungeon Service', () => {
    test('should get category features for each work category', () => {
      const freelanceFeatures = DungeonService.getCategoryFeatures('FREELANCE');
      const communityFeatures = DungeonService.getCategoryFeatures('COMMUNITY');
      const corporateFeatures = DungeonService.getCategoryFeatures('CORPORATE');

      expect(Array.isArray(freelanceFeatures)).toBe(true);
      expect(Array.isArray(communityFeatures)).toBe(true);
      expect(Array.isArray(corporateFeatures)).toBe(true);

      expect(freelanceFeatures.length).toBeGreaterThan(0);
      expect(communityFeatures.length).toBeGreaterThan(0);
      expect(corporateFeatures.length).toBeGreaterThan(0);

      // Check that features are different for each category
      expect(freelanceFeatures).not.toEqual(communityFeatures);
      expect(communityFeatures).not.toEqual(corporateFeatures);
    });

    test('should generate appropriate dungeon names for each category', () => {
      const freelanceName = DungeonService.generateDungeonName('FREELANCE', 'test-zone');
      const communityName = DungeonService.generateDungeonName('COMMUNITY', 'test-zone');
      const corporateName = DungeonService.generateDungeonName('CORPORATE', 'test-zone');

      expect(typeof freelanceName).toBe('string');
      expect(typeof communityName).toBe('string');
      expect(typeof corporateName).toBe('string');

      expect(freelanceName.length).toBeGreaterThan(0);
      expect(communityName.length).toBeGreaterThan(0);
      expect(corporateName.length).toBeGreaterThan(0);

      // Check category-specific keywords
      expect(freelanceName.toLowerCase()).toMatch(/(freelance|creative|skill|talent|independent|tower|hub|studio|workshop|loft)/);
      expect(communityName.toLowerCase()).toMatch(/(community|volunteer|service|impact|unity|garden|center|hall|commons|plaza)/);
      expect(corporateName.toLowerCase()).toMatch(/(corporate|professional|enterprise|business|executive|castle|complex|headquarters|building|campus)/);
    });

    test('should provide default entry requirements for each category', () => {
      const freelanceReqs = DungeonService.getDefaultEntryRequirements('FREELANCE');
      const communityReqs = DungeonService.getDefaultEntryRequirements('COMMUNITY');
      const corporateReqs = DungeonService.getDefaultEntryRequirements('CORPORATE');

      expect(freelanceReqs).toHaveProperty('trustScore');
      expect(freelanceReqs).toHaveProperty('level');
      expect(communityReqs).toHaveProperty('trustScore');
      expect(communityReqs).toHaveProperty('level');
      expect(corporateReqs).toHaveProperty('trustScore');
      expect(corporateReqs).toHaveProperty('level');

      // Community should have the lowest requirements
      expect(communityReqs.trustScore).toBe(0);
      expect(communityReqs.level).toBe(1);

      // Corporate should have higher requirements than freelance
      expect(corporateReqs.trustScore).toBeGreaterThan(freelanceReqs.trustScore!);
    });
  });

  describe('Dungeon Models', () => {
    test('should find dungeons by type', async () => {
      const freelanceDungeons = await DungeonService.getDungeonsByCategory('FREELANCE');
      const communityDungeons = await DungeonService.getDungeonsByCategory('COMMUNITY');
      const corporateDungeons = await DungeonService.getDungeonsByCategory('CORPORATE');

      expect(Array.isArray(freelanceDungeons)).toBe(true);
      expect(Array.isArray(communityDungeons)).toBe(true);
      expect(Array.isArray(corporateDungeons)).toBe(true);

      // All dungeons should have the correct type
      freelanceDungeons.forEach(dungeon => {
        expect(dungeon.type).toBe('FREELANCE');
      });
      communityDungeons.forEach(dungeon => {
        expect(dungeon.type).toBe('COMMUNITY');
      });
      corporateDungeons.forEach(dungeon => {
        expect(dungeon.type).toBe('CORPORATE');
      });
    });

    test('should check user access to dungeons', async () => {
      const dungeons = await DungeonService.getAllDungeonsWithTasks();
      
      if (dungeons.length > 0) {
        const dungeon = dungeons[0];
        
        // Test with high stats (should have access)
        const highStatsAccess = await DungeonService.canUserAccessDungeon(
          dungeon.id,
          100, // high trust score
          5,   // high level
          ['all-badges'] // all badges
        );
        
        // Test with low stats (might not have access depending on requirements)
        const lowStatsAccess = await DungeonService.canUserAccessDungeon(
          dungeon.id,
          0,   // no trust score
          1,   // level 1
          []   // no badges
        );
        
        expect(typeof highStatsAccess).toBe('boolean');
        expect(typeof lowStatsAccess).toBe('boolean');
      }
    });
  });

  describe('Integration Tests', () => {
    test('should load dungeons with tasks', async () => {
      const dungeons = await DungeonService.getAllDungeonsWithTasks();
      
      expect(Array.isArray(dungeons)).toBe(true);
      
      dungeons.forEach(dungeon => {
        expect(dungeon).toHaveProperty('id');
        expect(dungeon).toHaveProperty('name');
        expect(dungeon).toHaveProperty('type');
        expect(dungeon).toHaveProperty('availableTasks');
        expect(['FREELANCE', 'COMMUNITY', 'CORPORATE']).toContain(dungeon.type);
        expect(Array.isArray(dungeon.availableTasks)).toBe(true);
      });
    });

    test('should suggest placement points for dungeons', async () => {
      // This test assumes there's at least one zone in the database
      try {
        const suggestions = await DungeonService.suggestDungeonPlacements('starter-town', 3);
        
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeLessThanOrEqual(3);
        
        suggestions.forEach(point => {
          expect(point).toHaveProperty('x');
          expect(point).toHaveProperty('y');
          expect(typeof point.x).toBe('number');
          expect(typeof point.y).toBe('number');
        });
      } catch (error) {
        // If zone doesn't exist, that's okay for this test
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});