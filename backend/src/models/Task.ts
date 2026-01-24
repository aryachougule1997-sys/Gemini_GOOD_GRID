import pool from '../config/database';
import { Task, TaskApplication, TaskRequirements, TaskRewards, WorkCategory, TaskStatus, ApplicationStatus } from '../../../shared/types';

export class TaskModel {
  /**
   * Create a new task
   */
  static async create(taskData: {
    title: string;
    description: string;
    category: WorkCategory;
    dungeonId?: string | null;
    creatorId: string;
    organizationId?: string | null;
    requirements: TaskRequirements;
    rewards: TaskRewards;
    deadline?: Date | null;
  }): Promise<Task> {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, category, dungeon_id, creator_id, organization_id, requirements, rewards, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, description, category, dungeon_id, creator_id, organization_id, requirements, rewards, status, deadline, created_at, updated_at`,
      [
        taskData.title,
        taskData.description,
        taskData.category,
        taskData.dungeonId,
        taskData.creatorId,
        taskData.organizationId,
        JSON.stringify(taskData.requirements),
        JSON.stringify(taskData.rewards),
        taskData.deadline
      ]
    );
    
    const task = result.rows[0];
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dungeonId: task.dungeon_id,
      creatorId: task.creator_id,
      organizationId: task.organization_id,
      requirements: task.requirements,
      rewards: task.rewards,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  }

  /**
   * Find task by ID
   */
  static async findById(id: string): Promise<Task | null> {
    const result = await pool.query(
      `SELECT id, title, description, category, dungeon_id, creator_id, organization_id, requirements, rewards, status, deadline, created_at, updated_at
       FROM tasks WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const task = result.rows[0];
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dungeonId: task.dungeon_id,
      creatorId: task.creator_id,
      organizationId: task.organization_id,
      requirements: task.requirements,
      rewards: task.rewards,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  }

  /**
   * Find tasks by category
   */
  static async findByCategory(category: WorkCategory, limit: number = 20, offset: number = 0): Promise<Task[]> {
    const result = await pool.query(
      `SELECT id, title, description, category, dungeon_id, creator_id, organization_id, requirements, rewards, status, deadline, created_at, updated_at
       FROM tasks 
       WHERE category = $1 AND status = 'OPEN'
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [category, limit, offset]
    );
    
    return result.rows.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dungeonId: task.dungeon_id,
      creatorId: task.creator_id,
      organizationId: task.organization_id,
      requirements: task.requirements,
      rewards: task.rewards,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
  }

  /**
   * Find tasks by dungeon
   */
  static async findByDungeon(dungeonId: string): Promise<Task[]> {
    const result = await pool.query(
      `SELECT id, title, description, category, dungeon_id, creator_id, organization_id, requirements, rewards, status, deadline, created_at, updated_at
       FROM tasks 
       WHERE dungeon_id = $1 AND status = 'OPEN'
       ORDER BY created_at DESC`,
      [dungeonId]
    );
    
    return result.rows.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dungeonId: task.dungeon_id,
      creatorId: task.creator_id,
      organizationId: task.organization_id,
      requirements: task.requirements,
      rewards: task.rewards,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
  }

  /**
   * Update task status
   */
  static async updateStatus(taskId: string, status: TaskStatus): Promise<void> {
    await pool.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, taskId]
    );
  }

  /**
   * Find tasks by creator
   */
  static async findByCreator(creatorId: string): Promise<Task[]> {
    const result = await pool.query(
      `SELECT id, title, description, category, dungeon_id, creator_id, organization_id, requirements, rewards, status, deadline, created_at, updated_at
       FROM tasks 
       WHERE creator_id = $1
       ORDER BY created_at DESC`,
      [creatorId]
    );
    
    return result.rows.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dungeonId: task.dungeon_id,
      creatorId: task.creator_id,
      organizationId: task.organization_id,
      requirements: task.requirements,
      rewards: task.rewards,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
  }

  /**
   * Search tasks with filters
   */
  static async search(filters: {
    category?: WorkCategory;
    status?: TaskStatus;
    minTrustScore?: number;
    maxTrustScore?: number;
    skills?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Task[]> {
    let query = `
      SELECT id, title, description, category, dungeon_id, creator_id, organization_id, requirements, rewards, status, deadline, created_at, updated_at
      FROM tasks 
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.minTrustScore !== undefined) {
      query += ` AND (requirements->>'trustScoreMin')::int >= $${paramIndex++}`;
      params.push(filters.minTrustScore);
    }

    if (filters.maxTrustScore !== undefined) {
      query += ` AND (requirements->>'trustScoreMin')::int <= $${paramIndex++}`;
      params.push(filters.maxTrustScore);
    }

    if (filters.skills && filters.skills.length > 0) {
      query += ` AND requirements->'skills' ?| $${paramIndex++}`;
      params.push(filters.skills);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    
    return result.rows.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dungeonId: task.dungeon_id,
      creatorId: task.creator_id,
      organizationId: task.organization_id,
      requirements: task.requirements,
      rewards: task.rewards,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
  }

  /**
   * Delete task
   */
  static async delete(taskId: string): Promise<void> {
    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  }
}

export class TaskApplicationModel {
  /**
   * Create a task application
   */
  static async create(applicationData: {
    taskId: string;
    userId: string;
    applicationMessage?: string;
  }): Promise<TaskApplication> {
    const result = await pool.query(
      `INSERT INTO task_applications (task_id, user_id, application_message)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, user_id, application_message, status, applied_at`,
      [applicationData.taskId, applicationData.userId, applicationData.applicationMessage]
    );
    
    const application = result.rows[0];
    return {
      id: application.id,
      taskId: application.task_id,
      userId: application.user_id,
      applicationMessage: application.application_message,
      status: application.status as ApplicationStatus,
      appliedAt: application.applied_at
    };
  }

