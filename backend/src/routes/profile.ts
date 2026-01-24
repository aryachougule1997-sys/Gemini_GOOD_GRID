import express from 'express';
import { UserModel } from '../models/User';
import { authenticate } from '../middleware/auth';
import { validate, updateProfileSchema } from '../middleware/validation';
import { ApiResponse } from '../../../shared/types';

const router = express.Router();

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user data
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<null>);
    }

    // Get user stats
    const userStats = await UserModel.getStats(userId);

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
      message: 'Profile retrieved successfully'
    } as ApiResponse<{
      user: any;
      stats: any;
    }>);

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile'
    } as ApiResponse<null>);
  }
});

/**
 * PUT /api/profile
 * Update current user's profile
 */
router.put('/', authenticate, validate(updateProfileSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { characterData, locationData } = req.body;

    // Update character data if provided
    if (characterData) {
      await UserModel.updateCharacterData(userId, characterData);
    }

    // Update location data if provided
    if (locationData) {
      await UserModel.updateLocationData(userId, locationData);
    }

    // Get updated user data
    const updatedUser = await UserModel.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<null>);
    }

    // Get user stats
    const userStats = await UserModel.getStats(userId);

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          characterData: updatedUser.characterData,
          locationData: updatedUser.locationData,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        },
        stats: userStats
      },
      message: 'Profile updated successfully'
    } as ApiResponse<{
      user: any;
      stats: any;
    }>);

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/profile/:userId
 * Get public profile of another user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user data
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<null>);
    }

    // Get user stats
    const userStats = await UserModel.getStats(userId);

    // Return public profile (no email)
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          characterData: user.characterData,
          locationData: user.locationData,
          createdAt: user.createdAt
        },
        stats: userStats
      },
      message: 'Public profile retrieved successfully'
    } as ApiResponse<{
      user: any;
      stats: any;
    }>);

  } catch (error) {
    console.error('Public profile retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile'
    } as ApiResponse<null>);
  }
});

/**
 * DELETE /api/profile
 * Delete current user's account
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Delete user account (CASCADE will handle related data)
    await UserModel.delete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    } as ApiResponse<null>);

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    } as ApiResponse<null>);
  }
});

export default router;