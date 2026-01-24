import { TaskManagementService } from '../services/taskManagementService';
import { TaskModel, TaskApplicationModel } from '../models/Task';
import { UserModel } from '../models/User';
import { OrganizationModel } from '../models/Organization';
import { WorkCategory, TaskRequirements, TaskRewards, CharacterData, LocationData } from '../../../shared/types';

// Mock the dependencies
jest.mock('../models/Task');
jest.mock('../models/User');
jest.mock('../models/Organization');
jest.mock('../services/geminiTaskCategorizationService');
jest.mock('../services/geminiTaskMatchingService');
jest.mock('../services/notificationService');

const mockTaskModel = TaskModel as jest.Mocked<typeof TaskModel>;
const mockTaskApplicationModel = TaskApplicationModel as jest.Mocked<typeof TaskApplicationModel>;
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockOrganizationModel = OrganizationModel as jest.Mocked<typeof OrganizationModel>;

describe('TaskManagementService', () => {
  let taskManagementService: TaskManagementService;

  const mockCharacterData: CharacterData = {
    baseSprite: 'DEFAULT',
    colorPalette: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b'
    },
    accessories: [],
    unlockedItems: []
  };

  const mockLocationData: LocationData = {
    coordinates: { x: 0, y: 0 },
    currentZone: 'zone-1',
    discoveredDungeons: []
  };

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    characterData: mockCharacterData,
    locationData: mockLocationData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    taskManagementService = new TaskManagementService();
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const mockTaskData = {
      title: 'Test Task',
      description: 'This is a test task description that is long enough to pass validation',
      category: 'COMMUNITY' as WorkCategory,
      creatorId: 'user-123',
      requirements: {
        skills: ['JavaScript', 'React'],
        trustScoreMin: 10,
        timeCommitment: 5,
        location: 'Remote'
      } as TaskRequirements,
      rewards: {
        xp: 50,
        trustScoreBonus: 5,
        rwisPoints: 25
      } as TaskRewards
    };

    const mockCreatedTask = {
      id: 'task-123',
      ...mockTaskData,
      dungeonId: null,
      organizationId: null,
      status: 'OPEN' as const,
      deadline: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create a task successfully', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockTaskModel.create.mockResolvedValue(mockCreatedTask);

      const result = await taskManagementService.createTask(mockTaskData);

      expect(mockUserModel.findById).toHaveBeenCalledWith('user-123');
      expect(mockTaskModel.create).toHaveBeenCalledWith(mockTaskData);
      expect(result).toEqual(mockCreatedTask);
    });

    it('should throw error if creator not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(taskManagementService.createTask(mockTaskData))
        .rejects.toThrow('Creator not found');
    });

    it('should validate freelance tasks have payment', async () => {
      const freelanceTaskData = {
        ...mockTaskData,
        category: 'FREELANCE' as WorkCategory,
        rewards: {
          ...mockTaskData.rewards,
          payment: undefined // Missing payment for freelance task
        }
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      await expect(taskManagementService.createTask(freelanceTaskData))
        .rejects.toThrow('Freelance tasks must have a payment amount');
    });
  });

  describe('applyForTask', () => {
    const mockTask = {
      id: 'task-123',
      title: 'Test Task',
      description: 'Test description',
      category: 'COMMUNITY' as WorkCategory,
      creatorId: 'creator-123',
      status: 'OPEN' as const,
      requirements: {
        skills: ['JavaScript'],
        trustScoreMin: 10,
        timeCommitment: 5
      } as TaskRequirements,
      rewards: {
        xp: 50,
        trustScoreBonus: 5,
        rwisPoints: 25
      } as TaskRewards,
      dungeonId: null,
      organizationId: null,
      deadline: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockUserStats = {
      userId: 'user-123',
      trustScore: 15,
      rwisScore: 0,
      xpPoints: 0,
      currentLevel: 1,
      unlockedZones: [],
      categoryStats: {
        freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
        community: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
        corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] }
      }
    };

    const mockApplication = {
      id: 'app-123',
      taskId: 'task-123',
      userId: 'user-123',
      applicationMessage: 'I would like to apply',
      status: 'PENDING' as const,
      appliedAt: new Date()
    };

    it('should create application successfully', async () => {
      mockTaskModel.findById.mockResolvedValue(mockTask);
      mockTaskApplicationModel.hasUserApplied.mockResolvedValue(false);
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.getUserStats.mockResolvedValue(mockUserStats);
      mockUserModel.getUserBadges.mockResolvedValue([]);
      mockTaskApplicationModel.create.mockResolvedValue(mockApplication);

      const result = await taskManagementService.applyForTask(
        'task-123',
        'user-123',
        'I would like to apply'
      );

      expect(mockTaskModel.findById).toHaveBeenCalledWith('task-123');
      expect(mockTaskApplicationModel.hasUserApplied).toHaveBeenCalledWith('task-123', 'user-123');
      expect(mockTaskApplicationModel.create).toHaveBeenCalledWith({
        taskId: 'task-123',
        userId: 'user-123',
        applicationMessage: 'I would like to apply'
      });
      expect(result).toEqual(mockApplication);
    });

    it('should throw error if task not found', async () => {
      mockTaskModel.findById.mockResolvedValue(null);

      await expect(taskManagementService.applyForTask('task-123', 'user-123'))
        .rejects.toThrow('Task not found');
    });

    it('should throw error if user already applied', async () => {
      mockTaskModel.findById.mockResolvedValue(mockTask);
      mockTaskApplicationModel.hasUserApplied.mockResolvedValue(true);

      await expect(taskManagementService.applyForTask('task-123', 'user-123'))
        .rejects.toThrow('You have already applied for this task');
    });
  });

  describe('searchTasks', () => {
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        category: 'COMMUNITY' as WorkCategory,
        creatorId: 'creator-1',
        status: 'OPEN' as const,
        requirements: { skills: ['JavaScript'], trustScoreMin: 10, timeCommitment: 5 },
        rewards: { xp: 50, trustScoreBonus: 5, rwisPoints: 25 },
        dungeonId: null,
        organizationId: null,
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should search tasks with filters', async () => {
      mockTaskModel.search.mockResolvedValue(mockTasks);

      const result = await taskManagementService.searchTasks({
        category: 'COMMUNITY',
        limit: 10,
        offset: 0
      });

      expect(mockTaskModel.search).toHaveBeenCalledWith({
        category: 'COMMUNITY',
        status: 'OPEN',
        minTrustScore: undefined,
        maxTrustScore: undefined,
        skills: undefined,
        limit: 10,
        offset: 0
      });
      expect(result.tasks).toEqual(mockTasks);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });
  });
});