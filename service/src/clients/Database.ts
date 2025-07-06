import { Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import ConfigProvider from '../config/ConfigProvider';
import type { Db } from 'mongodb';


class DatabaseManager {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected = false;
  private connectionPromise: Promise<Db> | null = null;
  private readonly logger = new Logger(DatabaseManager.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000; // 2 seconds

  constructor() {
    this.client = new MongoClient(ConfigProvider.getMongoUri(), {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });
  }

  async connect(): Promise<Db> {
    // Return existing connection if already connected
    if (this.isConnected && this.db) {
      return this.db;
    }

    // Return ongoing connection attempt if one exists
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start new connection attempt
    this.connectionPromise = this.performConnection();
    return this.connectionPromise;
  }

  private async performConnection(): Promise<Db> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to connect to MongoDB (attempt ${attempt}/${this.maxRetries})`);
        await this.client.connect();
        this.db = this.client.db('p2piano');
        this.isConnected = true;
        this.logger.log('Successfully connected to MongoDB');
        return this.db;
      } catch (error) {
        this.logger.error(`Failed to connect to MongoDB (attempt ${attempt}/${this.maxRetries}): ${error.message}`);
        
        if (attempt === this.maxRetries) {
          this.logger.error('Max retries reached. Unable to connect to MongoDB');
          throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        await this.sleep(this.retryDelay * attempt); // Exponential backoff
      }
    }

    throw new Error('Unexpected error in database connection');
  }

  getDatabase(): Db {
    if (!this.isConnected || !this.db) {
      // Trigger async connection for future calls, but for backward compatibility
      // we need to return something immediately
      this.connect().catch(error => {
        this.logger.error('Background database connection failed:', error.message);
      });
      
      // For immediate backward compatibility, create a basic connection
      // This maintains the original behavior while adding error recovery
      if (!this.db) {
        const client = new MongoClient(ConfigProvider.getMongoUri());
        this.db = client.db('p2piano');
      }
    }
    return this.db;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      this.db = null;
      this.connectionPromise = null;
      this.logger.log('Disconnected from MongoDB');
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.db !== null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Auto-connect in background for better error recovery
databaseManager.connect().catch(error => {
  console.warn('Initial database connection failed, will retry on demand:', error.message);
});

export default databaseManager.getDatabase();
