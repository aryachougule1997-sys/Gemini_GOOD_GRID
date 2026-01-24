import express from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../middleware/validation';
import { ApiResponse } from '../../../shared/types';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { username, email, password, characterData, locationData } = req.body;

    // Check if email already exists
    const existingEmail = await UserModel.emailExists(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      } as ApiResponse<null>);
    }

    // Check if username already exists
    const existingUsername = await UserModel.usernameExists(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        error: 'Username already taken'
      } as ApiResponse<null>);
    }

    // Create new user
    const user = await UserModel.create({
      username,
      email,
      password,
      characterData,
      locationData
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    // Get user stats
    const userStats = await UserModel.getStats(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          characterData: user.characterData,
          locationData: user.locationData,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        stats: userStats,
        token
      },
      message: 'User registered successfully'
    } as ApiResponse<{
      user: any;
      stats: any;
      token: string;
    }>);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    } as ApiResponse<null>);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse<null>);
    }

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse<null>);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    // Get user stats
    const userStats = await UserModel.getStats(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          characterData: user.characterData,
          locationData: user.locationData,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        stats: userStats,
        token
      },
      message: 'Login successful'
    } as ApiResponse<{
      user: any;
      stats: any;
      token: string;
    }>);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    } as ApiResponse<null>);
  }
});

/**
 * POST /api/auth/verify
 * Verify JWT token and return user info
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      } as ApiResponse<null>);
    }

    // Import here to avoid circular dependency
    const { verifyToken } = await import('../middleware/auth');
    
    try {
      const decoded = verifyToken(token);
      
      // Get fresh user data
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        } as ApiResponse<null>);
      }

      // Get user stats
      const userStats = await UserModel.getStats(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            characterData: user.characterData,
            locationData: user.locationData,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          stats: userStats
        },
        message: 'Token verified successfully'
      } as ApiResponse<{
        user: any;
        stats: any;
      }>);

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      } as ApiResponse<null>);
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    } as ApiResponse<null>);
  }
});

export default router;