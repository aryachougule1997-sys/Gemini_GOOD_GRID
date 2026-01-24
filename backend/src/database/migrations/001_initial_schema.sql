-- Migration 001: Initial Schema Setup
-- Good Grid Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE work_category AS ENUM ('FREELANCE', 'COMMUNITY', 'CORPORATE');
CREATE TYPE task_status AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED');
CREATE TYPE terrain_type AS ENUM ('URBAN', 'FOREST', 'MOUNTAIN', 'WATER', 'DESERT');
CREATE TYPE difficulty_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
CREATE TYPE badge_category AS ENUM ('SKILL', 'ACHIEVEMENT', 'CATEGORY', 'SPECIAL');
CREATE TYPE badge_rarity AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    character_data JSONB NOT NULL DEFAULT '{}',
    location_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics table
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0),
    rwis_score INTEGER DEFAULT 0 CHECK (rwis_score >= 0),
    xp_points INTEGER DEFAULT 0 CHECK (xp_points >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    unlocked_zones TEXT[] DEFAULT '{}',
    category_stats JSONB DEFAULT '{"freelance": {"tasksCompleted": 0, "totalXP": 0, "averageRating": 0, "specializations": []}, "community": {"tasksCompleted": 0, "totalXP": 0, "averageRating": 0, "specializations": []}, "corporate": {"tasksCompleted": 0, "totalXP": 0, "averageRating": 0, "specializations": []}}'
);

-- Zones table
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    terrain_type terrain_type NOT NULL,
    unlock_requirements JSONB DEFAULT '{}',
    difficulty difficulty_level NOT NULL,
    coordinates JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dungeons table
CREATE TABLE dungeons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type work_category NOT NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    coordinates POINT NOT NULL,
    sprite_asset VARCHAR(255),
    entry_requirements JSONB DEFAULT '{}',
    special_features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    contact_email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category work_category NOT NULL,
    dungeon_id UUID REFERENCES dungeons(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL, -- Can reference users or organizations
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    requirements JSONB DEFAULT '{}',
    rewards JSONB DEFAULT '{}',
    status task_status DEFAULT 'OPEN',
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task applications table
CREATE TABLE task_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    application_message TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- Work history table
CREATE TABLE work_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    category work_category NOT NULL,
    completion_date TIMESTAMP WITH TIME ZONE,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    client_feedback TEXT,
    xp_earned INTEGER DEFAULT 0,
    trust_score_change INTEGER DEFAULT 0,
    rwis_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category badge_category NOT NULL,
    rarity badge_rarity NOT NULL,
    icon_url VARCHAR(255),
    unlock_criteria JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    UNIQUE(user_id, badge_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_dungeon ON tasks(dungeon_id);
CREATE INDEX idx_work_history_user ON work_history(user_id);
CREATE INDEX idx_work_history_category ON work_history(category);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_dungeons_zone ON dungeons(zone_id);
CREATE INDEX idx_dungeons_type ON dungeons(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();