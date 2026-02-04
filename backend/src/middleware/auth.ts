import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role?: string;
      };
    }
  }
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * Generate JWT token for user
 */
export const generateToken = (user: { id: string; username: string; email: string }): string => {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  // Use explicit typing to avoid TypeScript issues
  return jwt.sign(payload as any, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as any);
};

/**
 * Verify JWT token and extract user info
 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.verify(token, secret) as JWTPayload;
};

/**
 * Authentication middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      
      // Verify user still exists
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Add user info to request
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: 'user' // Default role, could be enhanced to fetch from database
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Authentication middleware (alias for authenticate)
 */
export const authenticateToken = authenticate;