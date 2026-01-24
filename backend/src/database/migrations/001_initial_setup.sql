-- Migration: 001_initial_setup
-- Description: Initial database setup with core tables and types
-- Date: 2024-01-17

-- This migration sets up the foundational database structure for the Good Grid platform
-- including users, tasks, zones, dungeons, and gamification elements

-- The schema is defined in ../schema.sql
-- This migration file serves as a record of the initial setup

-- To apply this migration, run the schema.sql file against your PostgreSQL database

-- Example command:
-- psql -U postgres -d good_grid -f src/database/schema.sql

-- Verify migration by checking if core tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';