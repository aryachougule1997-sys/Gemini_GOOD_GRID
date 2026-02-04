import express from 'express';
import { Pool } from 'pg';
import { SocialService } from '../services/socialService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

export function createSocialRoutes(db: Pool) {
  const socialService = new SocialService(db);

  // User Discovery Routes
  router.get('/nearby-users', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const radius = parseInt(req.query.radius as string) || 50;
      
      const nearbyUsers = await socialService.findNearbyUsers(userId, radius);
      res.json(nearbyUsers);
    } catch (error) {
      console.error('Error finding nearby users:', error);
      res.status(500).json({ error: 'Failed to find nearby users' });
    }
  });

  router.get('/zone-users', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      const zoneUsers = await socialService.findUsersInSameZone(userId);
      res.json(zoneUsers);
    } catch (error) {
      console.error('Error finding zone users:', error);
      res.status(500).json({ error: 'Failed to find users in zone' });
    }
  });

  // Team Formation Routes
  router.post('/teams', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { taskId, maxMembers } = req.body;
      
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
      
      const team = await socialService.createTeam(taskId, userId, maxMembers);
      res.status(201).json(team);
    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({ error: 'Failed to create team' });
    }
  });

  router.post('/teams/:teamId/invite', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { teamId } = req.params;
      const { inviteeId } = req.body;
      
      if (!inviteeId) {
        return res.status(400).json({ error: 'Invitee ID is required' });
      }
      
      const invitation = await socialService.inviteToTeam(teamId, userId, inviteeId);
      res.status(201).json(invitation);
    } catch (error) {
      console.error('Error sending team invitation:', error);
      res.status(500).json({ error: 'Failed to send team invitation' });
    }
  });

  router.put('/team-invitations/:invitationId/respond', authenticateToken, async (req, res) => {
    try {
      const { invitationId } = req.params;
      const { response } = req.body;
      
      if (!['accepted', 'declined'].includes(response)) {
        return res.status(400).json({ error: 'Invalid response. Must be "accepted" or "declined"' });
      }
      
      const success = await socialService.respondToTeamInvitation(invitationId, response);
      res.json({ success });
    } catch (error) {
      console.error('Error responding to team invitation:', error);
      res.status(500).json({ error: 'Failed to respond to team invitation' });
    }
  });

  router.get('/teams/:teamId', authenticateToken, async (req, res) => {
    try {
      const { teamId } = req.params;
      
      const team = await socialService.getTeamById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      res.json(team);
    } catch (error) {
      console.error('Error getting team:', error);
      res.status(500).json({ error: 'Failed to get team' });
    }
  });

  // Leaderboard Routes
  router.get('/leaderboard/:type', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { type } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!['trust_score', 'rwis_score', 'xp_points'].includes(type)) {
        return res.status(400).json({ error: 'Invalid leaderboard type' });
      }
      
      const leaderboard = await socialService.getLocalLeaderboard(
        userId, 
        type as 'trust_score' | 'rwis_score' | 'xp_points', 
        limit
      );
      res.json(leaderboard);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({ error: 'Failed to get leaderboard' });
    }
  });

  // Achievement Sharing Routes
  router.post('/achievements/share', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { badgeId, message } = req.body;
      
      if (!badgeId) {
        return res.status(400).json({ error: 'Badge ID is required' });
      }
      
      await socialService.shareAchievement(userId, badgeId, message);
      res.json({ success: true });
    } catch (error) {
      console.error('Error sharing achievement:', error);
      res.status(500).json({ error: 'Failed to share achievement' });
    }
  });

  router.get('/community-feed', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const feed = await socialService.getCommunityFeed(userId, limit);
      res.json(feed);
    } catch (error) {
      console.error('Error getting community feed:', error);
      res.status(500).json({ error: 'Failed to get community feed' });
    }
  });

  // Mentorship Routes
  router.get('/mentors/:category', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { category } = req.params;
      
      if (!['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      
      const mentors = await socialService.findMentors(
        userId, 
        category as 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'
      );
      res.json(mentors);
    } catch (error) {
      console.error('Error finding mentors:', error);
      res.status(500).json({ error: 'Failed to find mentors' });
    }
  });

  router.post('/mentorship/request', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { mentorId, category } = req.body;
      
      if (!mentorId || !category) {
        return res.status(400).json({ error: 'Mentor ID and category are required' });
      }
      
      if (!['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      
      const match = await socialService.requestMentorship(
        userId, 
        mentorId, 
        category as 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'
      );
      res.status(201).json(match);
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      res.status(500).json({ error: 'Failed to request mentorship' });
    }
  });

  // User Preferences Routes
  router.get('/preferences', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      const query = `
        SELECT * FROM user_social_preferences 
        WHERE user_id = $1
      `;
      
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        // Create default preferences
        const defaultPrefs = {
          allow_team_invitations: true,
          allow_mentorship_requests: true,
          allow_friend_requests: true,
          show_in_leaderboards: true,
          activity_visibility: 'zone',
          notification_preferences: {
            achievement_shares: true,
            team_invitations: true,
            mentorship_requests: true
          }
        };
        
        const insertQuery = `
          INSERT INTO user_social_preferences (user_id, allow_team_invitations, allow_mentorship_requests, 
                                             allow_friend_requests, show_in_leaderboards, activity_visibility, 
                                             notification_preferences)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;
        
        const insertResult = await db.query(insertQuery, [
          userId,
          defaultPrefs.allow_team_invitations,
          defaultPrefs.allow_mentorship_requests,
          defaultPrefs.allow_friend_requests,
          defaultPrefs.show_in_leaderboards,
          defaultPrefs.activity_visibility,
          JSON.stringify(defaultPrefs.notification_preferences)
        ]);
        
        res.json(insertResult.rows[0]);
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Error getting social preferences:', error);
      res.status(500).json({ error: 'Failed to get social preferences' });
    }
  });

  router.put('/preferences', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const {
        allow_team_invitations,
        allow_mentorship_requests,
        allow_friend_requests,
        show_in_leaderboards,
        activity_visibility,
        notification_preferences
      } = req.body;
      
      const query = `
        UPDATE user_social_preferences 
        SET allow_team_invitations = COALESCE($2, allow_team_invitations),
            allow_mentorship_requests = COALESCE($3, allow_mentorship_requests),
            allow_friend_requests = COALESCE($4, allow_friend_requests),
            show_in_leaderboards = COALESCE($5, show_in_leaderboards),
            activity_visibility = COALESCE($6, activity_visibility),
            notification_preferences = COALESCE($7, notification_preferences),
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [
        userId,
        allow_team_invitations,
        allow_mentorship_requests,
        allow_friend_requests,
        show_in_leaderboards,
        activity_visibility,
        notification_preferences ? JSON.stringify(notification_preferences) : null
      ]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating social preferences:', error);
      res.status(500).json({ error: 'Failed to update social preferences' });
    }
  });

  // Get user's team invitations
  router.get('/invitations', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      const query = `
        SELECT 
          ti.*,
          t.task_id,
          task.title as task_title,
          task.description as task_description,
          inviter.username as inviter_username,
          inviter.character_data as inviter_character
        FROM team_invitations ti
        JOIN teams t ON ti.team_id = t.id
        JOIN tasks task ON t.task_id = task.id
        JOIN users inviter ON ti.inviter_id = inviter.id
        WHERE ti.invitee_id = $1 
        AND ti.status = 'pending'
        AND ti.expires_at > NOW()
        ORDER BY ti.created_at DESC
      `;
      
      const result = await db.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting team invitations:', error);
      res.status(500).json({ error: 'Failed to get team invitations' });
    }
  });

  return router;
}

export default createSocialRoutes;