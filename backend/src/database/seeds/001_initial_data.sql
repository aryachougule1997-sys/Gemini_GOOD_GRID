-- Seed Data for Good Grid Platform
-- This file contains initial data for zones, dungeons, and badges

-- Insert initial zones
INSERT INTO zones (id, name, terrain_type, unlock_requirements, difficulty, coordinates) VALUES
-- Starting zone - always unlocked
('550e8400-e29b-41d4-a716-446655440001', 'Downtown District', 'URBAN', '{"trustScore": 0, "level": 1}', 'BEGINNER', '{"minX": 0, "minY": 0, "maxX": 100, "maxY": 100}'),

-- Level 2 zones (Trust Score 25+)
('550e8400-e29b-41d4-a716-446655440002', 'Community Gardens Area', 'FOREST', '{"trustScore": 25, "level": 2}', 'BEGINNER', '{"minX": 100, "minY": 0, "maxX": 200, "maxY": 100}'),
('550e8400-e29b-41d4-a716-446655440003', 'Tech Valley', 'URBAN', '{"trustScore": 25, "level": 2}', 'INTERMEDIATE', '{"minX": 0, "minY": 100, "maxX": 100, "maxY": 200}'),

-- Level 3 zones (Trust Score 50+)
('550e8400-e29b-41d4-a716-446655440004', 'Mountain Retreat', 'MOUNTAIN', '{"trustScore": 50, "level": 3}', 'INTERMEDIATE', '{"minX": 100, "minY": 100, "maxX": 200, "maxY": 200}'),
('550e8400-e29b-41d4-a716-446655440005', 'Riverside Commons', 'WATER', '{"trustScore": 50, "level": 3}', 'INTERMEDIATE', '{"minX": 200, "minY": 0, "maxX": 300, "maxY": 100}'),

-- Advanced zones (Trust Score 100+)
('550e8400-e29b-41d4-a716-446655440006', 'Corporate Heights', 'URBAN', '{"trustScore": 100, "level": 4}', 'ADVANCED', '{"minX": 200, "minY": 100, "maxX": 300, "maxY": 200}'),
('550e8400-e29b-41d4-a716-446655440007', 'Innovation Desert', 'DESERT', '{"trustScore": 100, "level": 4}', 'ADVANCED', '{"minX": 300, "minY": 0, "maxX": 400, "maxY": 100}'),

-- Expert zones (Trust Score 200+)
('550e8400-e29b-41d4-a716-446655440008', 'Elite Summit', 'MOUNTAIN', '{"trustScore": 200, "level": 5}', 'EXPERT', '{"minX": 300, "minY": 100, "maxX": 400, "maxY": 200}');

-- Insert initial dungeons for each zone
INSERT INTO dungeons (id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features) VALUES
-- Downtown District dungeons
('660e8400-e29b-41d4-a716-446655440001', 'Starter Freelance Tower', 'FREELANCE', '550e8400-e29b-41d4-a716-446655440001', POINT(25, 25), 'freelance_tower_basic.png', '{"trustScore": 0, "level": 1}', '["beginner_friendly", "tutorial_available"]'),
('660e8400-e29b-41d4-a716-446655440002', 'Local Community Center', 'COMMUNITY', '550e8400-e29b-41d4-a716-446655440001', POINT(75, 25), 'community_center_basic.png', '{"trustScore": 0, "level": 1}', '["group_tasks", "mentorship"]'),
('660e8400-e29b-41d4-a716-446655440003', 'Small Business Castle', 'CORPORATE', '550e8400-e29b-41d4-a716-446655440001', POINT(50, 75), 'corporate_castle_small.png', '{"trustScore": 5, "level": 1}', '["structured_tasks", "skill_building"]'),

-- Community Gardens Area dungeons
('660e8400-e29b-41d4-a716-446655440004', 'Environmental Action Hub', 'COMMUNITY', '550e8400-e29b-41d4-a716-446655440002', POINT(150, 50), 'community_garden_env.png', '{"trustScore": 25, "level": 2}', '["environmental_focus", "outdoor_activities"]'),
('660e8400-e29b-41d4-a716-446655440005', 'Green Freelance Pavilion', 'FREELANCE', '550e8400-e29b-41d4-a716-446655440002', POINT(125, 75), 'freelance_pavilion_green.png', '{"trustScore": 20, "level": 2}', '["eco_projects", "sustainability"]'),

