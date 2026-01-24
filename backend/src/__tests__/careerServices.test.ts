import { GeminiCareerService } from '../services/geminiCareerService';
import { ResumeExportService } from '../services/resumeExportService';
import { User, UserStats, WorkHistoryItem } from '../../../shared/types';

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

// Mock fs for export service
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ size: 1024 })
  },
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

describe('Career Services', () => {
  let careerService: GeminiCareerService;
  let exportService: ResumeExportService;

  const mockUser: User = {
    id: 'test-user-1',
    username: 'john_doe',
    email: 'john@example.com',
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
    trustScore: 85,
    rwisScore: 120,
    xpPoints: 2500,
    currentLevel: 8,
    unlockedZones: ['zone1', 'zone2'],
    categoryStats: {
      freelance: {
        tasksCompleted: 15,
        totalXP: 1200,
        averageRating: 4.6,
        specializations: ['Web Development', 'JavaScript']
      },
      community: {
        tasksCompleted: 8,
        totalXP: 800,
        averageRating: 4.8,
        specializations: ['Event Planning', 'Tutoring']
      },
      corporate: {
        tasksCompleted: 5,
        totalXP: 500,
        averageRating: 4.2,
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
      qualityScore: 5,
      xpEarned: 100,
      trustScoreChange: 5,
      rwisEarned: 25,
      completionDate: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15')
    }
  ];

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    jest.clearAllMocks();
    
    careerService = new GeminiCareerService();
    exportService = new ResumeExportService();
  });

  describe('GeminiCareerService', () => {
    describe('generateResume', () => {
      it('should generate resume data successfully', async () => {
        const mockResponse = JSON.stringify({
          personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            location: 'New York, NY',
            trustScore: 85,
            rwisScore: 120
          },
          professionalSummary: 'Experienced developer with strong track record',
          workExperience: [
            {
              title: 'Frontend Developer',
              organization: 'Tech Company',
              category: 'FREELANCE',
              duration: 'Jan 2024 - Present',
              description: ['Developed web applications'],
              achievements: ['Improved performance by 30%'],
              skillsUsed: ['JavaScript', 'React'],
              impactMetrics: ['High user satisfaction']
            }
          ],
          skills: {
            technical: [
              {
                name: 'JavaScript',
                level: 'Advanced',
                yearsOfExperience: 3,
                endorsements: 5
              }
            ],
            soft: [],
            languages: [],
            tools: []
          },
          achievements: [],
          certifications: [],
          volunteerWork: [],
          projects: []
        });

        mockGenerateContent.mockResolvedValue({
          response: {
            text: () => mockResponse
          }
        });

        const template = exportService.getAvailableTemplates()[0];
        const result = await careerService.generateResume(
          mockUser,
          mockUserStats,
          mockWorkHistory,
          template
        );

        expect(result).toBeDefined();
        expect(result.personalInfo.fullName).toBe('John Doe');
        expect(result.personalInfo.trustScore).toBe(85);
        expect(result.workExperience).toHaveLength(1);
        expect(result.skills.technical).toHaveLength(1);
        expect(result.skills.technical[0].name).toBe('JavaScript');
      });

      it('should handle AI service errors gracefully', async () => {
        mockGenerateContent.mockRejectedValue(new Error('AI service unavailable'));

        const template = exportService.getAvailableTemplates()[0];
        const result = await careerService.generateResume(
          mockUser,
          mockUserStats,
          mockWorkHistory,
          template
        );

        expect(result).toBeDefined();
        expect(result.personalInfo.fullName).toBe(mockUser.username);
        expect(result.personalInfo.trustScore).toBe(mockUserStats.trustScore);
      });
    });

    describe('getJobRecommendations', () => {
      it('should return job recommendations successfully', async () => {
        const mockResponse = JSON.stringify([
          {
            title: 'Frontend Developer',
            company: 'Tech Corp',
            location: 'Remote',
            salaryRange: '$70,000 - $90,000',
            matchScore: 85,
            reasoning: 'Strong JavaScript skills match requirements',
            requiredSkills: ['JavaScript', 'React'],
            matchingSkills: ['JavaScript'],
            skillGaps: ['React'],
            experienceLevel: 'Mid-level',
            jobType: 'FULL_TIME',
            category: 'FREELANCE',
            companyDescription: 'Growing tech company',
            growthOpportunities: ['Senior Developer', 'Tech Lead']
          }
        ]);

        mockGenerateContent.mockResolvedValue({
          response: {
            text: () => mockResponse
          }
        });

        const preferences = {
          jobTypes: ['FULL_TIME'],
          locations: ['Remote'],
          remoteWork: true,
          categories: ['FREELANCE' as const]
        };

        const result = await careerService.getJobRecommendations(
          mockUser,
          mockUserStats,
          mockWorkHistory,
          preferences,
          5
        );

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Frontend Developer');
        expect(result[0].matchScore).toBe(85);
        expect(result[0].category).toBe('FREELANCE');
      });

      it('should use fallback when AI fails', async () => {
        mockGenerateContent.mockRejectedValue(new Error('AI service down'));

        const preferences = {
          jobTypes: ['FULL_TIME'],
          locations: ['Remote'],
          remoteWork: true,
          categories: ['FREELANCE' as const]
        };

        const result = await careerService.getJobRecommendations(
          mockUser,
          mockUserStats,
          mockWorkHistory,
          preferences,
          5
        );

        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('FREELANCE'); // Strongest category
      });
    });

    describe('generateProfessionalSummary', () => {
      it('should generate professional summary', async () => {
        const mockSummary = 'Experienced professional with 8 levels of achievement and strong technical skills in web development.';
        
        mockGenerateContent.mockResolvedValue({
          response: {
            text: () => mockSummary
          }
        });

        const result = await careerService.generateProfessionalSummary(
          mockUser,
          mockUserStats,
          mockWorkHistory,
          'RECRUITERS'
        );

        expect(result).toBe(mockSummary);
      });

      it('should provide fallback summary when AI fails', async () => {
        mockGenerateContent.mockRejectedValue(new Error('AI service down'));

        const result = await careerService.generateProfessionalSummary(
          mockUser,
          mockUserStats,
          mockWorkHistory,
          'GENERAL'
        );

        expect(result).toContain('Experienced professional');
        expect(result).toContain('8 levels');
        expect(result).toContain('trust score of 85');
      });
    });

    describe('analyzeSkillGapsForJob', () => {
      it('should analyze skill gaps successfully', async () => {
        const mockResponse = JSON.stringify({
          matchingSkills: ['JavaScript', 'Problem Solving'],
          skillGaps: ['React', 'Node.js'],
          developmentPlan: ['Learn React fundamentals', 'Build Node.js projects'],
          timeToReadiness: '3-6 months',
          recommendedTasks: ['Complete React tutorial', 'Build full-stack project'],
          confidenceScore: 75
        });

        mockGenerateContent.mockResolvedValue({
          response: {
            text: () => mockResponse
          }
        });

        const result = await careerService.analyzeSkillGapsForJob(
          mockUserStats,
          mockWorkHistory,
          'Full Stack Developer',
          'Tech Company'
        );

        expect(result.matchingSkills).toContain('JavaScript');
        expect(result.skillGaps).toContain('React');
        expect(result.confidenceScore).toBe(75);
        expect(result.timeToReadiness).toBe('3-6 months');
      });
    });

    describe('getCareerPathRecommendations', () => {
      it('should return career path recommendations', async () => {
        const mockResponse = JSON.stringify([
          {
            pathName: 'Full-Stack Developer',
            description: 'Progression from frontend to full-stack development',
            timeframe: '12-18 months',
            currentFitScore: 80,
            steps: [
              {
                stepNumber: 1,
                title: 'Master Backend Technologies',
                description: 'Learn Node.js and databases',
                duration: '3-6 months',
                requiredActions: ['Complete Node.js course'],
                skillsToGain: ['Node.js', 'MongoDB'],
                recommendedTasks: ['Build API projects'],
                milestones: ['Deploy first API']
              }
            ],
            requiredSkills: ['JavaScript', 'React', 'Node.js'],
            salaryProgression: [
              { level: 'Junior', minSalary: 60000, maxSalary: 80000, currency: 'USD' }
            ],
            jobTitles: ['Full-Stack Developer', 'Software Engineer'],
            industries: ['Technology', 'Startups']
          }
        ]);

        mockGenerateContent.mockResolvedValue({
          response: {
            text: () => mockResponse
          }
        });

        const result = await careerService.getCareerPathRecommendations(
          mockUser,
          mockUserStats,
          mockWorkHistory,
          ['Technology'],
          '1-2 years'
        );

        expect(result).toHaveLength(1);
        expect(result[0].pathName).toBe('Full-Stack Developer');
        expect(result[0].currentFitScore).toBe(80);
        expect(result[0].steps).toHaveLength(1);
      });
    });
  });

  describe('ResumeExportService', () => {
    describe('getAvailableTemplates', () => {
      it('should return available resume templates', () => {
        const templates = exportService.getAvailableTemplates();
        
        expect(templates).toHaveLength(5);
        expect(templates[0].name).toBe('Modern Technical');
        expect(templates[0].category).toBe('TECHNICAL');
        expect(templates.some(t => t.category === 'CREATIVE')).toBe(true);
        expect(templates.some(t => t.category === 'BUSINESS')).toBe(true);
      });
    });

    describe('exportResume', () => {
      it('should export resume to HTML successfully', async () => {
        const resumeData = {
          personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            location: 'New York, NY',
            trustScore: 85,
            rwisScore: 120
          },
          professionalSummary: 'Experienced developer',
          workExperience: [],
          skills: { technical: [], soft: [], languages: [], tools: [] },
          achievements: [],
          education: [],
          certifications: [],
          volunteerWork: [],
          projects: []
        };

        const template = exportService.getAvailableTemplates()[0];
        const options = {
          format: 'HTML' as const,
          template,
          includeGamification: true,
          professionalMode: false,
          colorScheme: 'BLUE' as const
        };

        const result = await exportService.exportResume(resumeData, options, 'test-user');

        expect(result.success).toBe(true);
        expect(result.downloadUrl).toContain('/api/exports/resume/');
        expect(result.metadata.format).toBe('HTML');
        expect(result.metadata.fileSize).toBe(1024);
      });

      it('should export resume to JSON successfully', async () => {
        const resumeData = {
          personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            location: 'New York, NY',
            trustScore: 85,
            rwisScore: 120
          },
          professionalSummary: 'Experienced developer',
          workExperience: [],
          skills: { technical: [], soft: [], languages: [], tools: [] },
          achievements: [],
          education: [],
          certifications: [],
          volunteerWork: [],
          projects: []
        };

        const template = exportService.getAvailableTemplates()[0];
        const options = {
          format: 'JSON' as const,
          template,
          includeGamification: true,
          professionalMode: false,
          colorScheme: 'BLUE' as const
        };

        const result = await exportService.exportResume(resumeData, options, 'test-user');

        expect(result.success).toBe(true);
        expect(result.metadata.format).toBe('JSON');
      });

      it('should handle export errors gracefully', async () => {
        const fs = require('fs');
        fs.promises.writeFile.mockRejectedValue(new Error('Write failed'));

        const resumeData = {
          personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            location: 'New York, NY',
            trustScore: 85,
            rwisScore: 120
          },
          professionalSummary: 'Experienced developer',
          workExperience: [],
          skills: { technical: [], soft: [], languages: [], tools: [] },
          achievements: [],
          education: [],
          certifications: [],
          volunteerWork: [],
          projects: []
        };

        const template = exportService.getAvailableTemplates()[0];
        const options = {
          format: 'HTML' as const,
          template,
          includeGamification: true,
          professionalMode: false,
          colorScheme: 'BLUE' as const
        };

        const result = await exportService.exportResume(resumeData, options, 'test-user');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Write failed');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key gracefully', () => {
      delete process.env.GEMINI_API_KEY;

      expect(() => new GeminiCareerService()).toThrow('GEMINI_API_KEY environment variable is required');
    });

    it('should handle malformed JSON responses', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'invalid json response'
        }
      });

      const template = exportService.getAvailableTemplates()[0];
      const result = await careerService.generateResume(
        mockUser,
        mockUserStats,
        mockWorkHistory,
        template
      );

      expect(result).toBeDefined();
      expect(result.personalInfo.fullName).toBe(mockUser.username);
    });
  });
});