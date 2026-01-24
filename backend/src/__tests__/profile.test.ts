import request from 'supertest';
import express from 'express';
import cors from 'cors';
import apiRoutes from '../routes';
import { UserModel } from '../models/User';
import { SpriteType, User, UserStats } from '../../../shared/types';
import jwt from 'jsonwebtoken';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Mock UserModel methods
jest.mock('../models/User');
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('Profile Routes', () => {
  let authToken: string;
  const mockUser: User = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    characterData: {
      baseSprite: 'DEFAULT' as SpriteType,
      colorPalette: {
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF'
      },
      accessories: [],
      unlockedItems: []
    },
    locationData: {
      coordinates: { x: 100, y: 200 },
      currentZone: 'starter-zone',
      discoveredDungeons: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockStats: UserStats = {
    userId: 'user-123',
    trustScore: 50,
    rwisScore: 25,
    xpPoints: 100,
    currentLevel: 2,
    unlockedZones: ['starter-zone'],
    categoryStats: {
      freelance: { tasksCompleted: 1, totalXP: 50, averageRating: 4.5, specializations: [] },
      community: { tasksCompleted: 1, totalXP: 30, averageRating: 5.0, specializations: [] },
      corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Create auth token for authenticated requests
    authToken = jwt.sign(
      { userId: 'user-123', username: 'testuser', email: 'test@example.com' },
      'test-secret-key',
      { expiresIn: '7d' }
    );
  });

  describe('GET /api/profile', () => {
    it('should get current user profile successfully', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.getStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.stats).toEqual(mockStats);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should handle user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('PUT /api/profile', () => {
    it('should update character data successfully', async () => {
      const updatedCharacterData = {
        baseSprite: 'PROFESSIONAL' as SpriteType,
        colorPalette: {
          primary: '#000000',
          secondary: '#FFFFFF',
          accent: '#FF0000'
        },
        accessories: [],
        unlockedItems: []
      };

      const updatedUser = { ...mockUser, characterData: updatedCharacterData };

      mockUserModel.updateCharacterData.mockResolvedValue(undefined);
      mockUserModel.findById.mockResolvedValue(updatedUser);
      mockUserModel.getStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterData: updatedCharacterData });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.characterData.baseSprite).toBe('PROFESSIONAL');
      expect(mockUserModel.updateCharacterData).toHaveBeenCalledWith('user-123', updatedCharacterData);
    });

    it('should update location data successfully', async () => {
      const updatedLocationData = {
        coordinates: { x: 300, y: 400 },
        currentZone: 'advanced-zone',
        discoveredDungeons: ['dungeon-1', 'dungeon-2']
      };

      const updatedUser = { ...mockUser, locationData: updatedLocationData };

      mockUserModel.updateLocationData.mockResolvedValue(undefined);
      mockUserModel.findById.mockResolvedValue(updatedUser);
      mockUserModel.getStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ locationData: updatedLocationData });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.locationData.currentZone).toBe('advanced-zone');
      expect(mockUserModel.updateLocationData).toHaveBeenCalledWith('user-123', updatedLocationData);
    });

    it('should reject update with invalid data', async () => {
      const invalidData = {
        characterData: {
          baseSprite: 'INVALID_SPRITE',
          colorPalette: {
            primary: 'not-a-color',
            secondary: '#00FF00',
            accent: '#0000FF'
          }
        }
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({ characterData: {} });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('GET /api/profile/:userId', () => {
    it('should get public profile successfully', async () => {
      const publicUser = { ...mockUser };
      delete (publicUser as any).email; // Remove email from public profile

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.getStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/profile/user-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.email).toBeUndefined(); // Email should not be in public profile
      expect(response.body.data.stats).toEqual(mockStats);
    });

    it('should handle user not found for public profile', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/profile/nonexistent-user');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('DELETE /api/profile', () => {
    it('should delete account successfully', async () => {
      mockUserModel.delete.mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account deleted successfully');
      expect(mockUserModel.delete).toHaveBeenCalledWith('user-123');
    });

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete('/api/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });
});