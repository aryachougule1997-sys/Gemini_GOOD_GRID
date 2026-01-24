import express from 'express';
import { TaskManagementService } from '../services/taskManagementService';
import { authenticate } from '../middleware/auth';
import { validateTaskCreation, validateTaskApplication, validateTaskSearch } from '../middleware/validation';
import { WorkCategory, TaskStatus } from '../../../shared/types';

const router = express.Router();
const taskManagementService = new TaskManagementService();

/**
 * Create a new task
 * POST /api/tasks
 */
router.post('/', authenticate, validateTaskCreation, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      dungeonId,
      organizationId,
      requirements,
      rewards,
      deadline
    } = req.body;

    const task = await taskManagementService.createTask({
      title,
      description,
      category,
      dungeonId,
      creatorId: req.user!.id,
      organizationId,
      requirements,
      rewards,
      deadline: deadline ? new Date(deadline) : null
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task'
    });
  }
});

/**
 * Search and filter tasks
 * GET /api/tasks/search
 */
router.get('/search', validateTaskSearch, async (req, res) => {
  try {
    const {
      category,
      status,
      dungeonId,
      creatorId,
      organizationId,
      minTrustScore,
      maxTrustScore,
      skills,
      location,
      minReward,
      maxReward,
      deadlineBefore,
      deadlineAfter,
      searchText,
      sortBy,
      sortOrder,
      limit,
      offset
    } = req.query;

    const filters: any = {};

    if (category) filters.category = category as WorkCategory;
    if (status) filters.status = status as TaskStatus;
    if (dungeonId) filters.dungeonId = dungeonId as string;
    if (creatorId) filters.creatorId = creatorId as string;
    if (organizationId) filters.organizationId = organizationId as string;
    if (minTrustScore) filters.minTrustScore = parseInt(minTrustScore as string);
    if (maxTrustScore) filters.maxTrustScore = parseInt(maxTrustScore as string);
    if (skills) filters.skills = (skills as string).split(',');
    if (location) filters.location = location as string;
    if (minReward) filters.minReward = parseFloat(minReward as string);
    if (maxReward) filters.maxReward = parseFloat(maxReward as string);
    if (searchText) filters.searchText = searchText as string;
    if (sortBy) filters.sortBy = sortBy as string;
    if (sortOrder) filters.sortOrder = sortOrder as 'ASC' | 'DESC';
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);

    if (deadlineBefore || deadlineAfter) {
      filters.deadline = {};
      if (deadlineBefore) filters.deadline.before = new Date(deadlineBefore as string);
      if (deadlineAfter) filters.deadline.after = new Date(deadlineAfter as string);
    }

    const result = await taskManagementService.searchTasks(filters);

    res.json({
      success: true,
      data: result.tasks,
      pagination: {
        total: result.total,
        hasMore: result.hasMore,
        limit: filters.limit || 20,
        offset: filters.offset || 0
      }
    });
  } catch (error) {
    console.error('Task search error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search tasks'
    });
  }
});

/**
 * Get tasks by category (for dungeon display)
 * GET /api/tasks/category/:category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { dungeonId } = req.query;

    if (!['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    const tasks = await taskManagementService.getTasksByCategory(
      category as WorkCategory,
      dungeonId as string | undefined
    );

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks by category error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tasks'
    });
  }
});

/**
 * Get recommended tasks for current user
 * GET /api/tasks/recommendations
 */
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;

    const recommendations = await taskManagementService.getRecommendedTasks(
      req.user!.id,
      limitNum
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations'
    });
  }
});

/**
 * Get specific task by ID
 * GET /api/tasks/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskManagementService.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get task'
    });
  }
});

/**
 * Apply for a task
 * POST /api/tasks/:id/apply
 */
router.post('/:id/apply', authenticate, validateTaskApplication, async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationMessage } = req.body;

    const application = await taskManagementService.applyForTask(
      id,
      req.user!.id,
      applicationMessage
    );

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Task application error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply for task'
    });
  }
});

/**
 * Get applications for a task (task creator only)
 * GET /api/tasks/:id/applications
 */
router.get('/:id/applications', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const applications = await taskManagementService.getTaskApplications(
      id,
      req.user!.id
    );

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get task applications error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get applications'
    });
  }
});

/**
 * Process a task application (accept/reject)
 * PUT /api/tasks/applications/:applicationId
 */
router.put('/applications/:applicationId', authenticate, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { decision, feedback } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid decision. Must be ACCEPTED or REJECTED'
      });
    }

    await taskManagementService.processApplication(
      applicationId,
      decision,
      req.user!.id,
      feedback
    );

    res.json({
      success: true,
      message: `Application ${decision.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Process application error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process application'
    });
  }
});

/**
 * Update task status
 * PUT /api/tasks/:id/status
 */
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    await taskManagementService.updateTaskStatus(id, status, req.user!.id);

    res.json({
      success: true,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task status'
    });
  }
});

/**
 * Get user's task applications
 * GET /api/tasks/my-applications
 */
router.get('/my-applications', authenticate, async (req, res) => {
  try {
    const applications = await taskManagementService.getUserApplications(req.user!.id);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get applications'
    });
  }
});

/**
 * Get tasks created by current user
 * GET /api/tasks/my-tasks
 */
router.get('/my-tasks', authenticate, async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    const filters: any = {
      creatorId: req.user!.id
    };

    if (status) filters.status = status as TaskStatus;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);

    const result = await taskManagementService.searchTasks(filters);

    res.json({
      success: true,
      data: result.tasks,
      pagination: {
        total: result.total,
        hasMore: result.hasMore,
        limit: filters.limit || 20,
        offset: filters.offset || 0
      }
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tasks'
    });
  }
});

export default router;