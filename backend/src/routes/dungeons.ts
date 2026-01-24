import express from 'express';
import { DungeonService } from '../services/dungeonService';
import { authenticate } from '../middleware/auth';
import { WorkCategory, Point, Requirements } from '../../../shared/types';

const router = express.Router();

/**
 * GET /api/dungeons
 * Get all dungeons with their tasks
 */
router.get('/', async (req, res) => {
  try {
    const dungeons = await DungeonService.getAllDungeonsWithTasks();
    res.json({
      success: true,
      data: dungeons
    });
  } catch (error) {
    console.error('Error fetching dungeons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dungeons'
    });
  }
});

/**
 * GET /api/dungeons/category/:category
 * Get dungeons by work category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category.toUpperCase() as WorkCategory;
    
    if (!['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid work category'
      });
    }

    const dungeons = await DungeonService.getDungeonsByCategory(category);
    res.json({
      success: true,
      data: dungeons
    });
  } catch (error) {
    console.error('Error fetching dungeons by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dungeons by category'
    });
  }
});

/**
 * GET /api/dungeons/:id
 * Get dungeon by ID with tasks
 */
router.get('/:id', async (req, res) => {
  try {
    const dungeonId = req.params.id;
    const dungeon = await DungeonService.getDungeonById(dungeonId);
    
    if (!dungeon) {
      return res.status(404).json({
        success: false,
        error: 'Dungeon not found'
      });
    }

    res.json({
      success: true,
      data: dungeon
    });
  } catch (error) {
    console.error('Error fetching dungeon:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dungeon'
    });
  }
});

/**
 * GET /api/dungeons/zone/:zoneId
 * Get dungeons in a specific zone
 */
router.get('/zone/:zoneId', async (req, res) => {
  try {
    const zoneId = req.params.zoneId;
    const dungeons = await DungeonService.getDungeonsByZone(zoneId);
    
    res.json({
      success: true,
      data: dungeons
    });
  } catch (error) {
    console.error('Error fetching dungeons by zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dungeons by zone'
    });
  }
});

/**
 * POST /api/dungeons/:id/access-check
 * Check if user can access a dungeon
 */
router.post('/:id/access-check', authenticate, async (req, res) => {
  try {
    const dungeonId = req.params.id;
    const { trustScore, level, badges } = req.body;
    
    const canAccess = await DungeonService.canUserAccessDungeon(
      dungeonId,
      trustScore || 0,
      level || 1,
      badges || []
    );

    res.json({
      success: true,
      data: { canAccess }
    });
  } catch (error) {
    console.error('Error checking dungeon access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check dungeon access'
    });
  }
});

/**
 * POST /api/dungeons
 * Create a new dungeon (admin only for now)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      type,
      zoneId,
      coordinates,
      spriteAsset,
      entryRequirements,
      specialFeatures
    } = req.body;

    // Validate required fields
    if (!name || !type || !zoneId || !coordinates) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, zoneId, coordinates'
      });
    }

    // Validate work category
    if (!['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid work category'
      });
    }

    const dungeon = await DungeonService.createDungeon({
      name,
      type: type as WorkCategory,
      zoneId,
      coordinates: coordinates as Point,
      spriteAsset,
      entryRequirements: entryRequirements || DungeonService.getDefaultEntryRequirements(type),
      specialFeatures: specialFeatures || DungeonService.getCategoryFeatures(type)
    });

    res.status(201).json({
      success: true,
      data: dungeon
    });
  } catch (error) {
    console.error('Error creating dungeon:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dungeon'
    });
  }
});

/**
 * GET /api/dungeons/zone/:zoneId/placement-suggestions
 * Get suggested placement points for new dungeons in a zone
 */
router.get('/zone/:zoneId/placement-suggestions', async (req, res) => {
  try {
    const zoneId = req.params.zoneId;
    const count = parseInt(req.query.count as string) || 3;
    
    const suggestions = await DungeonService.suggestDungeonPlacements(zoneId, count);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting placement suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get placement suggestions'
    });
  }
});

/**
 * GET /api/dungeons/category/:category/features
 * Get category-specific features
 */
router.get('/category/:category/features', (req, res) => {
  try {
    const category = req.params.category.toUpperCase() as WorkCategory;
    
    if (!['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid work category'
      });
    }

    const features = DungeonService.getCategoryFeatures(category);
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Error getting category features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get category features'
    });
  }
});

export default router;