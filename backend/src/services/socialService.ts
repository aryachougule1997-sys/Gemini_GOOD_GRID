import { Pool } from 'pg';
import { User } from '../models/User';
import { Badge } from '../models/Badge';

export interface NearbyUser {
  id: string;
  username: string;
  character_data: any;
  trust_score: number;
  rwis_score: number;
  xp_points: number;
  current_level: number;
  badges: Badge[];
  distance_km?: number;
  zone_id?: string;
}

export interface TeamInvitation {
  id: string;
  task_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: Date;
  expires_at: Date;
}

export interface Team {
  id: string;
  task_id: string;
  leader_id: string;
  members: TeamMember[];
  max_members: number;
  status: 'forming' | 'active' | 'completed';
  created_at: Date;
}

export interface TeamMember {
  user_id: string;
  username: string;
  role: 'leader' | 'member';
  joined_at: Date;
  contribution_score?: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  character_data: any;
  score: number;
  rank: number;
  badges_count: number;
  recent_achievements: Badge[];
}

export interface MentorshipMatch {
  mentor_id: string;
  mentee_id: string;
  category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
  status: 'pending' | 'active' | 'completed';
  created_at: Date;
}

export class SocialService {
  constructor(private db: Pool) {}

  // User Discovery
  async findNearbyUsers(userId: string, radiusKm: number = 50): Promise<NearbyUser[]> {
    const query = `
      SELECT 
        u.id, u.username, u.character_data,
        us.trust_score, us.rwis_score, us.xp_points, us.current_level,
        u.location_data,
        COALESCE(
          ST_Distance(
            ST_GeogFromText('POINT(' || (u.location_data->>'longitude')::float || ' ' || (u.location_data->>'latitude')::float || ')'),
            ST_GeogFromText('POINT(' || (current_user.location_data->>'longitude')::float || ' ' || (current_user.location_data->>'latitude')::float || ')')
          ) / 1000, 0
        ) as distance_km
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      CROSS JOIN (SELECT location_data FROM users WHERE id = $1) current_user
      WHERE u.id != $1
        AND u.location_data IS NOT NULL
        AND ST_DWithin(
          ST_GeogFromText('POINT(' || (u.location_data->>'longitude')::float || ' ' || (u.location_data->>'latitude')::float || ')'),
          ST_GeogFromText('POINT(' || (current_user.location_data->>'longitude')::float || ' ' || (current_user.location_data->>'latitude')::float || ')'),
          $2 * 1000
        )
      ORDER BY distance_km ASC
      LIMIT 20
    `;

    const result = await this.db.query(query, [userId, radiusKm]);
    
    // Get badges for each user
    const usersWithBadges = await Promise.all(
      result.rows.map(async (user) => {
        const badges = await this.getUserBadges(user.id);
        return {
          ...user,
          badges
        };
      })
    );

    return usersWithBadges;
  }

  async findUsersInSameZone(userId: string): Promise<NearbyUser[]> {
    const query = `
      SELECT 
        u.id, u.username, u.character_data,
        us.trust_score, us.rwis_score, us.xp_points, us.current_level,
        up.current_zone_id as zone_id
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      JOIN user_progress up ON u.id = up.user_id
      WHERE up.current_zone_id = (
        SELECT current_zone_id FROM user_progress WHERE user_id = $1
      )
      AND u.id != $1
      ORDER BY us.trust_score DESC, us.rwis_score DESC
      LIMIT 15
    `;

    const result = await this.db.query(query, [userId]);
    
    const usersWithBadges = await Promise.all(
      result.rows.map(async (user) => {
        const badges = await this.getUserBadges(user.id);
        return {
          ...user,
          badges
        };
      })
    );

    return usersWithBadges;
  }

  // Team Formation
  async createTeam(taskId: string, leaderId: string, maxMembers: number = 4): Promise<Team> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create team
      const teamResult = await client.query(
        `INSERT INTO teams (task_id, leader_id, max_members, status)
         VALUES ($1, $2, $3, 'forming')
         RETURNING *`,
        [taskId, leaderId, maxMembers]
      );
      