  /**
   * Find applications by task
   */
  static async findByTask(taskId: string): Promise<TaskApplication[]> {
    const result = await pool.query(
      `SELECT id, task_id, user_id, application_message, status, applied_at
       FROM task_applications 
       WHERE task_id = $1
       ORDER BY applied_at ASC`,
      [taskId]
    );
    
    return result.rows.map(app => ({
      id: app.id,
      taskId: app.task_id,
      userId: app.user_id,
      applicationMessage: app.application_message,
      status: app.status as ApplicationStatus,
      appliedAt: app.applied_at
    }));
  }

  /**
   * Find applications by user
   */
  static async findByUser(userId: string): Promise<TaskApplication[]> {
    const result = await pool.query(
      `SELECT id, task_id, user_id, application_message, status, applied_at
       FROM task_applications 
       WHERE user_id = $1
       ORDER BY applied_at DESC`,
      [userId]
    );
    
    return result.rows.map(app => ({
      id: app.id,
      taskId: app.task_id,
      userId: app.user_id,
      applicationMessage: app.application_message,
      status: app.status as ApplicationStatus,
      appliedAt: app.applied_at
    }));
  }

  /**
   * Update application status
   */
  static async updateStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    await pool.query(
      'UPDATE task_applications SET status = $1 WHERE id = $2',
      [status, applicationId]
    );
  }

  /**
   * Check if user has already applied to task
   */
  static async hasUserApplied(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM task_applications WHERE task_id = $1 AND user_id = $2',
      [taskId, userId]
    );
    return result.rows.length > 0;
  }

  /**
   * Find application by ID
   */
  static async findById(applicationId: string): Promise<TaskApplication | null> {
    const result = await pool.query(
      `SELECT id, task_id, user_id, application_message, status, applied_at
       FROM task_applications 
       WHERE id = $1`,
      [applicationId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }

    const app = result.rows[0];
    return {
      id: app.id,
      taskId: app.task_id,
      userId: app.user_id,
      applicationMessage: app.application_message,
      status: app.status as ApplicationStatus,
      appliedAt: app.applied_at
    };
  }
}