-- Tech Valley dungeons
('660e8400-e29b-41d4-a716-446655440006', 'Innovation Freelance Hub', 'FREELANCE', '550e8400-e29b-41d4-a716-446655440003', POINT(50, 150), 'freelance_hub_tech.png', '{"trustScore": 30, "level": 2}', '["tech_focus", "high_pay"]'),
('660e8400-e29b-41d4-a716-446655440007', 'Startup Corporate Campus', 'CORPORATE', '550e8400-e29b-41d4-a716-446655440003', POINT(75, 175), 'corporate_campus_startup.png', '{"trustScore": 35, "level": 2}', '["startup_culture", "equity_opportunities"]'),

-- Mountain Retreat dungeons
('660e8400-e29b-41d4-a716-446655440008', 'Adventure Community Lodge', 'COMMUNITY', '550e8400-e29b-41d4-a716-446655440004', POINT(150, 150), 'community_lodge_mountain.png', '{"trustScore": 50, "level": 3}', '["outdoor_adventures", "team_building"]'),
('660e8400-e29b-41d4-a716-446655440009', 'Remote Work Fortress', 'FREELANCE', '550e8400-e29b-41d4-a716-446655440004', POINT(175, 125), 'freelance_fortress_remote.png', '{"trustScore": 45, "level": 3}', '["remote_work", "flexible_schedule"]'),

-- Riverside Commons dungeons
('660e8400-e29b-41d4-a716-446655440010', 'Waterfront Community Pier', 'COMMUNITY', '550e8400-e29b-41d4-a716-446655440005', POINT(250, 50), 'community_pier_water.png', '{"trustScore": 50, "level": 3}', '["water_conservation", "marine_projects"]'),

-- Corporate Heights dungeons
('660e8400-e29b-41d4-a716-446655440011', 'Executive Corporate Tower', 'CORPORATE', '550e8400-e29b-41d4-a716-446655440006', POINT(250, 150), 'corporate_tower_executive.png', '{"trustScore": 100, "level": 4}', '["leadership_roles", "high_responsibility"]'),
('660e8400-e29b-41d4-a716-446655440012', 'Elite Freelance Spire', 'FREELANCE', '550e8400-e29b-41d4-a716-446655440006', POINT(275, 175), 'freelance_spire_elite.png', '{"trustScore": 90, "level": 4}', '["premium_clients", "expert_level"]'),

-- Innovation Desert dungeons
('660e8400-e29b-41d4-a716-446655440013', 'Research Community Oasis', 'COMMUNITY', '550e8400-e29b-41d4-a716-446655440007', POINT(350, 50), 'community_oasis_research.png', '{"trustScore": 100, "level": 4}', '["research_projects", "innovation"]'),

-- Elite Summit dungeons
('660e8400-e29b-41d4-a716-446655440014', 'Master Freelance Peak', 'FREELANCE', '550e8400-e29b-41d4-a716-446655440008', POINT(350, 150), 'freelance_peak_master.png', '{"trustScore": 200, "level": 5}', '["master_level", "exclusive_clients"]'),
('660e8400-e29b-41d4-a716-446655440015', 'Legendary Corporate Summit', 'CORPORATE', '550e8400-e29b-41d4-a716-446655440008', POINT(375, 175), 'corporate_summit_legendary.png', '{"trustScore": 200, "level": 5}', '["c_level_projects", "board_level"]');

-- Insert initial badges
INSERT INTO badges (id, name, description, category, rarity, icon_url, unlock_criteria) VALUES
-- Skill badges
('770e8400-e29b-41d4-a716-446655440001', 'First Steps', 'Complete your first task', 'ACHIEVEMENT', 'COMMON', 'badge_first_steps.png', '{"tasksCompleted": 1}'),
('770e8400-e29b-41d4-a716-446655440002', 'Helper', 'Complete 5 tasks', 'ACHIEVEMENT', 'COMMON', 'badge_helper.png', '{"tasksCompleted": 5}'),
('770e8400-e29b-41d4-a716-446655440003', 'Contributor', 'Complete 10 tasks', 'ACHIEVEMENT', 'UNCOMMON', 'badge_contributor.png', '{"tasksCompleted": 10}'),
('770e8400-e29b-41d4-a716-446655440004', 'Dedicated', 'Complete 25 tasks', 'ACHIEVEMENT', 'UNCOMMON', 'badge_dedicated.png', '{"tasksCompleted": 25}'),
('770e8400-e29b-41d4-a716-446655440005', 'Champion', 'Complete 50 tasks', 'ACHIEVEMENT', 'RARE', 'badge_champion.png', '{"tasksCompleted": 50}'),

