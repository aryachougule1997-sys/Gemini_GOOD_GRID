import pool from '../config/database';
import { User, UserStats, CharacterData, LocationData } from '../../../shared/types';
import bcrypt from 'bcryptjs';

export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: {
    username: string;
    email: string;
    password: string;
    characterData?: CharacterData | any;
    locationData?: LocationData | any;
  }): Promise<User> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      // Ensure characterData and locationData have default values
      const characterData = userData.characterData || {};
      const locationData = userData.locationData || {};
      
      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash, character_data, location_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, character_data, location_data, created_at, updated_at`,
        [
          userData.username,
          userData.email,
          passwordHash,
          JSON.stringify(characterData),
          JSON.stringify(locationData)
        ]
      );
      
      const user = userResult.rows[0];
      
      // Create initial user stats
      await client.query(
        `INSERT INTO user_stats (user_id, trust_score, rwis_score, xp_points, current_level, unlocked_zones)
         VALUES ($1, 0, 0, 0, 1, ARRAY['550e8400-e29b-41d4-a716-446655440001'])`,
        [user.id]
      );
      
      await client.query('COMMIT');
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        characterData: user.character_data,
        locationData: user.location_data,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('UserModel.create error:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, username, email, character_data, location_data, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      characterData: user.character_data,
      locationData: user.location_data,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const result = await pool.query(
      `SELECT id, username, email, password_hash, character_data, location_data, created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.password_hash,
      characterData: user.character_data,
      locationData: user.location_data,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, username, email, character_data, location_data, created_at, updated_at
       FROM users WHERE username = $1`,
      [username]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      characterData: user.character_data,
      locationData: user.location_data,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  /**
   * Update user character data
   */
  static async updateCharacterData(userId: string, characterData: CharacterData): Promise<void> {
    await pool.query(
      `UPDATE users SET character_data = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(characterData), userId]
    );
  }

  /**
   * Update user location data
   */
  static async updateLocationData(userId: string, locationData: LocationData): Promise<void> {
    await pool.query(
      `UPDATE users SET location_data = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(locationData), userId]
    );
  }

  /**
   * Verify user password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get user statistics
   */
  static async getStats(userId: string): Promise<UserStats | null> {
    const result = await pool.query(
      `SELECT user_id, trust_score, rwis_score, xp_points, current_level, unlocked_zones, category_stats
       FROM user_stats WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const stats = result.rows[0];
    return {
      userId: stats.user_id,
      trustScore: stats.trust_score,
      rwisScore: stats.rwis_score,
      xpPoints: stats.xp_points,
      currentLevel: stats.current_level,
      unlockedZones: stats.unlocked_zones,
      categoryStats: stats.category_stats
    };
  }

  /**
   * Update user statistics
   */
  static async updateStats(userId: string, updates: Partial<UserStats>): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.trustScore !== undefined) {
      setParts.push(`trust_score = $${paramIndex++}`);
      values.push(updates.trustScore);
    }

    if (updates.rwisScore !== undefined) {
      setParts.push(`rwis_score = $${paramIndex++}`);
      values.push(updates.rwisScore);
    }

    if (updates.xpPoints !== undefined) {
      setParts.push(`xp_points = $${paramIndex++}`);
      values.push(updates.xpPoints);
    }

    if (updates.currentLevel !== undefined) {
      setParts.push(`current_level = $${paramIndex++}`);
      values.push(updates.currentLevel);
    }

    if (updates.unlockedZones !== undefined) {
      setParts.push(`unlocked_zones = $${paramIndex++}`);
      values.push(updates.unlockedZones);
    }

    if (updates.categoryStats !== undefined) {
      setParts.push(`category_stats = $${paramIndex++}`);
      values.push(JSON.stringify(updates.categoryStats));
    }

    if (setParts.length === 0) {
      return; // No updates to make
    }

    values.push(userId);
    
    await pool.query(
      `UPDATE user_stats SET ${setParts.join(', ')} WHERE user_id = $${paramIndex}`,
      values
    );
  }

  /**
   * Delete user (and all related data due to CASCADE)
   */
  static async delete(userId: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0;
  }

  /**
   * Check if username exists
   */
  static async usernameExists(username: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    );
    return result.rows.length > 0;
  }

  /**
   * Get user statistics (alias for getStats)
   */
  static async getUserStats(userId: string): Promise<UserStats | null> {
    return this.getStats(userId);
  }

  /**
   * Get user profile with stats
   */
  static async getUserProfile(userId: string): Promise<(User & { stats: UserStats }) | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const stats = await this.getStats(userId);
    if (!stats) return null;

    return {
      ...user,
      stats
    };
  }

  /**
   * Get user badges
   */
  static async getUserBadges(userId: string): Promise<Array<{ id: string; name: string; description: string }>> {
    const result = await pool.query(
      `SELECT b.id, b.name, b.description
       FROM user_achievements ua
       JOIN badges b ON ua.badge_id = b.id
       WHERE ua.user_id = $1
       ORDER BY ua.earned_at DESC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description
    }));
  }

  /**
   * Find users with specific skills
   */
  static async findUsersWithSkills(skills: string[]): Promise<User[]> {
    // This is a simplified implementation
    // In a real system, you'd have a more sophisticated skill matching system
    const result = await pool.query(
      `SELECT DISTINCT u.id, u.username, u.email, u.character_data, u.location_data, u.created_at, u.updated_at
       FROM users u
       JOIN work_history wh ON u.id = wh.user_id
       JOIN tasks t ON wh.task_id = t.id
       WHERE t.requirements->'skills' ?| $1
       LIMIT 50`,
      [skills]
    );
    
    return result.rows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      characterData: user.character_data,
      locationData: user.location_data,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  }
}