import { GeminiProfileAnalysisService } from '../services/geminiProfileAnalysisService';
import { GeminiTaskMatchingService } from '../services/geminiTaskMatchingService';
import { GeminiTaskCategorizationService } from '../services/geminiTaskCategorizationService';
import { User, UserStats, WorkHistoryItem, Task } from '../../../shared/types';

// Mock the Google Generative AI
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel
  }))
}));

describe('Gemini AI Services', () => {
  let profileService: GeminiProfileAnalysisService;
  let matchingService: GeminiTaskMatchingService;
  let categorizationService: GeminiTaskCategorizationService;

  const mockUser: User = {
    id: 'test-user-1',
    username: 'testuser',
    email: 'test@example.com',
    characterData: {
      baseSprite: 'DEFAULT',
      colorPalette: { primary: '#000000', secondary: '#ffffff', accent: '#ff0000' },
      accessories: [],
      unlockedItems: []
    },
    locationData: {
      coordinates: { x: 40.7128, y: -74.0060 },
      currentZone: 'zone1',
      discoveredDungeons: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockUserStats: UserStats = {
    userId: 'test-user-1',
    trustScore: 75,
    rwisScore: 60,
    xpPoints: 1250,
    currentLevel: 5,
    unlockedZones: ['zone1', 'zone2'],
    categoryStats: {
      freelance: {
        tasksCompleted: 8,
        totalXP: 400,
        averageRating: 4.2,
        specializations: ['Web Development', 'UI Design']
      },
      community: {
        tasksCompleted: 12,
        totalXP: 600,
        averageRating: 4.5,
        specializations: ['Event Planning', 'Tutoring']
      },
      corporate: {
        tasksCompleted: 5,
        totalXP: 250,
        averageRating: 4.0,
        specializations: ['Data Analysis']
      }
    }
  };

  const mockWorkHistory: WorkHistoryItem[] = [
    {
      id: 'work-1',
      userId: 'test-user-1',
      taskId: 'task-1',
      category: 'FREELANCE',
      qualityScore: 4,
      xpEarned: 50,
      trustScoreChange: 2,
      rwisEarned: 30,
      completionDate: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15')
    }
  ];

  const mockTask: Task = {
    id: 'task-test-1',
    title: 'Test Task',
    description: 'A test task for unit testing',
    category: 'FREELANCE',
    dungeonId: 'dungeon-1',
    creatorId: 'user-1',
    organizationId: 'org-1',
    requirements: {
      skills: ['JavaScript', 'React'],
      trustScoreMin: 50,
      timeCommitment: 8,
      level: 3
    },
    rewards: {
      xp: 60,
      trustScoreBonus: 3,
      rwisPoints: 40,
      payment: 100
    },
    status: 'OPEN',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Set up environment variable for tests
    process.env.GEMINI_API_KEY = 'test-api-key';
    
    // Reset mocks
    jest.clearAllMocks();
    
    profileService = new GeminiProfileAnalysisService();
    matchingService = new GeminiTaskMatchingService();
    categorizationService = new GeminiTaskCategorizationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GeminiProfileAnalysisService', () => {
    describe('analyzeSkillProfile', () => {
      it('should analyze user skill profile successfully', async () => {
        const mockResponse = JSON.stringify({
          technicalSkills: [
            {
              skill: 'JavaScript',
              level: 7,
              confidence: 85,
              evidenceCount: 5,
              lastDemonstrated: '2024-01-15',
              growthTrend: 'IMPROVING'
            }
          ],
          softSkills: [
            {
              skill: 'Communication',
              level: 6,
              confidence: 75,
              evidenceCount: 3,
              lastDemonstrated: '2024-01-10',
              growthTrend: 'STABLE'
            }
          ],
          categoryExpertise: [],
          emergingSkills: ['React'],
          skillGaps: ['Database Design'],
          overallLevel: 6
        });

        mockGenerateContent.mockResolvedValue({
          response: {
            text: () => mockResponse
          }
        });

        const result = await profileService.analyzeSkillProfile(mockUser, mockUserStats, mockWorkHistory);

        expect(result).toBeDefined();
        expect(result.technicalSkills).toHaveLength(1);
        expect(result.technicalSkills[0].skill).toBe('JavaScript');
        expect(result.overallLevel).toBe(6);
      });

      it('should handle AI service errors gracefully', async () => {
        mockGenerateContent.mockRejectedValue(new Error('AI service unavailable'));

        const result = await profileService.analyzeSkillProfile(mockUser, mockUserStats, mockWorkHistory);

        expect(result).toBeDefined();
        expect(result.overallLevel).toBeGreaterThan(0);
      });
    });
  });

  describe('GeminiTaskMatchingService', () => {
    describe('matchTasksToUser', () => {
      it('should match tasks to user successfully', async () => {
        const mockResponse = JSON.stringify([
          {
            taskId: 'task-test-1',
            matchScore: 85,
            reasoning: 'Good skill alignment',
            skillAlignment: ['JavaScript'],
            difficultyMatch: 'GOOD',
            categoryFit: 90
          }
        ]);

        mockGenerateContent.mockResolvedValue({
          response: {
            text: () => mockResponse
          }
        });

        const result = await matchingService.matchTasksToUser(
          [mockTask], mockUser, mockUserStats
        );

        expect(result).toHaveLength(1);
        expect(result[0].task.id).toBe('task-test-1');
        expect(result[0].matchScore).toBe(85);
      });

      it('should use fallback matching when AI fails', async () => {
        mockGenerateContent.mockRejectedValue(new Error('AI service down'));

        const result = await matchingService.matchTasksToUser(
          [mockTask], mockUser, mockUserStats
        );

        expect(result).toBeDefined();
        // Fallback should still return results if task meets basic criteria
      });
    });
  });

  describe('GeminiTaskCategorizationService', () => {
    describe('categorizeTask', () => {
      it('should categorize task successfully', async () => {
        const mockResponse = JSON.stringify({
          category: 'FREELANCE',
          confidence: 85,
          reasoning: 'Client-focused development work',
          suggestedSkills: ['JavaScript'],
          estimatedDifficulty: 'INTERMEDIATE',
          timeEstimate: 8,
          impactScore: 60
        });

        mockGenerateContent.mockResolvedValue({
          response: {
            text: () => mockResponse
          }
        });

        const result = await categorizationService.categorizeTask(
          'Build React Component',
          'Create a reusable React component'
        );

        expect(result.category).toBe('FREELANCE');
        expect(result.confidence).toBe(85);
        expect(result.estimatedDifficulty).toBe('INTERMEDIATE');
      });

      it('should handle categorization errors gracefully', async () => {
        mockGenerateContent.mockRejectedValue(new Error('AI service down'));

        const result = await categorizationService.categorizeTask(
          'Test Task',
          'Test description'
        );

        expect(result).toBeDefined();
        expect(['FREELANCE', 'COMMUNITY', 'CORPORATE']).toContain(result.category);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key gracefully', () => {
      delete process.env.GEMINI_API_KEY;

      expect(() => new GeminiProfileAnalysisService()).toThrow('GEMINI_API_KEY environment variable is required');
      expect(() => new GeminiTaskMatchingService()).toThrow('GEMINI_API_KEY environment variable is required');
      expect(() => new GeminiTaskCategorizationService()).toThrow('GEMINI_API_KEY environment variable is required');
    });

    it('should handle malformed JSON responses', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'invalid json response'
        }
      });

      const result = await profileService.analyzeSkillProfile(mockUser, mockUserStats, mockWorkHistory);
      
      expect(result).toBeDefined();
      expect(result.overallLevel).toBeGreaterThan(0);
    });
  });
});