-- Seed data for dungeons in different zones

-- Insert sample zones first (if not already exists)
INSERT INTO zones (id, name, terrain_type, unlock_requirements, difficulty, coordinates) 
VALUES 
  ('starter-town', 'Starter Town', 'URBAN', '{}', 'BEGINNER', '{"minX": 0, "minY": 0, "maxX": 500, "maxY": 500}'),
  ('forest-grove', 'Forest Grove', 'FOREST', '{"trustScore": 25, "level": 2}', 'INTERMEDIATE', '{"minX": 500, "minY": 0, "maxX": 1000, "maxY": 500}'),
  ('mountain-peaks', 'Mountain Peaks', 'MOUNTAIN', '{"trustScore": 50, "level": 3}', 'ADVANCED', '{"minX": 0, "minY": 500, "maxX": 500, "maxY": 1000}'),
  ('tech-district', 'Tech District', 'URBAN', '{"trustScore": 75, "level": 4}', 'EXPERT', '{"minX": 500, "minY": 500, "maxX": 1000, "maxY": 1000}')
ON CONFLICT (id) DO NOTHING;

-- Insert Freelance Towers
INSERT INTO dungeons (id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features) VALUES
  (
    'freelance-tower-1',
    'Creative Freelance Tower',
    'FREELANCE',
    'starter-town',
    POINT(150, 150),
    'freelance-tower-creative.png',
    '{"trustScore": 10, "level": 1}',
    '["client_meeting_rooms", "portfolio_showcase", "skill_testing_area", "payment_processing"]'
  ),
  (
    'freelance-tower-2',
    'Tech Freelance Hub',
    'FREELANCE',
    'tech-district',
    POINT(750, 750),
    'freelance-tower-tech.png',
    '{"trustScore": 75, "level": 4}',
    '["advanced_dev_tools", "client_meeting_rooms", "portfolio_showcase", "project_management_tools", "payment_processing"]'
  ),
  (
    'freelance-tower-3',
    'Mountain Freelance Retreat',
    'FREELANCE',
    'mountain-peaks',
    POINT(250, 750),
    'freelance-tower-mountain.png',
    '{"trustScore": 50, "level": 3}',
    '["remote_work_setup", "client_meeting_rooms", "skill_testing_area", "payment_processing"]'
  );

-- Insert Community Gardens
INSERT INTO dungeons (id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features) VALUES
  (
    'community-garden-1',
    'Starter Community Garden',
    'COMMUNITY',
    'starter-town',
    POINT(350, 350),
    'community-garden-starter.png',
    '{"trustScore": 0, "level": 1}',
    '["volunteer_coordination", "impact_tracking", "group_collaboration_space", "community_bulletin_board"]'
  ),
  (
    'community-garden-2',
    'Forest Conservation Center',
    'COMMUNITY',
    'forest-grove',
    POINT(750, 250),
    'community-garden-forest.png',
    '{"trustScore": 25, "level": 2}',
    '["environmental_projects", "volunteer_coordination", "impact_tracking", "resource_sharing", "group_collaboration_space"]'
  ),
  (
    'community-garden-3',
    'Urban Community Hub',
    'COMMUNITY',
    'tech-district',
    POINT(650, 650),
    'community-garden-urban.png',
    '{"trustScore": 75, "level": 4}',
    '["tech_for_good", "volunteer_coordination", "impact_tracking", "community_bulletin_board", "resource_sharing"]'
  );