-- Category-specific badges
('770e8400-e29b-41d4-a716-446655440006', 'Freelance Novice', 'Complete 5 freelance tasks', 'CATEGORY', 'COMMON', 'badge_freelance_novice.png', '{"categoryTasks": {"freelance": 5}}'),
('770e8400-e29b-41d4-a716-446655440007', 'Community Volunteer', 'Complete 5 community tasks', 'CATEGORY', 'COMMON', 'badge_community_volunteer.png', '{"categoryTasks": {"community": 5}}'),
('770e8400-e29b-41d4-a716-446655440008', 'Corporate Professional', 'Complete 5 corporate tasks', 'CATEGORY', 'COMMON', 'badge_corporate_professional.png', '{"categoryTasks": {"corporate": 5}}'),

('770e8400-e29b-41d4-a716-446655440009', 'Freelance Expert', 'Complete 20 freelance tasks', 'CATEGORY', 'RARE', 'badge_freelance_expert.png', '{"categoryTasks": {"freelance": 20}}'),
('770e8400-e29b-41d4-a716-446655440010', 'Community Leader', 'Complete 20 community tasks', 'CATEGORY', 'RARE', 'badge_community_leader.png', '{"categoryTasks": {"community": 20}}'),
('770e8400-e29b-41d4-a716-446655440011', 'Corporate Executive', 'Complete 20 corporate tasks', 'CATEGORY', 'RARE', 'badge_corporate_executive.png', '{"categoryTasks": {"corporate": 20}}'),

-- Trust Score badges
('770e8400-e29b-41d4-a716-446655440012', 'Trustworthy', 'Reach Trust Score of 25', 'ACHIEVEMENT', 'UNCOMMON', 'badge_trustworthy.png', '{"trustScore": 25}'),
('770e8400-e29b-41d4-a716-446655440013', 'Reliable', 'Reach Trust Score of 50', 'ACHIEVEMENT', 'UNCOMMON', 'badge_reliable.png', '{"trustScore": 50}'),
('770e8400-e29b-41d4-a716-446655440014', 'Dependable', 'Reach Trust Score of 100', 'ACHIEVEMENT', 'RARE', 'badge_dependable.png', '{"trustScore": 100}'),
('770e8400-e29b-41d4-a716-446655440015', 'Legendary Reputation', 'Reach Trust Score of 200', 'ACHIEVEMENT', 'LEGENDARY', 'badge_legendary_reputation.png', '{"trustScore": 200}'),

-- Skill-specific badges
('770e8400-e29b-41d4-a716-446655440016', 'Web Developer', 'Complete 10 web development tasks', 'SKILL', 'UNCOMMON', 'badge_web_developer.png', '{"skillTasks": {"web_development": 10}}'),
('770e8400-e29b-41d4-a716-446655440017', 'Environmental Champion', 'Complete 10 environmental tasks', 'SKILL', 'UNCOMMON', 'badge_environmental_champion.png', '{"skillTasks": {"environmental": 10}}'),
('770e8400-e29b-41d4-a716-446655440018', 'Mentor', 'Help 5 new users complete their first task', 'SKILL', 'RARE', 'badge_mentor.png', '{"mentorships": 5}'),

-- Special achievement badges
('770e8400-e29b-41d4-a716-446655440019', 'Explorer', 'Discover all dungeons in a zone', 'SPECIAL', 'RARE', 'badge_explorer.png', '{"zonesFullyExplored": 1}'),
('770e8400-e29b-41d4-a716-446655440020', 'Zone Master', 'Unlock all zones', 'SPECIAL', 'EPIC', 'badge_zone_master.png', '{"allZonesUnlocked": true}'),
('770e8400-e29b-41d4-a716-446655440021', 'Triple Threat', 'Reach expert level in all three categories', 'SPECIAL', 'LEGENDARY', 'badge_triple_threat.png', '{"categoryExpertise": {"freelance": true, "community": true, "corporate": true}}');

-- Insert sample organizations
INSERT INTO organizations (id, name, description, verified, contact_email, website) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Green Earth Initiative', 'Environmental conservation and sustainability projects', true, 'contact@greenearthinitiative.org', 'https://greenearthinitiative.org'),
('880e8400-e29b-41d4-a716-446655440002', 'TechForGood Foundation', 'Technology solutions for social impact', true, 'hello@techforgood.org', 'https://techforgood.org'),
('880e8400-e29b-41d4-a716-446655440003', 'Local Community Center', 'Supporting local community development', true, 'info@localcommunitycenter.org', 'https://localcommunitycenter.org'),
('880e8400-e29b-41d4-a716-446655440004', 'StartupHub Inc', 'Connecting startups with talent', true, 'partnerships@startuphub.com', 'https://startuphub.com'),
('880e8400-e29b-41d4-a716-446655440005', 'Education First', 'Educational support and tutoring services', true, 'contact@educationfirst.org', 'https://educationfirst.org');