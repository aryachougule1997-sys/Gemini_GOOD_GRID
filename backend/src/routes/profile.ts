import express from 'express';
import { ProfileService } from '../services/profileService';
import { DatabaseService } from '../services/databaseService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Initialize services
const dbService = new DatabaseService();
const profileService = new ProfileService(dbService);

/**
 * GET /api/profile/:userId
 * Get comprehensive user profile with stats and progress
 */
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Ensure user can only access their own profile or is admin
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const profile = await profileService.getUserProfile(userId);
        
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch profile' 
        });
    }
});

/**
 * GET /api/profile/:userId/work-history
 * Get detailed work history with filtering and pagination
 */
router.get('/:userId/work-history', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { category, limit, offset, sortBy, sortOrder } = req.query;
        
        // Ensure user can only access their own work history or is admin
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const workHistory = await profileService.getWorkHistory(
            userId,
            category as string,
            limit ? parseInt(limit as string) : undefined,
            offset ? parseInt(offset as string) : undefined
        );

        // Apply client-side sorting if needed
        if (sortBy && sortOrder) {
            workHistory.sort((a, b) => {
                const order = sortOrder === 'asc' ? 1 : -1;
                switch (sortBy) {
                    case 'date':
                        return order * (new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime());
                    case 'rating':
                        return order * (a.rating - b.rating);
                    case 'xp':
                        return order * (a.xpEarned - b.xpEarned);
                    case 'impact':
                        return order * (a.rwisEarned - b.rwisEarned);
                    default:
                        return 0;
                }
            });
        }

        res.json({
            success: true,
            data: workHistory,
            pagination: {
                limit: limit ? parseInt(limit as string) : null,
                offset: offset ? parseInt(offset as string) : 0,
                total: workHistory.length
            }
        });

    } catch (error) {
        console.error('Error fetching work history:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch work history' 
        });
    }
});

/**
 * GET /api/profile/:userId/reputation/:category
 * Get category-specific reputation and scoring
 */
router.get('/:userId/reputation/:category', authenticateToken, async (req, res) => {
    try {
        const { userId, category } = req.params;
        
        // Validate category
        const validCategories = ['FREELANCE', 'COMMUNITY', 'CORPORATE'];
        if (!validCategories.includes(category.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        // Ensure user can only access their own reputation or is admin
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const reputation = await profileService.getCategoryReputation(
            userId, 
            category.toUpperCase() as 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'
        );

        res.json({
            success: true,
            data: reputation
        });

    } catch (error) {
        console.error('Error fetching category reputation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch reputation data' 
        });
    }
});

/**
 * GET /api/profile/:userId/badges
 * Get all earned badges and achievements
 */
router.get('/:userId/badges', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { category, rarity } = req.query;
        
        // Ensure user can only access their own badges or is admin
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        let badges = await profileService.getUserBadges(userId);

        // Apply filters
        if (category) {
            badges = badges.filter(badge => badge.category === category.toString().toUpperCase());
        }

        if (rarity) {
            badges = badges.filter(badge => badge.rarity === rarity.toString().toUpperCase());
        }

        // Group badges by category for better organization
        const groupedBadges = badges.reduce((acc, badge) => {
            if (!acc[badge.category]) {
                acc[badge.category] = [];
            }
            acc[badge.category].push(badge);
            return acc;
        }, {} as Record<string, typeof badges>);

        res.json({
            success: true,
            data: {
                badges,
                groupedBadges,
                stats: {
                    total: badges.length,
                    byRarity: badges.reduce((acc, badge) => {
                        acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>),
                    byCategory: badges.reduce((acc, badge) => {
                        acc[badge.category] = (acc[badge.category] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch badges' 
        });
    }
});

/**
 * PUT /api/profile/:userId/category-stats
 * Update category-specific statistics
 */
router.put('/:userId/category-stats', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { category, stats } = req.body;
        
        // Ensure user can only update their own stats or is admin
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Validate category
        const validCategories = ['freelance', 'community', 'corporate'];
        if (!validCategories.includes(category.toLowerCase())) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        await profileService.updateCategoryStats(userId, category.toLowerCase(), stats);

        res.json({
            success: true,
            message: 'Category stats updated successfully'
        });

    } catch (error) {
        console.error('Error updating category stats:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update category stats' 
        });
    }
});

/**
 * POST /api/profile/:userId/export
 * Generate and export profile data in various formats
 */
router.post('/:userId/export', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { format = 'json', includeWorkHistory = true, includeBadges = true } = req.body;
        
        // Ensure user can only export their own profile or is admin
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Validate format
        const validFormats = ['json', 'pdf', 'linkedin'];
        if (!validFormats.includes(format)) {
            return res.status(400).json({ error: 'Invalid export format' });
        }

        const exportData = await profileService.generateProfileExport(userId, format);

        // Set appropriate headers based on format
        switch (format) {
            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="profile-${userId}.json"`);
                break;
            case 'pdf':
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="profile-${userId}.pdf"`);
                break;
            case 'linkedin':
                res.setHeader('Content-Type', 'application/json');
                break;
        }

        res.json({
            success: true,
            data: exportData,
            format,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error exporting profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to export profile' 
        });
    }
});

/**
 * GET /api/profile/:userId/analytics
 * Get profile analytics and performance metrics
 */
router.get('/:userId/analytics', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe = '30d' } = req.query;
        
        // Ensure user can only access their own analytics or is admin
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get profile and work history for analytics
        const profile = await profileService.getUserProfile(userId);
        const workHistory = await profileService.getWorkHistory(userId);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Calculate analytics
        const now = new Date();
        const timeframeDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        const cutoffDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));

        const recentWork = workHistory.filter(item => 
            new Date(item.completionDate) >= cutoffDate
        );

        const analytics = {
            timeframe,
            period: {
                start: cutoffDate.toISOString(),
                end: now.toISOString()
            },
            metrics: {
                tasksCompleted: recentWork.length,
                averageRating: recentWork.length > 0 
                    ? recentWork.reduce((sum, item) => sum + item.rating, 0) / recentWork.length 
                    : 0,
                totalXPEarned: recentWork.reduce((sum, item) => sum + item.xpEarned, 0),
                totalImpactScore: recentWork.reduce((sum, item) => sum + item.rwisEarned, 0),
                completionRate: 96, // Mock data - would calculate from actual completion vs started tasks
                averageResponseTime: '2.3 hours' // Mock data
            },
            categoryBreakdown: {
                freelance: recentWork.filter(item => item.category === 'FREELANCE').length,
                community: recentWork.filter(item => item.category === 'COMMUNITY').length,
                corporate: recentWork.filter(item => item.category === 'CORPORATE').length
            },
            trends: {
                xpGrowth: '+15%', // Mock data
                trustScoreGrowth: '+8%', // Mock data
                taskVelocity: recentWork.length / (timeframeDays / 7) // tasks per week
            }
        };

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch analytics' 
        });
    }
});

export default router;