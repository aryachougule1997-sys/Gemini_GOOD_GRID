import pool from '../config/database';
import { Organization } from '../../../shared/types';

export class OrganizationModel {
  /**
   * Create a new organization
   */
  static async create(orgData: {
    name: string;
    description?: string;
    contactEmail: string;
    website?: string;
    verified?: boolean;
  }): Promise<Organization> {
    const result = await pool.query(
      `INSERT INTO organizations (name, description, contact_email, website, verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, verified, contact_email, website, created_at`,
      [
        orgData.name,
        orgData.description,
        orgData.contactEmail,
        orgData.website,
        orgData.verified || false
      ]
    );
    
    const org = result.rows[0];
    return {
      id: org.id,
      name: org.name,
      description: org.description,
      verified: org.verified,
      contactEmail: org.contact_email,
      website: org.website,
      createdAt: org.created_at
    };
  }

  /**
   * Find organization by ID
   */
  static async findById(id: string): Promise<Organization | null> {
    const result = await pool.query(
      `SELECT id, name, description, verified, contact_email, website, created_at
       FROM organizations WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const org = result.rows[0];
    return {
      id: org.id,
      name: org.name,
      description: org.description,
      verified: org.verified,
      contactEmail: org.contact_email,
      website: org.website,
      createdAt: org.created_at
    };
  }

  /**
   * Find all organizations
   */
  static async findAll(verified?: boolean): Promise<Organization[]> {
    let query = `
      SELECT id, name, description, verified, contact_email, website, created_at
      FROM organizations
    `;
    const params: any[] = [];
    
    if (verified !== undefined) {
      query += ' WHERE verified = $1';
      params.push(verified);
    }
    
    query += ' ORDER BY verified DESC, name ASC';
    
    const result = await pool.query(query, params);
    
    return result.rows.map(org => ({
      id: org.id,
      name: org.name,
      description: org.description,
      verified: org.verified,
      contactEmail: org.contact_email,
      website: org.website,
      createdAt: org.created_at
    }));
  }

  /**
   * Find organization by email
   */
  static async findByEmail(email: string): Promise<Organization | null> {
    const result = await pool.query(
      `SELECT id, name, description, verified, contact_email, website, created_at
       FROM organizations WHERE contact_email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const org = result.rows[0];
    return {
      id: org.id,
      name: org.name,
      description: org.description,
      verified: org.verified,
      contactEmail: org.contact_email,
      website: org.website,
      createdAt: org.created_at
    };
  }

  /**
   * Update organization verification status
   */
  static async updateVerificationStatus(id: string, verified: boolean): Promise<void> {
    await pool.query(
      'UPDATE organizations SET verified = $1 WHERE id = $2',
      [verified, id]
    );
  }

  /**
   * Update organization details
   */
  static async update(id: string, updates: {
    name?: string;
    description?: string;
    contactEmail?: string;
    website?: string;
  }): Promise<Organization | null> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      setParts.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }

    if (updates.contactEmail !== undefined) {
      setParts.push(`contact_email = $${paramIndex++}`);
      values.push(updates.contactEmail);
    }

    if (updates.website !== undefined) {
      setParts.push(`website = $${paramIndex++}`);
      values.push(updates.website);
    }

    if (setParts.length === 0) {
      return this.findById(id); // No updates to make
    }

    values.push(id);
    
    const result = await pool.query(
      `UPDATE organizations 
       SET ${setParts.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING id, name, description, verified, contact_email, website, created_at`,
      values
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const org = result.rows[0];
    return {
      id: org.id,
      name: org.name,
      description: org.description,
      verified: org.verified,
      contactEmail: org.contact_email,
      website: org.website,
      createdAt: org.created_at
    };
  }

  /**
   * Delete organization
   */
  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM organizations WHERE id = $1', [id]);
  }

  /**
   * Search organizations by name
   */
  static async searchByName(searchTerm: string, verified?: boolean): Promise<Organization[]> {
    let query = `
      SELECT id, name, description, verified, contact_email, website, created_at
      FROM organizations 
      WHERE name ILIKE $1
    `;
    const params: any[] = [`%${searchTerm}%`];
    
    if (verified !== undefined) {
      query += ' AND verified = $2';
      params.push(verified);
    }
    
    query += ' ORDER BY verified DESC, name ASC';
    
    const result = await pool.query(query, params);
    
    return result.rows.map(org => ({
      id: org.id,
      name: org.name,
      description: org.description,
      verified: org.verified,
      contactEmail: org.contact_email,
      website: org.website,
      createdAt: org.created_at
    }));
  }

  /**
   * Get organization statistics
   */
  static async getStats(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    activeVolunteers: number;
    averageRating: number;
  } | null> {
    const result = await pool.query(`
      SELECT 
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_tasks,
        COUNT(DISTINCT wh.user_id) as active_volunteers,
        COALESCE(AVG(wh.quality_score), 0) as average_rating
      FROM organizations o
      LEFT JOIN tasks t ON o.id = t.organization_id
      LEFT JOIN work_history wh ON t.id = wh.task_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const stats = result.rows[0];
    return {
      totalTasks: parseInt(stats.total_tasks),
      completedTasks: parseInt(stats.completed_tasks),
      activeVolunteers: parseInt(stats.active_volunteers),
      averageRating: parseFloat(stats.average_rating)
    };
  }
}