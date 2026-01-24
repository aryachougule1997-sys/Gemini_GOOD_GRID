import fs from 'fs';
import path from 'path';
import pool from '../config/database';

interface Migration {
  id: string;
  filename: string;
  sql: string;
}

class DatabaseMigrator {
  private migrationsPath: string;
  private seedsPath: string;

  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.seedsPath = path.join(__dirname, 'seeds');
  }

  /**
   * Initialize the migrations table if it doesn't exist
   */
  private async initializeMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Migrations table initialized');
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map(row => row.filename);
  }

  /**
   * Read migration files from the migrations directory
   */
  private readMigrationFiles(): Migration[] {
    if (!fs.existsSync(this.migrationsPath)) {
      console.log('No migrations directory found');
      return [];
    }

    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(filename => {
      const filePath = path.join(this.migrationsPath, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      const id = filename.replace('.sql', '');
      
      return { id, filename, sql };
    });
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(migration: Migration): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute the migration SQL
      await client.query(migration.sql);
      
      // Record the migration as executed
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [migration.filename]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Executed migration: ${migration.filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to execute migration ${migration.filename}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      console.log('🚀 Starting database migrations...');
      
      await this.initializeMigrationsTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const allMigrations = this.readMigrationFiles();
      
      const pendingMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.filename)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migrations`);
      
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Read seed files from the seeds directory
   */
  private readSeedFiles(): Migration[] {
    if (!fs.existsSync(this.seedsPath)) {
      console.log('No seeds directory found');
      return [];
    }

    const files = fs.readdirSync(this.seedsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(filename => {
      const filePath = path.join(this.seedsPath, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      const id = filename.replace('.sql', '');
      
      return { id, filename, sql };
    });
  }

  /**
   * Run seed data (for development/testing)
   */
  async runSeeds(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      
      const seedFiles = this.readSeedFiles();
      
      if (seedFiles.length === 0) {
        console.log('✅ No seed files found');
        return;
      }

      console.log(`📋 Found ${seedFiles.length} seed files`);
      
      for (const seed of seedFiles) {
        const client = await pool.connect();
        
        try {
          await client.query('BEGIN');
          await client.query(seed.sql);
          await client.query('COMMIT');
          console.log(`✅ Executed seed: ${seed.filename}`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`❌ Failed to execute seed ${seed.filename}:`, error);
          // Continue with other seeds even if one fails
        } finally {
          client.release();
        }
      }
      
      console.log('✅ Database seeding completed');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  /**
   * Reset database (drop all tables and re-run migrations)
   * WARNING: This will delete all data!
   */
  async resetDatabase(): Promise<void> {
    try {
      console.log('⚠️  Resetting database (this will delete all data)...');
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Drop all tables
        const dropTablesQuery = `
          DROP SCHEMA public CASCADE;
          CREATE SCHEMA public;
          GRANT ALL ON SCHEMA public TO postgres;
          GRANT ALL ON SCHEMA public TO public;
        `;
        
        await client.query(dropTablesQuery);
        await client.query('COMMIT');
        
        console.log('✅ Database reset completed');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
      // Re-run migrations
      await this.runMigrations();
      
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  /**
   * Check database connection and status
   */
  async checkStatus(): Promise<void> {
    try {
      const client = await pool.connect();
      
      try {
        // Check if migrations table exists
        const migrationsTableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'migrations'
          );
        `);
        
        if (migrationsTableExists.rows[0].exists) {
          const executedMigrations = await this.getExecutedMigrations();
          console.log(`✅ Database connected. ${executedMigrations.length} migrations executed.`);
          
          // List executed migrations
          if (executedMigrations.length > 0) {
            console.log('📋 Executed migrations:');
            executedMigrations.forEach(migration => {
              console.log(`   - ${migration}`);
            });
          }
        } else {
          console.log('⚠️  Database connected but not initialized. Run migrations first.');
        }
        
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
}

export default DatabaseMigrator;