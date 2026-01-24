#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * 
 * This script tests the database connection and shows basic information
 * about the Good Grid database setup.
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'good_grid',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  console.log('🧪 Testing Good Grid Database Connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check database info
    console.log('\n2. Database Information:');
    const dbInfo = await client.query('SELECT version(), current_database(), current_user');
    console.log(`   Database: ${dbInfo.rows[0].current_database}`);
    console.log(`   User: ${dbInfo.rows[0].current_user}`);
    console.log(`   Version: ${dbInfo.rows[0].version.split(' ')[0]} ${dbInfo.rows[0].version.split(' ')[1]}`);
    
    // Check if migrations table exists
    console.log('\n3. Checking migration status...');
    const migrationCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);
    
    if (migrationCheck.rows[0].exists) {
      const migrations = await client.query('SELECT filename FROM migrations ORDER BY id');
      console.log(`✅ Migrations table exists (${migrations.rows.length} migrations executed)`);
      migrations.rows.forEach(row => {
        console.log(`   - ${row.filename}`);
      });
    } else {
      console.log('⚠️  Migrations table not found - database not initialized');
    }
    
    // Check core tables
    console.log('\n4. Checking core tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const expectedTables = [
      'users', 'user_stats', 'zones', 'dungeons', 'organizations', 
      'tasks', 'task_applications', 'work_history', 'badges', 'user_achievements'
    ];
    
    const existingTables = tables.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    console.log(`   Found ${existingTables.length} tables:`);
    existingTables.forEach(table => {
      const isCore = expectedTables.includes(table);
      console.log(`   ${isCore ? '✅' : '📋'} ${table}`);
    });
    
    if (missingTables.length > 0) {
      console.log(`\n   ⚠️  Missing core tables: ${missingTables.join(', ')}`);
      console.log('   Run migrations to create missing tables: npm run migrate:up');
    }
    
    // Check sample data
    console.log('\n5. Checking sample data...');
    if (existingTables.includes('zones')) {
      const zoneCount = await client.query('SELECT COUNT(*) FROM zones');
      console.log(`   Zones: ${zoneCount.rows[0].count}`);
    }
    
    if (existingTables.includes('dungeons')) {
      const dungeonCount = await client.query('SELECT COUNT(*) FROM dungeons');
      console.log(`   Dungeons: ${dungeonCount.rows[0].count}`);
    }
    
    if (existingTables.includes('badges')) {
      const badgeCount = await client.query('SELECT COUNT(*) FROM badges');
      console.log(`   Badges: ${badgeCount.rows[0].count}`);
    }
    
    if (existingTables.includes('users')) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`   Users: ${userCount.rows[0].count}`);
    }
    
    client.release();
    
    console.log('\n🎉 Database connection test completed successfully!');
    
    if (missingTables.length === 0 && migrationCheck.rows[0].exists) {
      console.log('\n✅ Database is ready for the Good Grid authentication system!');
      console.log('\nNext steps:');
      console.log('1. Start the server: npm run dev');
      console.log('2. Test registration: POST /api/auth/register');
      console.log('3. Test login: POST /api/auth/login');
    } else {
      console.log('\n⚠️  Database setup incomplete. Run: npm run migrate:setup');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your .env file database credentials');
    console.log('3. Ensure the database exists: createdb good_grid');
    console.log('4. Check if you can connect manually: psql -U postgres -d good_grid');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();