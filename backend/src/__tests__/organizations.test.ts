import request from 'supertest';
import { OrganizationModel } from '../models/Organization';
import { TaskModel } from '../models/Task';
import { WorkHistoryModel } from '../models/WorkHistory';

// Mock the models
jest.mock('../models/Organization');
jest.mock('../models/Task');
jest.mock('../models/WorkHistory');
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

const mockOrganizationModel = OrganizationModel as jest.Mocked<typeof OrganizationModel>;
const mockTaskModel = TaskModel as jest.Mocked<typeof TaskModel>;
const mockWorkHistoryModel = WorkHistoryModel as jest.Mocked<typeof WorkHistoryModel>;

// Mock Express app
const express = require('express');
const organizationsRouter = require('../routes/organizations').default;

const app = express();
app.use(express.json());
app.use('/api/organizations', organizationsRouter);

describe('Organizations API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/organizations/register', () => {
    it('should register a new organization successfully', async () => {
      const orgData = {
        name: 'Test Organization',
        description: 'A test organization',
        contactEmail: 'test@example.com',
        website: 'https://test.com'
      };

      const createdOrg = {
        id: 'org-123',
        ...orgData,
        verified: false,
        createdAt: new Date()
      };

      mockOrganizationModel.findByEmail.mockResolvedValue(null);
      mockOrganizationModel.create.mockResolvedValue(createdOrg);

      const response = await request(app)
        .post('/api/organizations/register')
        .send(orgData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(createdOrg);
      expect(response.body.message).toContain('registered successfully');
    });

    it('should reject registration if organization email already exists', async () => {
      const orgData = {
        name: 'Test Organization',
        contactEmail: 'existing@example.com'
      };

      const existingOrg = {
        id: 'existing-org',
        name: 'Existing Org',
        contactEmail: 'existing@example.com',
        verified: true,
        createdAt: new Date()
      };

      mockOrganizationModel.findByEmail.mockResolvedValue(existingOrg);

      const response = await request(app)
        .post('/api/organizations/register')
        .send(orgData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    it('should handle validation errors', async () => {
      const invalidOrgData = {
        name: '', // Empty name should fail validation
        contactEmail: 'invalid-email' // Invalid email format
      };

      const response = await request(app)
        .post('/api/organizations/register')
        .send(invalidOrgData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should get organization with stats', async () => {
      const orgId = 'org-123';
      const organization = {
        id: orgId,
        name: 'Test Organization',
        description: 'A test organization',
        verified: true,
        contactEmail: 'test@example.com',
        createdAt: new Date()
      };

      const stats = {
        totalTasks: 10,
        completedTasks: 7,
        activeVolunteers: 5,
        averageRating: 4.5
      };

      mockOrganizationModel.findById.mockResolvedValue(organization);
      mockOrganizationModel.getStats.mockResolvedValue(stats);

      const response = await request(app)
        .get(`/api/organizations/${orgId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        ...organization,
        stats
      });
    });

    it('should return 404 for non-existent organization', async () => {
      const orgId = 'non-existent';

      mockOrganizationModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/organizations/${orgId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/organizations/:id', () => {
    it('should update organization successfully', async () => {
      const orgId = 'org-123';
      const updateData = {
        name: 'Updated Organization',
        description: 'Updated description'
      };

      const updatedOrg = {
        id: orgId,
        ...updateData,
        verified: true,
        contactEmail: 'test@example.com',
        createdAt: new Date()
      };

      mockOrganizationModel.update.mockResolvedValue(updatedOrg);

      const response = await request(app)
        .put(`/api/organizations/${orgId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedOrg);
    });

    it('should return 404 for non-existent organization', async () => {
      const orgId = 'non-existent';
      const updateData = { name: 'Updated Name' };

      mockOrganizationModel.update.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/organizations/${orgId}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/organizations', () => {
    it('should get all organizations', async () => {
      const organizations = [
        {
          id: 'org-1',
          name: 'Organization 1',
          verified: true,
          contactEmail: 'org1@example.com',
          createdAt: new Date()
        },
        {
          id: 'org-2',
          name: 'Organization 2',
          verified: false,
          contactEmail: 'org2@example.com',
          createdAt: new Date()
        }
      ];

      mockOrganizationModel.findAll.mockResolvedValue(organizations);

      const response = await request(app)
        .get('/api/organizations');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(organizations);
    });

    it('should filter organizations by verified status', async () => {
      const verifiedOrgs = [
        {
          id: 'org-1',
          name: 'Verified Organization',
          verified: true,
          contactEmail: 'verified@example.com',
          createdAt: new Date()
        }
      ];

      mockOrganizationModel.findAll.mockResolvedValue(verifiedOrgs);

      const response = await request(app)
        .get('/api/organizations?verified=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(verifiedOrgs);
      expect(mockOrganizationModel.findAll).toHaveBeenCalledWith(true);
    });

    it('should search organizations by name', async () => {
      const searchResults = [
        {
          id: 'org-1',
          name: 'Test Organization',
          verified: true,
          contactEmail: 'test@example.com',
          createdAt: new Date()
        }
      ];

      mockOrganizationModel.searchByName.mockResolvedValue(searchResults);

      const response = await request(app)
        .get('/api/organizations?search=Test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(searchResults);
      expect(mockOrganizationModel.searchByName).toHaveBeenCalledWith('Test', undefined);
    });
  });

  describe('GET /api/organizations/:id/tasks', () => {
    it('should get organization tasks', async () => {
      const orgId = 'org-123';
      const organization = {
        id: orgId,
        name: 'Test Organization',
        verified: true,
        contactEmail: 'test@example.com',
        createdAt: new Date()
      };

      const tasksResult = {
        tasks: [
          {
            id: 'task-1',
            title: 'Test Task',
            description: 'A test task',
            category: 'COMMUNITY' as const,
            dungeonId: null,
            creatorId: 'creator-1',
            organizationId: orgId,
            requirements: {
              skills: ['testing'],
              trustScoreMin: 0,
              timeCommitment: 2
            },
            rewards: {
              xp: 50,
              trustScoreBonus: 5,
              rwisPoints: 10
            },
            status: 'OPEN' as const,
            deadline: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 1,
        page: 1,
        limit: 20
      };

      mockOrganizationModel.findById.mockResolvedValue(organization);
      mockTaskModel.findByOrganization.mockResolvedValue(tasksResult);

      const response = await request(app)
        .get(`/api/organizations/${orgId}/tasks`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(tasksResult);
    });

    it('should return 404 for non-existent organization', async () => {
      const orgId = 'non-existent';

      mockOrganizationModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/organizations/${orgId}/tasks`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/organizations/:id/volunteers', () => {
    it('should get organization volunteers', async () => {
      const orgId = 'org-123';
      const organization = {
        id: orgId,
        name: 'Test Organization',
        verified: true,
        contactEmail: 'test@example.com',
        createdAt: new Date()
      };

      const volunteersResult = {
        volunteers: [
          {
            userId: 'user-1',
            username: 'testuser',
            email: 'user@example.com',
            tasksCompleted: 5,
            averageRating: 4.5,
            totalXP: 250,
            totalRWIS: 100,
            categories: ['COMMUNITY' as const],
            lastActivity: new Date()
          }
        ],
        total: 1,
        page: 1,
        limit: 20
      };

      mockOrganizationModel.findById.mockResolvedValue(organization);
      mockWorkHistoryModel.getVolunteersByOrganization.mockResolvedValue(volunteersResult);

      const response = await request(app)
        .get(`/api/organizations/${orgId}/volunteers`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(volunteersResult);
    });
  });

  describe('POST /api/organizations/:id/verify', () => {
    it('should verify organization successfully', async () => {
      const orgId = 'org-123';

      mockOrganizationModel.updateVerificationStatus.mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/organizations/${orgId}/verify`)
        .send({ verified: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verified successfully');
      expect(mockOrganizationModel.updateVerificationStatus).toHaveBeenCalledWith(orgId, true);
    });

    it('should unverify organization successfully', async () => {
      const orgId = 'org-123';

      mockOrganizationModel.updateVerificationStatus.mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/organizations/${orgId}/verify`)
        .send({ verified: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('unverified successfully');
      expect(mockOrganizationModel.updateVerificationStatus).toHaveBeenCalledWith(orgId, false);
    });
  });

  describe('POST /api/organizations/:id/rate', () => {
    it('should submit organization rating successfully', async () => {
      const orgId = 'org-123';
      const ratingData = {
        rating: 5,
        feedback: 'Great organization to work with!',
        taskId: 'task-123'
      };

      const response = await request(app)
        .post(`/api/organizations/${orgId}/rate`)
        .send(ratingData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('submitted successfully');
    });

    it('should reject invalid rating', async () => {
      const orgId = 'org-123';
      const invalidRating = {
        rating: 6, // Invalid rating (should be 1-5)
        feedback: 'Test feedback'
      };

      const response = await request(app)
        .post(`/api/organizations/${orgId}/rate`)
        .send(invalidRating);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('between 1 and 5');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockOrganizationModel.findAll.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/organizations');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to fetch organizations');
    });

    it('should handle model creation errors', async () => {
      const orgData = {
        name: 'Test Organization',
        contactEmail: 'test@example.com'
      };

      mockOrganizationModel.findByEmail.mockResolvedValue(null);
      mockOrganizationModel.create.mockRejectedValue(new Error('Database constraint violation'));

      const response = await request(app)
        .post('/api/organizations/register')
        .send(orgData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to register organization');
    });
  });
});