      const team = teamResult.rows[0];
      
      // Add leader as first member
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role, joined_at)
         VALUES ($1, $2, 'leader', NOW())`,
        [team.id, leaderId]
      );
      
      await client.query('COMMIT');
      
      return await this.getTeamById(team.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async inviteToTeam(teamId: string, inviterId: string, inviteeId: string): Promise<TeamInvitation> {
    const query = `
      INSERT INTO team_invitations (team_id, inviter_id, invitee_id, status, expires_at)
      VALUES ($1, $2, $3, 'pending', NOW() + INTERVAL '7 days')
      RETURNING *
    `;
    
    const result = await this.db.query(query, [teamId, inviterId, inviteeId]);
    return result.rows[0];
  }

  async respondToTeamInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<boolean> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update invitation status
      const invitationResult = await client.query(
        `UPDATE team_invitations 
         SET status = $1, responded_at = NOW()
         WHERE id = $2 AND status = 'pending'
         RETURNING *`,
        [response, invitationId]
      );
      
      if (invitationResult.rows.length === 0) {
        throw new Error('Invitation not found or already responded');
      }
      
      const invitation = invitationResult.rows[0];
      
      if (response === 'accepted') {
        // Check if team has space
        const teamCheck = await client.query(
          `SELECT t.max_members, COUNT(tm.user_id) as current_members
           FROM teams t
           LEFT JOIN team_members tm ON t.id = tm.team_id
           WHERE t.id = $1
           GROUP BY t.id, t.max_members`,
          [invitation.team_id]
        );
        
        if (teamCheck.rows[0].current_members >= teamCheck.rows[0].max_members) {
          throw new Error('Team is full');
        }
        
        // Add user to team
        await client.query(
          `INSERT INTO team_members (team_id, user_id, role, joined_at)
           VALUES ($1, $2, 'member', NOW())`,
          [invitation.team_id, invitation.invitee_id]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTeamById(teamId: string): Promise<Team> {
    const teamQuery = `
      SELECT t.*, 
             json_agg(
               json_build_object(
                 'user_id', tm.user_id,
                 'username', u.username,
                 'role', tm.role,
                 'joined_at', tm.joined_at,
                 'contribution_score', tm.contribution_score
               )
             ) as members
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN users u ON tm.user_id = u.id
      WHERE t.id = $1
      GROUP BY t.id
    `;
    
    const result = await this.db.query(teamQuery, [teamId]);
    return result.rows[0];
  }

  // Leaderboards
  async getLocalLeaderboard(
    userId: string, 
    type: 'trust_score' | 'rwis_score' | 'xp_points',
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    const scoreColumn = type;
    
    const query = `
      WITH user_zone AS (
        SELECT current_zone_id FROM user_progress WHERE user_id = $1
      ),
      ranked_users AS (
        SELECT 
          u.id as user_id, u.username, u.character_data,
          us.${scoreColumn} as score,
          ROW_NUMBER() OVER (ORDER BY us.${scoreColumn} DESC) as rank,
          COUNT(ua.id) as badges_count
        FROM users u
        JOIN user_stats us ON u.id = us.user_id
        JOIN user_progress up ON u.id = up.user_id
        LEFT JOIN user_achievements ua ON u.id = ua.user_id
        CROSS JOIN user_zone uz
        WHERE up.current_zone_id = uz.current_zone_id
        GROUP BY u.id, u.username, u.character_data, us.${scoreColumn}
        ORDER BY us.${scoreColumn} DESC
        LIMIT $2
      )
      SELECT * FROM ranked_users
    `;
    
    const result = await this.db.query(query, [userId, limit]);
    
    // Get recent achievements for each user
    const leaderboardWithAchievements = await Promise.all(
      result.rows.map(async (entry) => {
        const recentAchievements = await this.getRecentAchievements(entry.user_id, 3);
        return {
          ...entry,
          recent_achievements: recentAchievements
        };
      })
    );
    
    return leaderboardWithAchievements;
  }

  // Achievement Sharing
  async shareAchievement(userId: string, badgeId: string, message?: string): Promise<void> {
    const query = `
      INSERT INTO achievement_shares (user_id, badge_id, message, shared_at)
      VALUES ($1, $2, $3, NOW())
    `;
    
    await this.db.query(query, [userId, badgeId, message]);
    
    // Notify nearby users
    await this.notifyNearbyUsers(userId, 'achievement_shared', {
      badge_id: badgeId,
      message
    });
  }

  async getCommunityFeed(userId: string, limit: number = 20): Promise<any[]> {
    const query = `
      SELECT 
        'achievement' as type,
        ash.id,
        ash.user_id,
        u.username,
        u.character_data,
        ash.badge_id,
        b.name as badge_name,
        b.description as badge_description,
        b.icon_url as badge_icon,
        ash.message,
        ash.shared_at as created_at
      FROM achievement_shares ash
      JOIN users u ON ash.user_id = u.id
      JOIN badges b ON ash.badge_id = b.id
      JOIN user_progress up ON u.id = up.user_id
      WHERE up.current_zone_id = (
        SELECT current_zone_id FROM user_progress WHERE user_id = $1
      )
      AND ash.shared_at > NOW() - INTERVAL '7 days'
      ORDER BY ash.shared_at DESC
      LIMIT $2
    `;
    
    const result = await this.db.query(query, [userId, limit]);
    return result.rows;
  }

  // Mentorship System
  async findMentors(
    userId: string, 
    category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'
  ): Promise<NearbyUser[]> {
    const query = `
      SELECT DISTINCT
        u.id, u.username, u.character_data,
        us.trust_score, us.rwis_score, us.xp_points, us.current_level,
        COUNT(wh.id) as experience_count,
        AVG(wh.quality_score) as avg_quality
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      JOIN work_history wh ON u.id = wh.user_id
      JOIN user_progress up ON u.id = up.user_id
      WHERE wh.category = $2
        AND us.current_level >= (
          SELECT current_level + 2 FROM user_stats WHERE user_id = $1
        )
        AND up.current_zone_id = (
          SELECT current_zone_id FROM user_progress WHERE user_id = $1
        )
        AND u.id != $1
      GROUP BY u.id, u.username, u.character_data, us.trust_score, us.rwis_score, us.xp_points, us.current_level
      HAVING COUNT(wh.id) >= 5 AND AVG(wh.quality_score) >= 4.0
      ORDER BY us.current_level DESC, AVG(wh.quality_score) DESC
      LIMIT 10
    `;
    
    const result = await this.db.query(query, [userId, category]);
    
    const mentorsWithBadges = await Promise.all(
      result.rows.map(async (mentor) => {
        const badges = await this.getUserBadges(mentor.id);
        return {
          ...mentor,
          badges
        };
      })
    );
    
    return mentorsWithBadges;
  }

  async requestMentorship(
    menteeId: string, 
    mentorId: string, 
    category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'
  ): Promise<MentorshipMatch> {
    const query = `
      INSERT INTO mentorship_matches (mentor_id, mentee_id, category, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    
    const result = await this.db.query(query, [mentorId, menteeId, category]);
    return result.rows[0];
  }

  // Helper methods
  private async getUserBadges(userId: string): Promise<Badge[]> {
    const query = `
      SELECT b.* 
      FROM badges b
      JOIN user_achievements ua ON b.id = ua.badge_id
      WHERE ua.user_id = $1
      ORDER BY ua.earned_at DESC
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  private async getRecentAchievements(userId: string, limit: number): Promise<Badge[]> {
    const query = `
      SELECT b.* 
      FROM badges b
      JOIN user_achievements ua ON b.id = ua.badge_id
      WHERE ua.user_id = $1
      ORDER BY ua.earned_at DESC
      LIMIT $2
    `;
    
    const result = await this.db.query(query, [userId, limit]);
    return result.rows;
  }

  private async notifyNearbyUsers(userId: string, type: string, data: any): Promise<void> {
    // This would integrate with the notification service
    // For now, we'll just log it
    console.log(`Notifying nearby users of ${type} from user ${userId}:`, data);
  }
}