-- Insert Corporate Castles
INSERT INTO dungeons (id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features) VALUES
  (
    'corporate-castle-1',
    'Startup Corporate Castle',
    'CORPORATE',
    'starter-town',
    POINT(100, 400),
    'corporate-castle-startup.png',
    '{"trustScore": 25, "level": 2}',
    '["formal_application_process", "mentorship_programs", "career_progression_tracking"]'
  ),
  (
    'corporate-castle-2',
    'Enterprise Corporate Headquarters',
    'CORPORATE',
    'tech-district',
    POINT(850, 600),
    'corporate-castle-enterprise.png',
    '{"trustScore": 100, "level": 5}',
    '["formal_application_process", "hr_integration", "compliance_checking", "mentorship_programs", "career_progression_tracking", "executive_training"]'
  ),
  (
    'corporate-castle-3',
    'Mountain Research Facility',
    'CORPORATE',
    'mountain-peaks',
    POINT(150, 850),
    'corporate-castle-research.png',
    '{"trustScore": 75, "level": 4}',
    '["research_labs", "formal_application_process", "compliance_checking", "mentorship_programs", "career_progression_tracking"]'
  );

-- Insert some sample tasks for each dungeon
INSERT INTO tasks (id, title, description, category, dungeon_id, creator_id, requirements, rewards, status) VALUES
  -- Freelance Tower Tasks
  (
    'task-freelance-1',
    'Design Logo for Local Bakery',
    'Create a modern, friendly logo for a new local bakery. Must include bread/pastry elements and warm colors.',
    'FREELANCE',
    'freelance-tower-1',
    'system',
    '{"skills": ["graphic-design", "adobe-illustrator"], "trustScoreMin": 10, "timeCommitment": 8, "level": 1}',
    '{"xp": 150, "trustScoreBonus": 5, "rwisPoints": 25, "payment": 300}',
    'OPEN'
  ),
  (
    'task-freelance-2',
    'Build React Component Library',
    'Develop a reusable React component library with TypeScript for a fintech startup.',
    'FREELANCE',
    'freelance-tower-2',
    'system',
    '{"skills": ["react", "typescript", "component-design"], "trustScoreMin": 75, "timeCommitment": 40, "level": 4}',
    '{"xp": 500, "trustScoreBonus": 15, "rwisPoints": 100, "payment": 2500}',
    'OPEN'
  ),
  
  -- Community Garden Tasks
  (
    'task-community-1',
    'Organize Neighborhood Cleanup',
    'Help organize and participate in a community cleanup event in the local park.',
    'COMMUNITY',
    'community-garden-1',
    'system',
    '{"skills": ["organization", "teamwork"], "trustScoreMin": 0, "timeCommitment": 4, "level": 1}',
    '{"xp": 100, "trustScoreBonus": 10, "rwisPoints": 50}',
    'OPEN'
  ),
  (
    'task-community-2',
    'Tree Planting Initiative',
    'Join our forest restoration project by planting native trees and maintaining seedlings.',
    'COMMUNITY',
    'community-garden-2',
    'system',
    '{"skills": ["environmental-work", "physical-labor"], "trustScoreMin": 25, "timeCommitment": 6, "level": 2}',
    '{"xp": 200, "trustScoreBonus": 15, "rwisPoints": 100}',
    'OPEN'
  ),
  
  -- Corporate Castle Tasks
  (
    'task-corporate-1',
    'Junior Developer Internship',
    'Join our development team as a junior developer intern. Learn enterprise software development practices.',
    'CORPORATE',
    'corporate-castle-1',
    'system',
    '{"skills": ["programming", "teamwork"], "trustScoreMin": 25, "timeCommitment": 160, "level": 2}',
    '{"xp": 800, "trustScoreBonus": 25, "rwisPoints": 200, "payment": 1500}',
    'OPEN'
  ),
  (
    'task-corporate-2',
    'Senior Software Architect Position',
    'Lead the architecture design for our next-generation cloud platform. Requires extensive experience.',
    'CORPORATE',
    'corporate-castle-2',
    'system',
    '{"skills": ["software-architecture", "cloud-computing", "leadership"], "trustScoreMin": 100, "timeCommitment": 320, "level": 5}',
    '{"xp": 1500, "trustScoreBonus": 50, "rwisPoints": 500, "payment": 8000}',
    'OPEN'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dungeons_coordinates ON dungeons USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_tasks_dungeon_status ON tasks(dungeon_id, status);