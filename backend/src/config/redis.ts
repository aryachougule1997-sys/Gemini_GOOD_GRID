import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Initialize Redis connection
export const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('🔄 Redis client initialized');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
  }
};

export default redisClient;