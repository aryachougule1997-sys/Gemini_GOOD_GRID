import pool from '../config/database';
import { WorkHistoryItem, WorkCategory } from '../../../shared/types';

export class WorkHistoryModel {
  /**
   * Create a work history entry
   */
  static async create(historyData: {
    userId: string;
    taskId: string;
    category: WorkCategory;
    completionDate?: Date;
    qualityScore?: number;
    clientFeedback?: string;
    xpEarned: number;
    trustScoreChange: number;
    rwisEarned: number;
  }): Promise<WorkHistoryItem> {
    const result = await pool.query(
      `INSERT INTO work_history (user_id, task_id, category, completion_date, quality_score, client_feedback, xp_earned, trust_score_change, rwis_earned)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, user_id, task_id, category, completion_date, quality_score, client_feedback, xp_earned, trust_score_change, rwis_earned, created_at`,
      [
        historyData.userId,
        historyData.taskId,
        historyData.category,
        historyData.completionDate,
        historyData.qualityScore,
        historyData.clientFeedback,
        historyData.xpEarned,
        historyData.trustScoreChange,
        historyData.rwisEarned
      ]
    );
    
    const history = result.rows[0];
    return {
      id: history.id,
      userId: history.user_id,
      taskId: history.task_id,
      category: history.category,
      completionDate: history.completion_date,
      qualityScore: history.quality_score,
      clientFeedback: history.client_feedback,
      xpEarned: history.xp_earned,
      trustScoreChange: history.trust_score_change,
      rwisEarned: history.rwis_earned,
      createdAt: history.created_at
    };
  }

  /**
   * Find work history by user
   */
  static async findByUser(userId: string, category?: WorkCategory, limit?: number, offset?: number): Promise<WorkHistoryItem[]> {
    let query = `
      SELECT id, user_id, task_id, category, completion_date, quality_score, client_feedback, xp_earned, trust_score_change, rwis_earned, created_at
      FROM work_history 
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(offset);
    }

    const result = await pool.query(query, params);
    
    return result.rows.map(history => ({
      id: history.id,
      userId: history.user_id,
      taskId: history.task_id,
      category: history.category,
      completionDate: history.completion_date,
      qualityScore: history.quality_score,
      clientFeedback: history.client_feedback,
      xpEarned: history.xp_earned,
      trustScoreChange: history.trust_score_change,
      rwisEarned: history.rwis_earned,
      createdAt: history.created_at
    }));
  }

  /**
   * Find work history by task
   */
  static async findByTask(taskId: string): Promise<WorkHistoryItem[]> {
    const result = await pool.query(
      `SELECT id, user_id, task_id, category, completion_date, quality_score, client_feedback, xp_earned, trust_score_change, rwis_earned, created_at
       FROM work_history 
       WHERE task_id = $1
       ORDER BY created_at DESC`,
      [taskId]
    );
    
    return result.rows.map(history => ({
      id: history.id,
      userId: history.user_id,
      taskId: history.task_id,
      category: history.category,
      completionDate: history.completion_date,
      qualityScore: history.quality_score,
      clientFeedback: history.client_feedback,
      xpEarned: history.xp_earned,
      trustScoreChange: history.trust_score_change,
      rwisEarned: history.rwis_earned,
      createdAt: history.created_at
    }));
  }

  /**
   * Get user statistics by category
   */
  static async getUserCategoryStats(userId: string): Promise<{
    freelance: { tasksCompleted: number; totalXP: number; averageRating: number };
    community: { tasksCompleted: number; totalXP: number; averageRating: number };
    corporate: { tasksCompleted: number; totalXP: number; averageRating: number };
  }> {
    const result = await pool.query(`
      SELECT 
        category,
        COUNT(*) as tasks_completed,
        SUM(xp_earned) as total_xp,
        AVG(quality_score) as average_rating
      FROM work_history 
      WHERE user_id = $1
      GROUP BY category
    `, [userId]);
    
    const stats = {
      freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
      community: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
      corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0 }
    };
    
    result.rows.forEach(row => {
      const category = row.category.toLowerCase() as keyof typeof stats;
      stats[category] = {
        tasksCompleted: parseInt(row.tasks_completed),
        totalXP: parseInt(row.total_xp) || 0,
        averageRating: parseFloat(row.average_rating) || 0
      };
    });
    
    return stats;
  }

  /**
   * Get user's total statistics
   */
  static async getUserTotalStats(userId: string): Promise<{
    totalTasks: number;
    totalXP: number;
    totalRWIS: number;
    averageRating: number;
    totalTrustScoreChange: number;
  }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(xp_earned) as total_xp,
        SUM(rwis_earned) as total_rwis,
        AVG(quality_score) as average_rating,
        SUM(trust_score_change) as total_trust_score_change
      FROM work_history 
      WHERE user_id = $1
    `, [userId]);
    
