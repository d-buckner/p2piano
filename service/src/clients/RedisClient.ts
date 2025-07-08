import { Logger } from '@nestjs/common';
import { createClient } from 'redis';
import ConfigProvider from '../config/ConfigProvider';
import type { RedisClientType } from 'redis';


class RedisManager {
  private client: RedisClientType;
  private isConnected = false;
  private connectionPromise: Promise<RedisClientType> | null = null;
  private readonly logger = new Logger(RedisManager.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000; // 2 seconds

  constructor() {
    this.client = createClient({
      url: ConfigProvider.getRedisUri(),
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > this.maxRetries) {
            this.logger.error(`Max reconnection attempts (${this.maxRetries}) reached for Redis`);
            return false;
          }
          const delay = Math.min(this.retryDelay * retries, 30000); // Cap at 30 seconds
          this.logger.log(`Reconnecting to Redis in ${delay}ms (attempt ${retries}/${this.maxRetries})`);
          return delay;
        }
      }
    });

    // Set up event listeners
    this.client.on('error', (error) => {
      this.logger.error(`Redis client error: ${error.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      this.logger.warn('Disconnected from Redis');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      this.logger.log('Reconnecting to Redis...');
    });
  }

  async connect(): Promise<RedisClientType> {
    // Return existing connection if already connected
    if (this.isConnected && this.client.isOpen) {
      return this.client;
    }

    // Return ongoing connection attempt if one exists
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start new connection attempt
    this.connectionPromise = this.performConnection();
    return this.connectionPromise;
  }

  private async performConnection(): Promise<RedisClientType> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to connect to Redis (attempt ${attempt}/${this.maxRetries})`);
        await this.client.connect();
        this.isConnected = true;
        this.logger.log('Successfully connected to Redis');
        return this.client;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to connect to Redis (attempt ${attempt}/${this.maxRetries}): ${errorMessage}`);
        
        if (attempt === this.maxRetries) {
          this.logger.error('Max retries reached. Unable to connect to Redis');
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to connect to Redis after ${this.maxRetries} attempts: ${errorMessage}`);
        }
        
        await this.sleep(this.retryDelay * attempt); // Exponential backoff
      }
    }

    throw new Error('Unexpected error in Redis connection');
  }

  getClient(): RedisClientType {
    if (!this.isConnected || !this.client.isOpen) {
      // Trigger async connection for future calls, but for backward compatibility
      // we need to return something immediately
      this.connect().catch(error => {
        this.logger.error('Background Redis connection failed:', error.message);
      });
    }
    return this.client;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected && this.client.isOpen) {
      await this.client.quit();
      this.isConnected = false;
      this.connectionPromise = null;
      this.logger.log('Disconnected from Redis');
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.client.isOpen;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const redisManager = new RedisManager();

// Auto-connect in background for better error recovery
redisManager.connect().catch(error => {
  console.warn('Initial Redis connection failed, will retry on demand:', error.message);
});

export default redisManager.getClient();
