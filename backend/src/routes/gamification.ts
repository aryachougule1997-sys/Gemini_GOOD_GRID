import express from 'express';
import { GamificationService } from '../services/gamificationService';
import { ProgressionTrackingService } from '../services/progressionTrackingService';
import { BadgeInitializationService } from '../services/badgeInitializationService';
import { UserModel } from '../models/User';
import { BadgeModel, UserAchievementModel } from '../models/Badge';
import { authenticate as authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../../../shared/types';

const router = express.Router();

/**
 * Get user's progression status
 */
router.get('/progression/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists and requesting user has permission
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      } as ApiResponse<null>);
    }

    const progressionStatus = await GamificationService.getUserProgressionStatus(userId);
    
    if (!progressionStatus) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: progressionStatus
    } as ApiResponse<typeof progressionStatus>);
  } catch (error) {
    console.error('Error getting progression status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Get comprehensive progression summary
 */
router.get('/summary/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists and requesting user has permission
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      } as ApiResponse<null>);
    }

    const summary = await ProgressionTrackingService.getUserProgressionSummary(userId);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: summary
    } as ApiResponse<typeof summary>);
  } catch (error) {
    console.error('Error getting progression summary:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Get level progress for a user
 */
router.get('/level-progress/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists and requesting user has permission
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      } as ApiResponse<null>);
    }

    const levelProgress = await ProgressionTrackingService.getLevelProgress(userId);
    
    if (!levelProgress) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: levelProgress
    } as ApiResponse<typeof levelProgress>);
  } catch (error) {
    console.error('Error getting level progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Get category recommendations for a user
 */
router.get('/recommendations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists and requesting user has permission
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      } as ApiResponse<null>);
    }

    const recommendations = await ProgressionTrackingService.getCategoryRecommendations(userId);

    res.json({
      success: true,
      data: recommendations
    } as ApiResponse<typeof recommendations>);
  } catch (error) {
    console.error('Error getting category recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Get leaderboard data
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { metric = 'trustScore', limit = '10', zone } = req.query;
    
    const validMetrics = ['trustScore', 'rwisScore', 'xpPoints', 'currentLevel'];
    if (!validMetrics.includes(metric as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric. Must be one of: ' + validMetrics.join(', ')
      } as ApiResponse<null>);
    }

    const leaderboard = await GamificationService.getLeaderboard(
      metric as 'trustScore' | 'rwisScore' | 'xpPoints' | 'currentLevel',
      parseInt(limit as string),
      zone as string
    );

    res.json({
      success: true,
      data: leaderboard
    } as ApiResponse<typeof leaderboard>);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Get all available badges
 */
router.get('/badges', async (req, res) => {
  try {
    const { category, rarity } = req.query;
    
    let badges;
    if (category) {
      badges = BadgeInitializationService.getBadgesByCategory(category as any);
    } else if (rarity) {
      badges = BadgeInitializationService.getBadgesByRarity(rarity as any);
    } else {
      badges = await BadgeModel.findAll();
    }

    res.json({
      success: true,
      data: badges
    } as ApiResponse<typeof badges>);
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Get user's badges
 */
router.get('/badges/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists and requesting user has permission
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      } as ApiResponse<null>);
    }

    const achievements = await UserAchievementModel.findByUser(userId);

    res.json({
      success: true,
      data: achievements
    } as ApiResponse<typeof achievements>);
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Calculate XP for a task (utility endpoint for testing)
 */
router.post('/calculate-xp', authenticateToken, async (req, res) => {
  try {
    const { taskRewards, category, qualityScore, completionTime, userLevel } = req.body;
    
    if (!taskRewards || !category) {
      return res.status(400).json({
        success: false,
        error: 'taskRewards and category are required'
      } as ApiResponse<null>);
    }

    const xpResult = GamificationService.calculateXP(
      taskRewards,
      category,
      qualityScore || 3,
      completionTime || 1,
      userLevel || 1
    );

    res.json({
      success: true,
      data: xpResult
    } as ApiResponse<typeof xpResult>);
  } catch (error) {
    console.error('Error calculating XP:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Calculate Trust Score for a task (utility endpoint for testing)
 */
router.post('/calculate-trust-score', authenticateToken, async (req, res) => {
  try {
    const { taskRewards, category, qualityScore, onTime, clientFeedback } = req.body;
    
    if (!taskRewards || !category) {
      return res.status(400).json({
        success: false,
        error: 'taskRewards and category are required'
      } as ApiResponse<null>);
    }

    const trustScoreResult = GamificationService.calculateTrustScore(
      taskRewards,
      category,
      qualityScore || 3,
      onTime !== false, // default to true
      clientFeedback
    );

    res.json({
      success: true,
      data: trustScoreResult
    } as ApiResponse<typeof trustScoreResult>);
  } catch (error) {
    console.error('Error calculating trust score:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Calculate RWIS for a task (utility endpoint for testing)
 */
router.post('/calculate-rwis', authenticateToken, async (req, res) => {
  try {
    const { taskRewards, category, qualityScore, taskComplexity } = req.body;
    
    if (!taskRewards || !category) {
      return res.status(400).json({
        success: false,
        error: 'taskRewards and category are required'
      } as ApiResponse<null>);
    }

    const rwisResult = GamificationService.calculateRWIS(
      taskRewards,
      category,
      qualityScore || 3,
      taskComplexity || 'MEDIUM'
    );

    res.json({
      success: true,
      data: rwisResult
    } as ApiResponse<typeof rwisResult>);
  } catch (error) {
    console.error('Error calculating RWIS:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Process complete progression update (admin only)
 */
router.post('/process-progression', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      } as ApiResponse<null>);
    }

    const {
      userId,
      taskRewards,
      category,
      qualityScore,
      completionTime,
      onTime,
      clientFeedback,
      taskComplexity
    } = req.body;
    
    if (!userId || !taskRewards || !category) {
      return res.status(400).json({
        success: false,
        error: 'userId, taskRewards, and category are required'
      } as ApiResponse<null>);
    }

    const progressionUpdate = await GamificationService.processProgressionUpdate(
      userId,
      taskRewards,
      category,
      qualityScore || 3,
      completionTime || 1,
      onTime !== false,
      clientFeedback,
      taskComplexity || 'MEDIUM'
    );

    res.json({
      success: true,
      data: progressionUpdate
    } as ApiResponse<typeof progressionUpdate>);
  } catch (error) {
    console.error('Error processing progression update:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Initialize default badges (admin only)
 */
router.post('/initialize-badges', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      } as ApiResponse<null>);
    }

    await BadgeInitializationService.initializeDefaultBadges();

    res.json({
      success: true,
      message: 'Default badges initialized successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Error initializing badges:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

/**
 * Check milestone completions for a user (admin only)
 */
router.post('/check-milestones/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      } as ApiResponse<null>);
    }

    const { userId } = req.params;
    const completedMilestones = await ProgressionTrackingService.checkMilestoneCompletions(userId);

    res.json({
      success: true,
      data: completedMilestones
    } as ApiResponse<typeof completedMilestones>);
  } catch (error) {
    console.error('Error checking milestones:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

export default router;