    const stats = result.rows[0];
    return {
      totalTasks: parseInt(stats.total_tasks) || 0,
      totalXP: parseInt(stats.total_xp) || 0,
      totalRWIS: parseInt(stats.total_rwis) || 0,
      averageRating: parseFloat(stats.average_rating) || 0,
      totalTrustScoreChange: parseInt(stats.total_trust_score_change) || 0
    };
  }

  /**
   * Get work history with task details
   */
  static async findByUserWithTaskDetails(userId: string, limit?: number, offset?: number): Promise<(WorkHistoryItem & {
    taskTitle: string;
    taskDescription: string;
    organizationName?: string;
  })[]> {
    let query = `
      SELECT 
        wh.id, wh.user_id, wh.task_id, wh.category, wh.completion_date, wh.quality_score, 
        wh.client_feedback, wh.xp_earned, wh.trust_score_change, wh.rwis_earned, wh.created_at,
        t.title as task_title, t.description as task_description,
        o.name as organization_name
      FROM work_history wh
      JOIN tasks t ON wh.task_id = t.id
      LEFT JOIN organizations o ON t.organization_id = o.id
      WHERE wh.user_id = $1
      ORDER BY wh.created_at DESC
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(offset);
    }

    const result = await pool.query(query, params);
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      taskId: row.task_id,
      category: row.category,
      completionDate: row.completion_date,
      qualityScore: row.quality_score,
      clientFeedback: row.client_feedback,
      xpEarned: row.xp_earned,
      trustScoreChange: row.trust_score_change,
      rwisEarned: row.rwis_earned,
      createdAt: row.created_at,
      taskTitle: row.task_title,
      taskDescription: row.task_description,
      organizationName: row.organization_name
    }));
  }

  /**
   * Update work history entry
   */
  static async update(id: string, updates: {
    completionDate?: Date;
    qualityScore?: number;
    clientFeedback?: string;
  }): Promise<WorkHistoryItem | null> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.completionDate !== undefined) {
      setParts.push(`completion_date = $${paramIndex++}`);
      values.push(updates.completionDate);
    }

    if (updates.qualityScore !== undefined) {
      setParts.push(`quality_score = $${paramIndex++}`);
      values.push(updates.qualityScore);
    }

    if (updates.clientFeedback !== undefined) {
      setParts.push(`client_feedback = $${paramIndex++}`);
      values.push(updates.clientFeedback);
    }

    if (setParts.length === 0) {
      return null; // No updates to make
    }

    values.push(id);
    
    const result = await pool.query(
      `UPDATE work_history 
       SET ${setParts.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING id, user_id, task_id, category, completion_date, quality_score, client_feedback, xp_earned, trust_score_change, rwis_earned, created_at`,
      values
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const history = result.rows[0];
    return {
      id: history.id,
      userId: history.user_id,
      taskId: history.task_id,
      category: history.category,
      completionDate: history.completion_date,
      qualityScore: history.quality_score,
      clientFeedback: history.client_feedback,
      xpEarned: history.xp_earned,
      trustScoreChange: history.trust_score_change,
      rwisEarned: history.rwis_earned,
      createdAt: history.created_at
    };
  }

  /**
   * Delete work history entry
   */
  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM work_history WHERE id = $1', [id]);
  }

  /**
   * Get volunteers/freelancers by organization
   */
  static async getVolunteersByOrganization(organizationId: string, filters?: {
    category?: WorkCategory;
    page?: number;
    limit?: number;
  }): Promise<{
    volunteers: Array<{
      userId: string;
      username: string;
      email: string;
      tasksCompleted: number;
      averageRating: number;
      totalXP: number;
      totalRWIS: number;
      categories: WorkCategory[];
      lastActivity: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id as user_id,
        u.username,
        u.email,
        COUNT(wh.id) as tasks_completed,
        AVG(wh.quality_score) as average_rating,
        SUM(wh.xp_earned) as total_xp,
        SUM(wh.rwis_earned) as total_rwis,
        ARRAY_AGG(DISTINCT wh.category) as categories,
        MAX(wh.created_at) as last_activity
      FROM users u
      JOIN work_history wh ON u.id = wh.user_id
      JOIN tasks t ON wh.task_id = t.id
      WHERE t.organization_id = $1
    `;
    
    const params: any[] = [organizationId];
    let paramIndex = 2;

    if (filters?.category) {
      query += ` AND wh.category = $${paramIndex++}`;
      params.push(filters.category);
    }

    query += `
      GROUP BY u.id, u.username, u.email
      ORDER BY tasks_completed DESC, last_activity DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT u.id)
      FROM users u
      JOIN work_history wh ON u.id = wh.user_id
      JOIN tasks t ON wh.task_id = t.id
      WHERE t.organization_id = $1
    `;
    const countParams: any[] = [organizationId];
    let countParamIndex = 2;

    if (filters?.category) {
      countQuery += ` AND wh.category = $${countParamIndex++}`;
      countParams.push(filters.category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    const volunteers = result.rows.map(row => ({
      userId: row.user_id,
      username: row.username,
      email: row.email,
      tasksCompleted: parseInt(row.tasks_completed),
      averageRating: parseFloat(row.average_rating) || 0,
      totalXP: parseInt(row.total_xp) || 0,
      totalRWIS: parseInt(row.total_rwis) || 0,
      categories: row.categories,
      lastActivity: row.last_activity
    }));

    return {
      volunteers,
      total,
      page,
      limit
    };
  }

  /**
   * Get recent activity for a user
   */
  static async getRecentActivity(userId: string, days: number = 30): Promise<WorkHistoryItem[]> {
    const result = await pool.query(`
      SELECT id, user_id, task_id, category, completion_date, quality_score, client_feedback, xp_earned, trust_score_change, rwis_earned, created_at
      FROM work_history 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
    `, [userId]);
    
    return result.rows.map(history => ({
      id: history.id,
      userId: history.user_id,
      taskId: history.task_id,
      category: history.category,
      completionDate: history.completion_date,
      qualityScore: history.quality_score,
      clientFeedback: history.client_feedback,
      xpEarned: history.xp_earned,
      trustScoreChange: history.trust_score_change,
      rwisEarned: history.rwis_earned,
      createdAt: history.created_at
    }));
  }
}