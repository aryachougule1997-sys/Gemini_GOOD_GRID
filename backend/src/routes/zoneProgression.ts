import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { ZoneProgressionService } from '../services/zoneProgressionService';
import { UserModel } from '../models/User';

const router = express.Router();

/**
 * Check for zone unlocks for the authenticated user
 */
router.post('/check-unlocks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const unlockResults = await ZoneProgressionService.checkZoneUnlocks(userId);
    
    res.json({
      success: true,
      data: {
        newUnlocks: unlockResults,
        totalUnlocked: unlockResults.length
      }
    });
  } catch (error) {
    console.error('Error checking zone unlocks:', error);
    res.status(500).json({ 
      error: 'Failed to check zone unlocks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get comprehensive zone progression status for user
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const progressionStatus = await ZoneProgressionService.getZoneProgressionStatus(userId);
    
    res.json({
      success: true,
      data: progressionStatus
    });
  } catch (error) {
    console.error('Error getting zone progression status:', error);
    res.status(500).json({ 
      error: 'Failed to get zone progression status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get advanced dungeon unlocks for user
 */
router.get('/advanced-dungeons', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const advancedDungeons = await ZoneProgressionService.getAdvancedDungeonUnlocks(userId);
    
    res.json({
      success: true,
      data: advancedDungeons
    });
  } catch (error) {
    console.error('Error getting advanced dungeon unlocks:', error);
    res.status(500).json({ 
      error: 'Failed to get advanced dungeon unlocks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get zone-specific content and difficulty scaling
 */
router.get('/zone-content/:zoneId', authenticateToken, async (req, res) => {
  try {
    const { zoneId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has access to this zone
    const userStats = await UserModel.getStats(userId);
    if (!userStats || !userStats.unlockedZones.includes(zoneId)) {
      return res.status(403).json({ error: 'Zone not unlocked for user' });
    }

    const zoneContent = await ZoneProgressionService.getZoneSpecificContent(zoneId);
    
    res.json({
      success: true,
      data: zoneContent
    });
  } catch (error) {
    console.error('Error getting zone content:', error);
    res.status(500).json({ 
      error: 'Failed to get zone content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Trigger zone unlock celebration (for testing/admin purposes)
 */
router.post('/trigger-unlock/:zoneId', authenticateToken, async (req, res) => {
  try {
    const { zoneId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // This would typically be called automatically by the progression system
    // but can be triggered manually for testing
    const userStats = await UserModel.getStats(userId);
    if (!userStats) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    // Add zone to unlocked zones if not already unlocked
    if (!userStats.unlockedZones.includes(zoneId)) {
      const updatedZones = [...userStats.unlockedZones, zoneId];
      await UserModel.updateStats(userId, { unlockedZones: updatedZones });
    }

    // Get celebration data
    const unlockResults = await ZoneProgressionService.checkZoneUnlocks(userId);
    const relevantUnlock = unlockResults.find(unlock => unlock.zoneId === zoneId);

    res.json({
      success: true,
      data: {
        unlocked: true,
        celebrationData: relevantUnlock?.celebrationData || null
      }
    });
  } catch (error) {
    console.error('Error triggering zone unlock:', error);
    res.status(500).json({ 
      error: 'Failed to trigger zone unlock',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get zone unlock requirements for a specific zone
 */
router.get('/requirements/:zoneId', authenticateToken, async (req, res) => {
  try {
    const { zoneId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userStats = await UserModel.getStats(userId);
    if (!userStats) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    // Get zone progression status to find requirements
    const progressionStatus = await ZoneProgressionService.getZoneProgressionStatus(userId);
    const targetZone = progressionStatus.lockedZones.find(zone => zone.id === zoneId) ||
                      progressionStatus.nextUnlockableZone;

    if (!targetZone) {
      return res.status(404).json({ error: 'Zone not found or already unlocked' });
    }

    res.json({
      success: true,
      data: {
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        requirements: targetZone.unlockRequirements,
        currentProgress: progressionStatus.progressToNextZone,
        userStats: {
          trustScore: userStats.trustScore,
          level: userStats.currentLevel,
          totalTasks: Object.values(userStats.categoryStats).reduce(
            (sum, cat) => sum + cat.tasksCompleted, 0
          )
        }
      }
    });
  } catch (error) {
    console.error('Error getting zone requirements:', error);
    res.status(500).json({ 
      error: 'Failed to get zone requirements',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get zone unlock history for user
 */
router.get('/unlock-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userStats = await UserModel.getStats(userId);
    if (!userStats) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    // Get progression status to get zone details
    const progressionStatus = await ZoneProgressionService.getZoneProgressionStatus(userId);
    
    // Create unlock history (in a real implementation, you'd store unlock timestamps)
    const unlockHistory = progressionStatus.unlockedZones.map((zone, index) => ({
      zoneId: zone.id,
      zoneName: zone.name,
      unlockedAt: new Date(Date.now() - (progressionStatus.unlockedZones.length - index) * 24 * 60 * 60 * 1000), // Mock timestamps
      difficulty: zone.difficulty,
      terrainType: zone.terrainType
    }));

    res.json({
      success: true,
      data: {
        totalUnlocked: unlockHistory.length,
        unlockHistory: unlockHistory.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      }
    });
  } catch (error) {
    console.error('Error getting unlock history:', error);
    res.status(500).json({ 
      error: 'Failed to get unlock history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;