#!/usr/bin/env node

/**
 * Database Setup Script for Good Grid Platform
 * 
 * This script helps set up the PostgreSQL database for development.
 * It will:
 * 1. Check if PostgreSQL is running
 * 2. Create the database if it doesn't exist
 * 3. Run migrations to set up the schema
 * 4. Run seeds to populate initial data
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPostgreSQL() {
  log('🔍 Checking PostgreSQL installation...', 'blue');
  
  try {
    execSync('psql --version', { stdio: 'pipe' });
    log('✅ PostgreSQL is installed', 'green');
    return true;
  } catch (error) {
    log('❌ PostgreSQL is not installed or not in PATH', 'red');
    log('Please install PostgreSQL and make sure it\'s running:', 'yellow');
    log('  - Windows: Download from https://www.postgresql.org/download/windows/', 'yellow');
    log('  - macOS: brew install postgresql', 'yellow');
    log('  - Linux: sudo apt-get install postgresql postgresql-contrib', 'yellow');
    return false;
  }
}

function checkEnvironmentFile() {
  log('🔍 Checking environment configuration...', 'blue');
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found', 'red');
    log('Please copy .env.example to .env and update the database credentials:', 'yellow');
    log('  cp .env.example .env', 'yellow');
    return false;
  }
  
  log('✅ Environment file found', 'green');
  return true;
}

function createDatabase() {
  log('🏗️  Creating database...', 'blue');
  
  try {
    // Try to create the database (will fail if it already exists, which is fine)
    execSync('psql -U postgres -c "CREATE DATABASE good_grid;"', { stdio: 'pipe' });
    log('✅ Database created successfully', 'green');
  } catch (error) {
    if (error.stderr && error.stderr.toString().includes('already exists')) {
      log('✅ Database already exists', 'green');
    } else {
      log('❌ Failed to create database:', 'red');
      log(error.message, 'red');
      log('Please ensure PostgreSQL is running and you have the correct permissions.', 'yellow');
      log('You may need to update DB_USER and DB_PASSWORD in your .env file.', 'yellow');
      return false;
    }
  }
  
  return true;
}

function runMigrations() {
  log('🚀 Running database migrations...', 'blue');
  
  try {
    execSync('npm run migrate:up', { stdio: 'inherit' });
    log('✅ Migrations completed successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Migration failed:', 'red');
    log('Please check your database connection and credentials.', 'yellow');
    return false;
  }
}

function runSeeds() {
  log('🌱 Running database seeds...', 'blue');
  
  try {
    execSync('npm run migrate:seed', { stdio: 'inherit' });
    log('✅ Seeds completed successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Seeding failed:', 'red');
    log('This is not critical - the database structure is ready.', 'yellow');
    return false;
  }
}

function testConnection() {
  log('🧪 Testing database connection...', 'blue');
  
  try {
    execSync('npm run migrate:status', { stdio: 'inherit' });
    log('✅ Database connection successful', 'green');
    return true;
  } catch (error) {
    log('❌ Database connection failed:', 'red');
    return false;
  }
}

async function main() {
  log('🚀 Good Grid Database Setup', 'cyan');
  log('================================', 'cyan');
  
  // Step 1: Check PostgreSQL
  if (!checkPostgreSQL()) {
    process.exit(1);
  }
  
  // Step 2: Check environment file
  if (!checkEnvironmentFile()) {
    process.exit(1);
  }
  
  // Step 3: Create database
  if (!createDatabase()) {
    process.exit(1);
  }
  
  // Step 4: Run migrations
  if (!runMigrations()) {
    process.exit(1);
  }
  
  // Step 5: Run seeds
  runSeeds(); // Non-critical, continue even if it fails
  
  // Step 6: Test connection
  if (!testConnection()) {
    process.exit(1);
  }
  
  log('', 'reset');
  log('🎉 Database setup completed successfully!', 'green');
  log('', 'reset');
  log('Next steps:', 'cyan');
  log('1. Start the backend server: npm run dev', 'yellow');
  log('2. Test the authentication endpoints', 'yellow');
  log('3. Start the frontend application', 'yellow');
  log('', 'reset');
  log('Available API endpoints:', 'cyan');
  log('  POST /api/auth/register - Register new user', 'yellow');
  log('  POST /api/auth/login    - Login user', 'yellow');
  log('  GET  /api/profile       - Get user profile', 'yellow');
  log('  GET  /health           - Health check', 'yellow');
}

// Run the setup
main().catch(error => {
  log('❌ Setup failed:', 'red');
  console.error(error);
  process.exit(1);
});