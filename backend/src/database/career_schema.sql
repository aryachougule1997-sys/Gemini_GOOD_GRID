-- Career-related database schema for Good Grid

-- User stats table (if not exists)
CREATE TABLE IF NOT EXISTS user_stats (
    user_id VARCHAR(255) PRIMARY KEY,
    trust_score INTEGER DEFAULT 0,
    rwis_score INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    total_impact INTEGER DEFAULT 0,
    reliability_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User tasks table (if not exists)
CREATE TABLE IF NOT EXISTS user_tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    task_id VARCHAR(255),
    title VARCHAR(500),
    category VARCHAR(100), -- 'freelance', 'community', 'corporate'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    quality_score DECIMAL(3,2) DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    skill VARCHAR(255), -- Primary skill used
    completion_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    proficiency_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
    verified BOOLEAN DEFAULT FALSE,
    verification_source VARCHAR(255), -- 'task_completion', 'peer_review', 'certification'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_name)
);

-- Career preferences table
CREATE TABLE IF NOT EXISTS career_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    preferred_job_types TEXT[], -- ['full-time', 'contract', 'remote']
    preferred_industries TEXT[], -- ['technology', 'non-profit', 'consulting']
    salary_min INTEGER,
    salary_max INTEGER,
    preferred_locations TEXT[], -- ['Remote', 'New York', 'San Francisco']
    work_style VARCHAR(50), -- 'remote', 'hybrid', 'on-site'
    career_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated resumes table
CREATE TABLE IF NOT EXISTS generated_resumes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    template_id VARCHAR(255),
    resume_data JSONB,
    file_paths JSONB, -- {html: 'path', pdf: 'path', docx: 'path'}
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Job applications tracking
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    job_title VARCHAR(500),
    company_name VARCHAR(255),
    job_source VARCHAR(100), -- 'indeed', 'linkedin', 'adzuna'
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'applied', -- 'applied', 'interview', 'rejected', 'offer', 'accepted'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Career insights cache
CREATE TABLE IF NOT EXISTS career_insights (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    insight_type VARCHAR(100), -- 'skill_gap', 'career_path', 'salary_analysis'
    insight_data JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_category ON user_tasks(category);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_career_preferences_user_id ON career_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_resumes_user_id ON generated_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_career_insights_user_id ON career_insights(user_id);

-- Sample data for demo (optional)
INSERT INTO user_stats (user_id, trust_score, rwis_score, total_xp, total_impact, reliability_score) 
VALUES ('demo-user', 87, 145, 2850, 2850, 96)
ON CONFLICT (user_id) DO UPDATE SET
    trust_score = EXCLUDED.trust_score,
    rwis_score = EXCLUDED.rwis_score,
    total_xp = EXCLUDED.total_xp,
    total_impact = EXCLUDED.total_impact,
    reliability_score = EXCLUDED.reliability_score,
    updated_at = CURRENT_TIMESTAMP;

-- Sample tasks for demo
INSERT INTO user_tasks (user_id, task_id, title, category, status, quality_score, xp_earned, skill, completion_date) VALUES
('demo-user', 'task_1', 'Build React Component Library', 'freelance', 'completed', 4.8, 150, 'React', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('demo-user', 'task_2', 'Community Garden Website', 'community', 'completed', 4.9, 120, 'Web Development', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('demo-user', 'task_3', 'Corporate Dashboard Design', 'corporate', 'completed', 4.5, 180, 'UI/UX Design', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('demo-user', 'task_4', 'Mobile App Development', 'freelance', 'completed', 4.7, 200, 'React Native', CURRENT_TIMESTAMP - INTERVAL '20 days'),
('demo-user', 'task_5', 'Non-profit Website Redesign', 'community', 'completed', 4.9, 160, 'Web Design', CURRENT_TIMESTAMP - INTERVAL '25 days')
ON CONFLICT DO NOTHING;

-- Sample skills for demo
INSERT INTO user_skills (user_id, skill_name, proficiency_level, verified, verification_source) VALUES
('demo-user', 'JavaScript', 'advanced', TRUE, 'task_completion'),
('demo-user', 'React', 'advanced', TRUE, 'task_completion'),
('demo-user', 'Node.js', 'intermediate', TRUE, 'task_completion'),
('demo-user', 'TypeScript', 'intermediate', TRUE, 'task_completion'),
('demo-user', 'UI/UX Design', 'intermediate', TRUE, 'task_completion'),
('demo-user', 'Web Development', 'advanced', TRUE, 'task_completion'),
('demo-user', 'Project Management', 'intermediate', TRUE, 'task_completion')
ON CONFLICT (user_id, skill_name) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    verified = EXCLUDED.verified,
    verification_source = EXCLUDED.verification_source,
    updated_at = CURRENT_TIMESTAMP;

-- Sample career preferences
INSERT INTO career_preferences (user_id, preferred_job_types, preferred_industries, salary_min, salary_max, preferred_locations, work_style, career_goals) VALUES
('demo-user', 
 ARRAY['full-time', 'contract', 'remote'], 
 ARRAY['technology', 'non-profit', 'consulting'], 
 70000, 
 130000, 
 ARRAY['Remote', 'San Francisco', 'New York'], 
 'remote',
 'Seeking opportunities to leverage my Good Grid experience in building impactful digital solutions while continuing to grow in full-stack development and community-focused projects.')
ON CONFLICT (user_id) DO UPDATE SET
    preferred_job_types = EXCLUDED.preferred_job_types,
    preferred_industries = EXCLUDED.preferred_industries,
    salary_min = EXCLUDED.salary_min,
    salary_max = EXCLUDED.salary_max,
    preferred_locations = EXCLUDED.preferred_locations,
    work_style = EXCLUDED.work_style,
    career_goals = EXCLUDED.career_goals,
    updated_at = CURRENT_TIMESTAMP;