import express from 'express';
import { GeminiCareerService } from '../services/geminiCareerService';
import { ResumeExportService } from '../services/resumeExportService';
import { User, UserStats, WorkHistoryItem } from '../../../shared/types';

const router = express.Router();
const careerService = new GeminiCareerService();
const exportService = new ResumeExportService();

// Simple auth middleware for demo
const simpleAuth = (req: any, res: any, next: any) => {
    // For demo purposes, just add a mock user
    req.user = { id: 'demo-user' };
    next();
};

// Apply authentication middleware to all routes
router.use(simpleAuth);

/**
 * Generate resume from user's Good Grid profile
 */
router.post('/resume/generate', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { templateId, additionalInfo, includeGamification = true } = req.body;

        // Get user data (in a real app, this would come from database)
        const userData = await getUserData(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const templates = exportService.getAvailableTemplates();
        const template = templates.find(t => t.id === templateId) || templates[0];

        const resumeData = await careerService.generateResume(
            userData.user,
            userData.userStats,
            userData.workHistory,
            template,
            additionalInfo
        );

        res.json({
            success: true,
            data: resumeData,
            template: template
        });
    } catch (error) {
        console.error('Resume generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate resume',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Export resume in specified format
 */
router.post('/resume/export', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { 
            resumeData, 
            format = 'HTML', 
            templateId, 
            includeGamification = true,
            professionalMode = false,
            colorScheme = 'BLUE'
        } = req.body;

        if (!resumeData) {
            return res.status(400).json({ error: 'Resume data is required' });
        }

        const templates = exportService.getAvailableTemplates();
        const template = templates.find(t => t.id === templateId) || templates[0];

        const exportOptions = {
            format: format as 'PDF' | 'HTML' | 'DOCX' | 'JSON',
            template,
            includeGamification,
            professionalMode,
            colorScheme: colorScheme as 'BLUE' | 'GREEN' | 'PURPLE' | 'GRAY' | 'BLACK'
        };

        const result = await exportService.exportResume(resumeData, exportOptions, userId);

        res.json({
            success: result.success,
            downloadUrl: result.downloadUrl,
            metadata: result.metadata,
            error: result.error
        });
    } catch (error) {
        console.error('Resume export error:', error);
        res.status(500).json({ 
            error: 'Failed to export resume',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get AI-powered job recommendations
 */
router.post('/jobs/recommendations', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { 
            preferences = {
                jobTypes: ['FULL_TIME'],
                locations: ['Remote'],
                remoteWork: true,
                categories: ['FREELANCE', 'CORPORATE']
            },
            limit = 10
        } = req.body;

        const userData = await getUserData(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const recommendations = await careerService.getJobRecommendations(
            userData.user,
            userData.userStats,
            userData.workHistory,
            preferences,
            limit
        );

        res.json({
            success: true,
            data: recommendations,
            count: recommendations.length
        });
    } catch (error) {
        console.error('Job recommendations error:', error);
        res.status(500).json({ 
            error: 'Failed to get job recommendations',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get career path recommendations
 */
router.post('/career-paths', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { targetIndustries, timeframe } = req.body;

        const userData = await getUserData(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const careerPaths = await careerService.getCareerPathRecommendations(
            userData.user,
            userData.userStats,
            userData.workHistory,
            targetIndustries,
            timeframe
        );

        res.json({
            success: true,
            data: careerPaths
        });
    } catch (error) {
        console.error('Career path recommendations error:', error);
        res.status(500).json({ 
            error: 'Failed to get career path recommendations',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Generate professional summary for LinkedIn/resume
 */
router.post('/summary/generate', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { targetAudience = 'GENERAL' } = req.body;

        const userData = await getUserData(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const summary = await careerService.generateProfessionalSummary(
            userData.user,
            userData.userStats,
            userData.workHistory,
            targetAudience as 'RECRUITERS' | 'CLIENTS' | 'GENERAL'
        );

        res.json({
            success: true,
            data: {
                summary,
                targetAudience,
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Professional summary generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate professional summary',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Analyze skill gaps for target job
 */
router.post('/skills/gap-analysis', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { targetJobTitle, targetCompany } = req.body;

        if (!targetJobTitle) {
            return res.status(400).json({ error: 'Target job title is required' });
        }

        const userData = await getUserData(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const analysis = await careerService.analyzeSkillGapsForJob(
            userData.userStats,
            userData.workHistory,
            targetJobTitle,
            targetCompany
        );

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Skill gap analysis error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze skill gaps',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get available resume templates
 */
router.get('/resume/templates', async (req, res) => {
    try {
        const templates = exportService.getAvailableTemplates();
        
        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ 
            error: 'Failed to get resume templates',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get user's career dashboard data
 */
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userData = await getUserData(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate quick insights
        const professionalSummary = await careerService.generateProfessionalSummary(
            userData.user,
            userData.userStats,
            userData.workHistory,
            'GENERAL'
        );

        const quickJobRecommendations = await careerService.getJobRecommendations(
            userData.user,
            userData.userStats,
            userData.workHistory,
            {
                jobTypes: ['FULL_TIME', 'PART_TIME'],
                locations: ['Remote'],
                remoteWork: true,
                categories: ['FREELANCE', 'CORPORATE', 'COMMUNITY']
            },
            3
        );

        const dashboardData = {
            user: {
                name: userData.user.username,
                email: userData.user.email,
                trustScore: userData.userStats.trustScore,
                rwisScore: userData.userStats.rwisScore,
                currentLevel: userData.userStats.currentLevel,
                totalXP: userData.userStats.xpPoints
            },
            categoryStats: userData.userStats.categoryStats,
            recentWork: userData.workHistory.slice(-5),
            professionalSummary,
            quickJobRecommendations,
            careerMetrics: {
                totalProjects: userData.workHistory.length,
                averageQuality: userData.workHistory.length > 0 
                    ? userData.workHistory.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / userData.workHistory.length
                    : 0,
                totalImpact: userData.userStats.rwisScore,
                reliabilityScore: userData.userStats.trustScore
            }
        };

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Career dashboard error:', error);
        res.status(500).json({ 
            error: 'Failed to load career dashboard',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Helper function to get user data (mock implementation)
 * In a real application, this would query the database
 */
async function getUserData(userId: string): Promise<{
    user: User;
    userStats: UserStats;
    workHistory: WorkHistoryItem[];
} | null> {
    // This is a mock implementation
    // In a real app, you'd query your database here
    
    const mockUser: User = {
        id: userId,
        username: 'john_doe',
        email: 'john.doe@example.com',
        characterData: {
            baseSprite: 'DEFAULT',
            colorPalette: { primary: '#3498db', secondary: '#ffffff', accent: '#e74c3c' },
            accessories: [],
            unlockedItems: []
        },
        locationData: {
            coordinates: { x: 40.7128, y: -74.0060 },
            currentZone: 'manhattan',
            discoveredDungeons: ['freelance-tower-1', 'community-garden-1']
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
    };

    const mockUserStats: UserStats = {
        userId: userId,
        trustScore: 85,
        rwisScore: 120,
        xpPoints: 2500,
        currentLevel: 8,
        unlockedZones: ['manhattan', 'brooklyn', 'queens'],
        categoryStats: {
            freelance: {
                tasksCompleted: 15,
                totalXP: 1200,
                averageRating: 4.6,
                specializations: ['Web Development', 'UI/UX Design', 'JavaScript']
            },
            community: {
                tasksCompleted: 8,
                totalXP: 800,
                averageRating: 4.8,
                specializations: ['Event Planning', 'Tutoring', 'Environmental Projects']
            },
            corporate: {
                tasksCompleted: 5,
                totalXP: 500,
                averageRating: 4.2,
                specializations: ['Data Analysis', 'Project Management']
            }
        }
    };

    const mockWorkHistory: WorkHistoryItem[] = [
        {
            id: 'work-1',
            userId: userId,
            taskId: 'task-1',
            category: 'FREELANCE',
            qualityScore: 5,
            xpEarned: 100,
            trustScoreChange: 5,
            rwisEarned: 25,
            completionDate: new Date('2024-01-15'),
            createdAt: new Date('2024-01-15')
        },
        {
            id: 'work-2',
            userId: userId,
            taskId: 'task-2',
            category: 'COMMUNITY',
            qualityScore: 4,
            xpEarned: 75,
            trustScoreChange: 3,
            rwisEarned: 40,
            completionDate: new Date('2024-01-20'),
            createdAt: new Date('2024-01-20')
        }
    ];

    return {
        user: mockUser,
        userStats: mockUserStats,
        workHistory: mockWorkHistory
    };
}

export default router;