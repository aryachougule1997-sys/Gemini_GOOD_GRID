import { Pool, PoolClient } from 'pg';
import pool from '../config/database';

export class DatabaseService {
    private pool: Pool;

    constructor(customPool?: Pool) {
        this.pool = customPool || pool;
    }

    async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    async query(text: string, params?: any[]): Promise<any> {
        const client = await this.getClient();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }

    async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            const result = await this.query('SELECT 1');
            return result.rows.length > 0;
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}