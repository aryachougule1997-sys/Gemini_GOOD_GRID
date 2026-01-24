import express from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import dungeonRoutes from './dungeons';
import careerRoutes from './career';
import usersRoutes from './users';
import tasksRoutes from './tasks';
import gamificationRoutes from './gamification';
import zoneProgressionRoutes from './zoneProgression';
import { initializeTaskSubmissionRoutes } from './taskSubmissions';
import { Pool } from 'pg';

const router = express.Router();

// Initialize task submission routes with database connection
export const initializeRoutes = (db: Pool) => {
  // Mount route modules
  router.use('/auth', authRoutes);
  router.use('/profile', profileRoutes);
  router.use('/dungeons', dungeonRoutes);
  router.use('/career', careerRoutes);
  router.use('/users', usersRoutes);
  router.use('/tasks', tasksRoutes);
  router.use('/gamification', gamificationRoutes);
  router.use('/zone-progression', zoneProgressionRoutes);
  router.use('/task-submissions', initializeTaskSubmissionRoutes(db));

  return router;
};

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Good Grid API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify'
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PUT /api/profile',
        getPublic: 'GET /api/profile/:userId',
        delete: 'DELETE /api/profile'
      },
      dungeons: {
        getAll: 'GET /api/dungeons',
        getById: 'GET /api/dungeons/:id',
        getByCategory: 'GET /api/dungeons/category/:category',
        getByZone: 'GET /api/dungeons/zone/:zoneId',
        create: 'POST /api/dungeons',
        checkAccess: 'POST /api/dungeons/:id/access-check'
      },
      tasks: {
        create: 'POST /api/tasks',
        search: 'GET /api/tasks/search',
        getByCategory: 'GET /api/tasks/category/:category',
        getRecommendations: 'GET /api/tasks/recommendations',
        getById: 'GET /api/tasks/:id',
        apply: 'POST /api/tasks/:id/apply',
        getApplications: 'GET /api/tasks/:id/applications',
        processApplication: 'PUT /api/tasks/applications/:applicationId',
        updateStatus: 'PUT /api/tasks/:id/status',
        getMyApplications: 'GET /api/tasks/my-applications',
        getMyTasks: 'GET /api/tasks/my-tasks'
      },
      taskSubmissions: {
        submit: 'POST /api/task-submissions',
        resubmit: 'PUT /api/task-submissions/:id/resubmit',
        getMySubmissions: 'GET /api/task-submissions/my-submissions',
        getSubmission: 'GET /api/task-submissions/:id',
        getReviewQueue: 'GET /api/task-submissions/review-queue',
        assignReviewer: 'POST /api/task-submissions/review-queue/:id/assign',
        approveSubmission: 'POST /api/task-submissions/review-queue/:id/approve',
        rejectSubmission: 'POST /api/task-submissions/review-queue/:id/reject',
        requestRevisions: 'POST /api/task-submissions/review-queue/:id/revisions',
        getFeedback: 'GET /api/task-submissions/:id/feedback',
        getReviewerStats: 'GET /api/task-submissions/reviewer/stats'
      },
      gamification: {
        getProgression: 'GET /api/gamification/progression/:userId',
        getSummary: 'GET /api/gamification/summary/:userId',
        getLevelProgress: 'GET /api/gamification/level-progress/:userId',
        getRecommendations: 'GET /api/gamification/recommendations/:userId',
        getLeaderboard: 'GET /api/gamification/leaderboard',
        getBadges: 'GET /api/gamification/badges',
        getUserBadges: 'GET /api/gamification/badges/:userId',
        calculateXP: 'POST /api/gamification/calculate-xp',
        calculateTrustScore: 'POST /api/gamification/calculate-trust-score',
        calculateRWIS: 'POST /api/gamification/calculate-rwis',
        processProgression: 'POST /api/gamification/process-progression',
        initializeBadges: 'POST /api/gamification/initialize-badges',
        checkMilestones: 'POST /api/gamification/check-milestones/:userId'
      },
      zoneProgression: {
        checkUnlocks: 'POST /api/zone-progression/check-unlocks',
        getStatus: 'GET /api/zone-progression/status',
        getAdvancedDungeons: 'GET /api/zone-progression/advanced-dungeons',
        getZoneContent: 'GET /api/zone-progression/zone-content/:zoneId',
        triggerUnlock: 'POST /api/zone-progression/trigger-unlock/:zoneId',
        getRequirements: 'GET /api/zone-progression/requirements/:zoneId',
        getUnlockHistory: 'GET /api/zone-progression/unlock-history'
      },
      career: {
        dashboard: 'GET /api/career/dashboard',
        generateResume: 'POST /api/career/resume/generate',
        exportResume: 'POST /api/career/resume/export',
        getTemplates: 'GET /api/career/resume/templates',
        getJobRecommendations: 'POST /api/career/jobs/recommendations',
        getCareerPaths: 'POST /api/career/career-paths',
        generateSummary: 'POST /api/career/summary/generate',
        analyzeSkillGaps: 'POST /api/career/skills/gap-analysis'
      }
    }
  });
});

// For backward compatibility, create a default router without database features
const defaultRouter = express.Router();
defaultRouter.use('/auth', authRoutes);
defaultRouter.use('/profile', profileRoutes);
defaultRouter.use('/dungeons', dungeonRoutes);
defaultRouter.use('/career', careerRoutes);
defaultRouter.use('/users', usersRoutes);
defaultRouter.use('/tasks', tasksRoutes);
defaultRouter.use('/gamification', gamificationRoutes);
defaultRouter.use('/zone-progression', zoneProgressionRoutes);

// API info endpoint for default router too
defaultRouter.get('/', (req, res) => {
  res.json({
    message: 'Good Grid API',
    version: '1.0.0',
    note: 'Some features may be limited without database initialization',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify'
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PUT /api/profile',
        getPublic: 'GET /api/profile/:userId',
        delete: 'DELETE /api/profile'
      },
      dungeons: {
        getAll: 'GET /api/dungeons',
        getById: 'GET /api/dungeons/:id',
        getByCategory: 'GET /api/dungeons/category/:category',
        getByZone: 'GET /api/dungeons/zone/:zoneId',
        create: 'POST /api/dungeons',
        checkAccess: 'POST /api/dungeons/:id/access-check'
      },
      tasks: {
        create: 'POST /api/tasks',
        search: 'GET /api/tasks/search',
        getByCategory: 'GET /api/tasks/category/:category',
        getRecommendations: 'GET /api/tasks/recommendations',
        getById: 'GET /api/tasks/:id',
        apply: 'POST /api/tasks/:id/apply',
        getApplications: 'GET /api/tasks/:id/applications',
        processApplication: 'PUT /api/tasks/applications/:applicationId',
        updateStatus: 'PUT /api/tasks/:id/status',
        getMyApplications: 'GET /api/tasks/my-applications',
        getMyTasks: 'GET /api/tasks/my-tasks'
      },
      career: {
        dashboard: 'GET /api/career/dashboard',
        generateResume: 'POST /api/career/resume/generate',
        exportResume: 'POST /api/career/resume/export',
        getTemplates: 'GET /api/career/resume/templates',
        getJobRecommendations: 'POST /api/career/jobs/recommendations',
        getCareerPaths: 'POST /api/career/career-paths',
        generateSummary: 'POST /api/career/summary/generate',
        analyzeSkillGaps: 'POST /api/career/skills/gap-analysis'
      }
    }
  });
});

export default defaultRouter;