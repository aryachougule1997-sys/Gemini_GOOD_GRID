import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Database connection (you'll need to configure this)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/goodgrid'
});

// Get user profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userQuery = `
            SELECT id, username, email, created_at, updated_at
            FROM users 
            WHERE id = $1
        `;
        
        const result = await pool.query(userQuery, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user stats
router.get('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const statsQuery = `
            SELECT 
                COALESCE(trust_score, 0) as trustScore,
                COALESCE(rwis_score, 0) as rwisScore,
                COALESCE(total_xp, 0) as totalXP,
                COALESCE(total_impact, 0) as totalImpact,
                COALESCE(reliability_score, 0) as reliabilityScore
            FROM user_stats 
            WHERE user_id = $1
        `;
        
        const result = await pool.query(statsQuery, [userId]);
        
        if (result.rows.length === 0) {
            // Return default stats for new users
            return res.json({
                trustScore: 0,
                rwisScore: 0,
                totalXP: 0,
                totalImpact: 0,
                reliabilityScore: 0
            });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user tasks and achievements
router.get('/:userId/tasks', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const tasksQuery = `
            SELECT 
                category,
                COUNT(*) as completed,
                SUM(xp_earned) as xp,
                AVG(quality_score) as avgRating,
                ARRAY_AGG(DISTINCT skill) FILTER (WHERE skill IS NOT NULL) as skills
            FROM user_tasks 
            WHERE user_id = $1 AND status = 'completed'
            GROUP BY category
        `;
        
        const recentQuery = `
            SELECT id, category, quality_score, xp_earned, completion_date
            FROM user_tasks 
            WHERE user_id = $1 AND status = 'completed'
            ORDER BY completion_date DESC
            LIMIT 10
        `;
        
        const [tasksResult, recentResult] = await Promise.all([
            pool.query(tasksQuery, [userId]),
            pool.query(recentQuery, [userId])
        ]);
        
        // Transform data into expected format
        const categoryStats = {
            freelance: { completed: 0, xp: 0, avgRating: 0, skills: [] },
            community: { completed: 0, xp: 0, avgRating: 0, skills: [] },
            corporate: { completed: 0, xp: 0, avgRating: 0, skills: [] }
        };
        
        tasksResult.rows.forEach(row => {
            if (categoryStats[row.category as keyof typeof categoryStats]) {
                categoryStats[row.category as keyof typeof categoryStats] = {
                    completed: parseInt(row.completed),
                    xp: parseInt(row.xp || 0),
                    avgRating: parseFloat(row.avgrating || 0),
                    skills: row.skills || []
                };
            }
        });
        
        // Calculate totals
        const total = {
            completed: Object.values(categoryStats).reduce((sum, cat) => sum + cat.completed, 0),
            avgRating: Object.values(categoryStats).reduce((sum, cat) => sum + cat.avgRating, 0) / 3
        };
        
        res.json({
            ...categoryStats,
            total,
            recent: recentResult.rows
        });
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;