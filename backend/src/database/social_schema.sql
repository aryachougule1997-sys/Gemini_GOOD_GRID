-- Social Features Database Schema

-- Teams table for group task collaboration
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_members INTEGER NOT NULL DEFAULT 4,
    status VARCHAR(20) NOT NULL DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'completed', 'disbanded')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMP DEFAULT NOW(),
    contribution_score DECIMAL(3,2) DEFAULT 0.0,
    UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(team_id, invitee_id)
);

-- Achievement sharing table
CREATE TABLE IF NOT EXISTS achievement_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    message TEXT,
    shared_at TIMESTAMP DEFAULT NOW(),
    zone_id UUID REFERENCES zones(id)
);

-- Community notifications table
CREATE TABLE IF NOT EXISTS community_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'achievement_shared', 'team_invitation', 'mentorship_request', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB, -- Additional structured data
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Mentorship matches table
CREATE TABLE IF NOT EXISTS mentorship_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category work_category NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    requested_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    mentee_rating INTEGER CHECK (mentee_rating >= 1 AND mentee_rating <= 5),
    feedback TEXT,
    UNIQUE(mentor_id, mentee_id, category)
);

-- User connections/friendships table
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- Social activity feed table
CREATE TABLE IF NOT EXISTS social_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'task_completed', 'badge_earned', 'level_up', 'team_formed', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data JSONB, -- Additional activity data
    visibility VARCHAR(20) NOT NULL DEFAULT 'zone' CHECK (visibility IN ('private', 'friends', 'zone', 'public')),
    zone_id UUID REFERENCES zones(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences for social features
CREATE TABLE IF NOT EXISTS user_social_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    allow_team_invitations BOOLEAN DEFAULT true,
    allow_mentorship_requests BOOLEAN DEFAULT true,
    allow_friend_requests BOOLEAN DEFAULT true,
    show_in_leaderboards BOOLEAN DEFAULT true,
    activity_visibility VARCHAR(20) DEFAULT 'zone' CHECK (activity_visibility IN ('private', 'friends', 'zone', 'public')),
    notification_preferences JSONB DEFAULT '{"achievement_shares": true, "team_invitations": true, "mentorship_requests": true}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_task_id ON teams(task_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_id ON team_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

CREATE INDEX IF NOT EXISTS idx_achievement_shares_user_id ON achievement_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_shares_shared_at ON achievement_shares(shared_at);
CREATE INDEX IF NOT EXISTS idx_achievement_shares_zone_id ON achievement_shares(zone_id);

CREATE INDEX IF NOT EXISTS idx_community_notifications_recipient_id ON community_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_community_notifications_read_at ON community_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_community_notifications_created_at ON community_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_mentorship_matches_mentor_id ON mentorship_matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_matches_mentee_id ON mentorship_matches(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_matches_category ON mentorship_matches(category);
CREATE INDEX IF NOT EXISTS idx_mentorship_matches_status ON mentorship_matches(status);

CREATE INDEX IF NOT EXISTS idx_user_connections_requester_id ON user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_addressee_id ON user_connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

CREATE INDEX IF NOT EXISTS idx_social_activities_user_id ON social_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_zone_id ON social_activities(zone_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_created_at ON social_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_social_activities_activity_type ON social_activities(activity_type);

-- Add PostGIS extension if not exists (for geographical queries)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location_gist ON users USING GIST (
    ST_GeogFromText('POINT(' || (location_data->>'longitude')::float || ' ' || (location_data->>'latitude')::float || ')')
) WHERE location_data IS NOT NULL;

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_connections_updated_at BEFORE UPDATE ON user_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_social_preferences_updated_at BEFORE UPDATE ON user_social_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire team invitations
CREATE OR REPLACE FUNCTION expire_team_invitations()
RETURNS void AS $$
BEGIN
    UPDATE team_invitations 
    SET status = 'expired' 
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM community_notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    -- Also delete read notifications older than 30 days
    DELETE FROM community_notifications 
    WHERE read_at IS NOT NULL 
    AND read_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;