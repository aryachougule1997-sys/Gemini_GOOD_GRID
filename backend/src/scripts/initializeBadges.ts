#!/usr/bin/env ts-node

/**
 * Script to initialize default badges in the database
 * Run with: npm run init-badges
 */

import { BadgeInitializationService } from '../services/badgeInitializationService';
import pool from '../config/database';

async function initializeBadges() {
  try {
    console.log('🎖️  Initializing default badges...');
    
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Database connection established');
    client.release();
    
    // Initialize badges
    await BadgeInitializationService.initializeDefaultBadges();
    
    console.log('✅ Default badges initialized successfully!');
    console.log('🎉 Badge system is ready to use');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing badges:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeBadges();