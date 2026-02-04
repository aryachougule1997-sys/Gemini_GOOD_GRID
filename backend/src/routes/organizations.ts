import express from 'express';
import { OrganizationModel } from '../models/Organization';
import { TaskModel } from '../models/Task';
import { WorkHistoryModel } from '../models/WorkHistory';
import { authenticateToken } from '../middleware/auth';
import { validateOrganizationData } from '../middleware/validation';

const router = express.Router();

/**
 * Register a new organization
 * POST /api/organizations/register
 */
router.post('/register', validateOrganizationData, async (req, res) => {
  try {
    const { name, description, contactEmail, website } = req.body;

    // Check if organization with this email already exists
    const existingOrg = await OrganizationModel.findByEmail(contactEmail);
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        error: 'Organization with this email already exists'
      });
    }

    // Create new organization (unverified by default)
    const organization = await OrganizationModel.create({
      name,
      description,
      contactEmail,
      website,
      verified: false
    });

    res.status(201).json({
      success: true,
      data: organization,
      message: 'Organization registered successfully. Verification pending.'
    });
  } catch (error) {
    console.error('Error registering organization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register organization'
    });
  }
});

/**
 * Get organization profile
 * GET /api/organizations/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const organization = await OrganizationModel.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Get organization statistics
    const stats = await OrganizationModel.getStats(id);

    res.json({
      success: true,
      data: {
        ...organization,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization'
    });
  }
});

/**
 * Update organization profile
 * PUT /api/organizations/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, contactEmail, website } = req.body;

    // TODO: Add authorization check - only organization admins should be able to update
    
    const updatedOrg = await OrganizationModel.update(id, {
      name,
      description,
      contactEmail,
      website
    });

    if (!updatedOrg) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: updatedOrg,
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update organization'
    });
  }
});

/**
 * Get all organizations (with optional filtering)
 * GET /api/organizations
 */
router.get('/', async (req, res) => {
  try {
    const { verified, search } = req.query;
    
    let organizations;
    if (search) {
      organizations = await OrganizationModel.searchByName(
        search as string,
        verified === 'true' ? true : verified === 'false' ? false : undefined
      );
    } else {
      organizations = await OrganizationModel.findAll(
        verified === 'true' ? true : verified === 'false' ? false : undefined
      );
    }

    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organizations'
    });
  }
});

/**
 * Verify organization (admin only)
 * POST /api/organizations/:id/verify
 */
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    // TODO: Add admin authorization check
    
    await OrganizationModel.updateVerificationStatus(id, verified);

    res.json({
      success: true,
      message: `Organization ${verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update verification status'
    });
  }
});

/**
 * Get organization's tasks
 * GET /api/organizations/:id/tasks
 */
router.get('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category, page = 1, limit = 20 } = req.query;

    const organization = await OrganizationModel.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const tasks = await TaskModel.findByOrganization(id, {
      status: status as any,
      category: category as any,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching organization tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization tasks'
    });
  }
});

/**
 * Get organization's volunteers/freelancers
 * GET /api/organizations/:id/volunteers
 */
router.get('/:id/volunteers', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, page = 1, limit = 20 } = req.query;

    const organization = await OrganizationModel.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const volunteers = await WorkHistoryModel.getVolunteersByOrganization(id, {
      category: category as any,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: volunteers
    });
  } catch (error) {
    console.error('Error fetching organization volunteers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization volunteers'
    });
  }
});

/**
 * Get organization analytics
 * GET /api/organizations/:id/analytics
 */
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe = '30d' } = req.query;

    const organization = await OrganizationModel.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Get comprehensive analytics
    const analytics = await getOrganizationAnalytics(id, timeframe as string);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching organization analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization analytics'
    });
  }
});

/**
 * Get organization impact report
 * GET /api/organizations/:id/impact-report
 */
router.get('/:id/impact-report', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const organization = await OrganizationModel.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const impactReport = await generateImpactReport(id, {
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({
      success: true,
      data: impactReport
    });
  } catch (error) {
    console.error('Error generating impact report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate impact report'
    });
  }
});

/**
 * Rate organization (from volunteer/freelancer perspective)
 * POST /api/organizations/:id/rate
 */
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback, taskId } = req.body;
    const userId = (req as any).user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // TODO: Verify user has worked with this organization
    
    const ratingResult = await createOrganizationRating({
      organizationId: id,
      userId,
      rating,
      feedback,
      taskId
    });

    res.json({
      success: true,
      data: ratingResult,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting organization rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit rating'
    });
  }
});

// Helper functions
async function getOrganizationAnalytics(organizationId: string, timeframe: string) {
  // Implementation for comprehensive analytics
  // This would include task completion rates, volunteer engagement, impact metrics, etc.
  return {
    taskMetrics: {
      totalTasks: 0,
      completedTasks: 0,
      averageCompletionTime: 0,
      completionRate: 0
    },
    volunteerMetrics: {
      totalVolunteers: 0,
      activeVolunteers: 0,
      retentionRate: 0,
      averageRating: 0
    },
    impactMetrics: {
      totalRWIS: 0,
      peopleHelped: 0,
      hoursContributed: 0,
      projectsCompleted: 0
    },
    categoryBreakdown: {
      freelance: { tasks: 0, volunteers: 0, impact: 0 },
      community: { tasks: 0, volunteers: 0, impact: 0 },
      corporate: { tasks: 0, volunteers: 0, impact: 0 }
    }
  };
}

async function generateImpactReport(organizationId: string, options: { startDate?: string; endDate?: string }) {
  // Implementation for impact report generation
  return {
    summary: {
      totalImpact: 0,
      tasksCompleted: 0,
      volunteersEngaged: 0,
      hoursContributed: 0
    },
    categoryImpact: {},
    topVolunteers: [],
    achievements: [],
    testimonials: []
  };
}

async function createOrganizationRating(data: {
  organizationId: string;
  userId: string;
  rating: number;
  feedback?: string;
  taskId?: string;
}) {
  // Implementation for creating organization ratings
  return {
    id: 'rating-id',
    ...data,
    createdAt: new Date()
  };
}

export default router;