import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let client = null;
let isConnected = false;

// Only attempt Redis connection if explicitly enabled
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

if (REDIS_ENABLED) {
  try {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => {
      console.warn('⚠️ Redis Client Error (Redis disabled):', err.message);
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('✅ Connected to Redis');
      isConnected = true;
    });

    client.on('disconnect', () => {
      console.log('❌ Disconnected from Redis');
      isConnected = false;
    });

    // Attempt connection with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      )
    ]);
  } catch (error) {
    console.warn('⚠️ Redis connection failed, continuing without Redis:', error.message);
    client = null;
    isConnected = false;
  }
} else {
  console.log('ℹ️ Redis is disabled (set REDIS_ENABLED=true to enable)');
}

// Export a safe Redis client wrapper
export default {
  get: async (key) => {
    if (!client || !isConnected) return null;
    try {
      return await client.get(key);
    } catch (error) {
      console.warn('Redis GET error:', error.message);
      return null;
    }
  },
  
  set: async (key, value, options = {}) => {
    if (!client || !isConnected) return false;
    try {
      await client.set(key, value, options);
      return true;
    } catch (error) {
      console.warn('Redis SET error:', error.message);
      return false;
    }
  },
  
  del: async (key) => {
    if (!client || !isConnected) return false;
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.warn('Redis DEL error:', error.message);
      return false;
    }
  },
  
  exists: async (key) => {
    if (!client || !isConnected) return false;
    try {
      return await client.exists(key);
    } catch (error) {
      console.warn('Redis EXISTS error:', error.message);
      return false;
    }
  },
  
  isConnected: () => isConnected,
  
  disconnect: async () => {
    if (client && isConnected) {
      try {
        await client.disconnect();
      } catch (error) {
        console.warn('Redis disconnect error:', error.message);
      }
    }
  }
};