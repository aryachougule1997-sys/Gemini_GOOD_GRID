import request from 'supertest';
import express from 'express';
import cors from 'cors';
import apiRoutes from '../routes';
import { UserModel } from '../models/User';
import { SpriteType, User, UserStats, CharacterData, LocationData, CategoryStats } from '../../../shared/types';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Mock UserModel methods
jest.mock('../models/User');
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('Authentication Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up JWT secret for tests
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123',
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
      }
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        characterData: validRegistrationData.characterData,
        locationData: validRegistrationData.locationData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockStats: UserStats = {
        userId: 'user-123',
        trustScore: 0,
        rwisScore: 0,
        xpPoints: 0,
        currentLevel: 1,
        unlockedZones: ['starter-zone'],
        categoryStats: {
          freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
          community: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
          corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] }
        }
      };

      mockUserModel.emailExists.mockResolvedValue(false);
      mockUserModel.usernameExists.mockResolvedValue(false);
      mockUserModel.create.mockResolvedValue(mockUser);
      mockUserModel.getStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.stats).toEqual(mockStats);
    });

    it('should reject registration with existing email', async () => {
      mockUserModel.emailExists.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should reject registration with existing username', async () => {
      mockUserModel.emailExists.mockResolvedValue(false);
      mockUserModel.usernameExists.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Username already taken');
    });

    it('should reject registration with invalid data', async () => {
      const invalidData = {
        username: 'ab', // Too short
        email: 'invalid-email',
        password: '123', // Too weak
        characterData: {},
        locationData: {}
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const mockUser: User & { passwordHash: string } = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        characterData: {
          baseSprite: 'DEFAULT' as SpriteType,
          colorPalette: { primary: '#FF0000', secondary: '#00FF00', accent: '#0000FF' },
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

      mockUserModel.findByEmail.mockResolvedValue(mockUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.getStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.stats).toEqual(mockStats);
    });

    it('should reject login with invalid credentials', async () => {
      mockUserModel.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should reject login with wrong password', async () => {
      const mockUser: User & { passwordHash: string } = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        characterData: {
          baseSprite: 'DEFAULT' as SpriteType,
          colorPalette: { primary: '#FF0000', secondary: '#00FF00', accent: '#0000FF' },
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

      mockUserModel.findByEmail.mockResolvedValue(mockUser);
      mockUserModel.verifyPassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });

  describe('POST /api/auth/verify', () => {
    it('should verify valid token successfully', async () => {
      const mockUser: User = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        characterData: {
          baseSprite: 'DEFAULT' as SpriteType,
          colorPalette: { primary: '#FF0000', secondary: '#00FF00', accent: '#0000FF' },
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
          freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
          community: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
          corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] }
        }
      };

      // First, get a valid token by mocking login
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.getStats.mockResolvedValue(mockStats);

      // Create a token manually for testing
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'user-123', username: 'testuser', email: 'test@example.com' },
        'test-secret-key',
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.stats).toEqual(mockStats);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token is required');
    });
  });
});