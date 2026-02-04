import express from 'express';
import { Pool } from 'pg';
import { ProfileService } from '../services/profileService';

const router = express.Router();

export const createProfileRoutes = (db: Pool) => {
    const profileService = new ProfileService(db);

    // Get user profile
    router.get('/:userId', async (req, res) => {
        try {
            const { userId } = req.params;
            const profile = await profileService.getUserProfile(userId);
            
            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            res.json(profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get user stats
    router.get('/:userId/stats', async (req, res) => {
        try {
            const { userId } = req.params;
            const stats = await profileService.getUserStats(userId);
            
            if (!stats) {
                return res.status(404).json({ error: 'User stats not found' });
            }

            res.json(stats);
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get work history
    router.get('/:userId/work-history', async (req, res) => {
        try {
            const { userId } = req.params;
            const { category, limit, offset } = req.query;
            
            const workHistory = await profileService.getWorkHistory(
                userId,
                category as string,
                limit ? parseInt(limit as string) : undefined,
                offset ? parseInt(offset as string) : undefined
            );

            res.json(workHistory);
        } catch (error) {
            console.error('Error fetching work history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get user badges
    router.get('/:userId/badges', async (req, res) => {
        try {
            const { userId } = req.params;
            const badges = await profileService.getUserBadges(userId);
            res.json(badges);
        } catch (error) {
            console.error('Error fetching badges:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get category stats
    router.get('/:userId/category-stats', async (req, res) => {
        try {
            const { userId } = req.params;
            const categoryStats = await profileService.getCategoryStats(userId);
            res.json(categoryStats);
        } catch (error) {
            console.error('Error fetching category stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Update character customization
    router.put('/:userId/character', async (req, res) => {
        try {
            const { userId } = req.params;
            const customizationData = req.body;
            
            await profileService.updateCharacterCustomization(userId, customizationData);
            res.json({ success: true, message: 'Character customization updated' });
        } catch (error) {
            console.error('Error updating character customization:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get profile analytics
    router.get('/:userId/analytics', async (req, res) => {
        try {
            const { userId } = req.params;
            const { timeRange } = req.query;
            
            const analytics = await profileService.getProfileAnalytics(
                userId,
                timeRange as 'week' | 'month' | 'year'
            );
            
            res.json(analytics);
        } catch (error) {
            console.error('Error fetching profile analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Export profile data
    router.get('/:userId/export', async (req, res) => {
        try {
            const { userId } = req.params;
            const { format } = req.query;
            
            const exportData = await profileService.exportProfileData(
                userId,
                format as 'json' | 'csv'
            );
            
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=profile-export.csv');
                
                // Convert to CSV string (simplified)
                const csvString = exportData.map((row: any) => 
                    Object.values(row).join(',')
                ).join('\n');
                
                const headers = Object.keys(exportData[0] || {}).join(',');
                res.send(headers + '\n' + csvString);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=profile-export.json');
                res.json(exportData);
            }
        } catch (error) {
            console.error('Error exporting profile data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};