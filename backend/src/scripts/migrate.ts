#!/usr/bin/env ts-node

import DatabaseMigrator from '../database/migrator';

const migrator = new DatabaseMigrator();

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'up':
        await migrator.runMigrations();
        break;
        
      case 'seed':
        await migrator.runSeeds();
        break;
        
      case 'reset':
        await migrator.resetDatabase();
        break;
        
      case 'status':
        await migrator.checkStatus();
        break;
        
      case 'setup':
        // Run migrations and then seeds
        await migrator.runMigrations();
        await migrator.runSeeds();
        break;
        
      default:
        console.log(`
Usage: npm run migrate <command>

Commands:
  up      - Run pending migrations
  seed    - Run seed data
  reset   - Reset database (WARNING: deletes all data)
  status  - Check migration status
  setup   - Run migrations and seeds (for initial setup)

Examples:
  npm run migrate up
  npm run migrate seed
  npm run migrate status
  npm run migrate setup
        `);
        process.exit(1);
    }
    
    console.log('✅ Migration command completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration command failed:', error);
    process.exit(1);
  }
}

main();