import pool from '../config/database';
import { Badge, UserAchievement, BadgeCategory, BadgeRarity, BadgeUnlockCriteria } from '../../../shared/types';

export class BadgeModel {
  /**
   * Find all badges
   */
  static async findAll(): Promise<Badge[]> {
    const result = await pool.query(
      `SELECT id, name, description, category, rarity, icon_url, unlock_criteria, created_at
       FROM badges 
       ORDER BY rarity, category, name`
    );
    
    return result.rows.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category as BadgeCategory,
      rarity: badge.rarity as BadgeRarity,
      iconUrl: badge.icon_url,
      unlockCriteria: badge.unlock_criteria as BadgeUnlockCriteria,
      createdAt: badge.created_at
    }));
  }

  /**
   * Find badge by ID
   */
  static async findById(id: string): Promise<Badge | null> {
    const result = await pool.query(
      `SELECT id, name, description, category, rarity, icon_url, unlock_criteria, created_at
       FROM badges WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const badge = result.rows[0];
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category as BadgeCategory,
      rarity: badge.rarity as BadgeRarity,
      iconUrl: badge.icon_url,
      unlockCriteria: badge.unlock_criteria as BadgeUnlockCriteria,
      createdAt: badge.created_at
    };
  }

  /**
   * Find badges by category
   */
  static async findByCategory(category: BadgeCategory): Promise<Badge[]> {
    const result = await pool.query(
      `SELECT id, name, description, category, rarity, icon_url, unlock_criteria, created_at
       FROM badges 
       WHERE category = $1
       ORDER BY rarity, name`,
      [category]
    );
    
    return result.rows.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category as BadgeCategory,
      rarity: badge.rarity as BadgeRarity,
      iconUrl: badge.icon_url,
      unlockCriteria: badge.unlock_criteria as BadgeUnlockCriteria,
      createdAt: badge.created_at
    }));
  }

  /**
   * Create a new badge
   */
  static async create(badgeData: {
    name: string;
    description: string;
    category: BadgeCategory;
    rarity: BadgeRarity;
    iconUrl?: string;
    unlockCriteria: BadgeUnlockCriteria;
  }): Promise<Badge> {
    const result = await pool.query(
      `INSERT INTO badges (name, description, category, rarity, icon_url, unlock_criteria)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, category, rarity, icon_url, unlock_criteria, created_at`,
      [
        badgeData.name,
        badgeData.description,
        badgeData.category,
        badgeData.rarity,
        badgeData.iconUrl,
        JSON.stringify(badgeData.unlockCriteria)
      ]
    );
    
    const badge = result.rows[0];
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category as BadgeCategory,
      rarity: badge.rarity as BadgeRarity,
      iconUrl: badge.icon_url,
      unlockCriteria: badge.unlock_criteria as BadgeUnlockCriteria,
      createdAt: badge.created_at
    };
  }
}

export class UserAchievementModel {
  /**
   * Award a badge to a user
   */
  static async awardBadge(userId: string, badgeId: string, taskId?: string): Promise<UserAchievement> {
    const result = await pool.query(
      `INSERT INTO user_achievements (user_id, badge_id, task_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, badge_id) DO NOTHING
       RETURNING id, user_id, badge_id, earned_at, task_id`,
      [userId, badgeId, taskId]
    );
    
    if (result.rows.length === 0) {
      // Badge already awarded, fetch existing record
      const existing = await pool.query(
        `SELECT id, user_id, badge_id, earned_at, task_id
         FROM user_achievements 
         WHERE user_id = $1 AND badge_id = $2`,
        [userId, badgeId]
      );
      
      const achievement = existing.rows[0];
      return {
        id: achievement.id,
        userId: achievement.user_id,
        badgeId: achievement.badge_id,
        earnedAt: achievement.earned_at,
        taskId: achievement.task_id
      };
    }
    
    const achievement = result.rows[0];
    return {
      id: achievement.id,
      userId: achievement.user_id,
      badgeId: achievement.badge_id,
      earnedAt: achievement.earned_at,
      taskId: achievement.task_id
    };
  }

  /**
   * Get all achievements for a user
   */
  static async findByUser(userId: string): Promise<UserAchievement[]> {
    const result = await pool.query(
      `SELECT ua.id, ua.user_id, ua.badge_id, ua.earned_at, ua.task_id,
              b.name, b.description, b.category, b.rarity, b.icon_url
       FROM user_achievements ua
       JOIN badges b ON ua.badge_id = b.id
       WHERE ua.user_id = $1
       ORDER BY ua.earned_at DESC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      badgeId: row.badge_id,
      earnedAt: row.earned_at,
      taskId: row.task_id,
      badge: {
        id: row.badge_id,
        name: row.name,
        description: row.description,
        category: row.category as BadgeCategory,
        rarity: row.rarity as BadgeRarity,
        iconUrl: row.icon_url,
        unlockCriteria: {}, // Not needed for display
        createdAt: new Date() // Not needed for display
      }
    }));
  }

  /**
   * Check if user has a specific badge
   */
  static async userHasBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM user_achievements WHERE user_id = $1 AND badge_id = $2',
      [userId, badgeId]
    );
    return result.rows.length > 0;
  }

  /**
   * Get user's badge IDs (for quick lookups)
   */
  static async getUserBadgeIds(userId: string): Promise<string[]> {
    const result = await pool.query(
      'SELECT badge_id FROM user_achievements WHERE user_id = $1',
      [userId]
    );
    return result.rows.map(row => row.badge_id);
  }

  /**
   * Get badge statistics for a user
   */
  static async getUserBadgeStats(userId: string): Promise<{
    total: number;
    byCategory: Record<BadgeCategory, number>;
    byRarity: Record<BadgeRarity, number>;
  }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        b.category,
        b.rarity
      FROM user_achievements ua
      JOIN badges b ON ua.badge_id = b.id
      WHERE ua.user_id = $1
      GROUP BY b.category, b.rarity
    `, [userId]);
    
    const stats = {
      total: 0,
      byCategory: {} as Record<BadgeCategory, number>,
      byRarity: {} as Record<BadgeRarity, number>
    };
    
    result.rows.forEach(row => {
      stats.total += parseInt(row.total);
      stats.byCategory[row.category as BadgeCategory] = (stats.byCategory[row.category as BadgeCategory] || 0) + parseInt(row.total);
      stats.byRarity[row.rarity as BadgeRarity] = (stats.byRarity[row.rarity as BadgeRarity] || 0) + parseInt(row.total);
    });
    
    return stats;
  }

  /**
   * Check which badges a user can unlock based on their current stats
   */
  static async checkUnlockableBadges(
    userId: string,
    userStats: {
      tasksCompleted: number;
      trustScore: number;
      categoryStats: any;
    }
  ): Promise<Badge[]> {
    // Get all badges user doesn't have yet
    const result = await pool.query(`
      SELECT b.id, b.name, b.description, b.category, b.rarity, b.icon_url, b.unlock_criteria, b.created_at
      FROM badges b
      WHERE b.id NOT IN (
        SELECT badge_id FROM user_achievements WHERE user_id = $1
      )
    `, [userId]);
    
    const availableBadges = result.rows.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category as BadgeCategory,
      rarity: badge.rarity as BadgeRarity,
      iconUrl: badge.icon_url,
      unlockCriteria: badge.unlock_criteria as BadgeUnlockCriteria,
      createdAt: badge.created_at
    }));
    
    // Filter badges that can be unlocked
    return availableBadges.filter(badge => {
      const criteria = badge.unlockCriteria;
      
      if (criteria.tasksCompleted && userStats.tasksCompleted < criteria.tasksCompleted) {
        return false;
      }
      
      if (criteria.trustScore && userStats.trustScore < criteria.trustScore) {
        return false;
      }
      
      if (criteria.categoryTasks) {
        for (const [category, required] of Object.entries(criteria.categoryTasks)) {
          const userCategoryStats = userStats.categoryStats[category];
          if (!userCategoryStats || userCategoryStats.tasksCompleted < required) {
            return false;
          }
        }
      }
      
      return true;
    });
  }
}