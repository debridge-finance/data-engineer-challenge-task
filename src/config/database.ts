import { MongoClient, Db } from 'mongodb';
import { createClient, ClickHouseClient } from '@clickhouse/client';
import { logger } from '../utils/logger';

export class DatabaseConfig {
  private static mongoClient: MongoClient;
  private static clickhouseClient: ClickHouseClient;
  private static mongoDb: Db;

  static async connectMongoDB(): Promise<Db> {
    if (this.mongoDb) {
      return this.mongoDb;
    }

    try {
      const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/debridge?authSource=admin';
      this.mongoClient = new MongoClient(uri);
      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db('debridge');
      
      logger.info('Connected to MongoDB successfully');
      return this.mongoDb;
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  static async connectClickHouse(): Promise<ClickHouseClient> {
    if (this.clickhouseClient) {
      return this.clickhouseClient;
    }

    try {
      const host = process.env.CLICKHOUSE_HOST || 'localhost';
      const port = parseInt(process.env.CLICKHOUSE_PORT || '8123');
      
      this.clickhouseClient = createClient({
        host: `http://${host}:${port}`,
        database: 'debridge',
        username: 'default',
        password: '',
      });

      // Test connection
      await this.clickhouseClient.ping();
      logger.info('Connected to ClickHouse successfully');
      return this.clickhouseClient;
    } catch (error) {
      logger.error('Failed to connect to ClickHouse:', error);
      throw error;
    }
  }

  static async closeMongoDB(): Promise<void> {
    if (this.mongoClient) {
      await this.mongoClient.close();
      logger.info('MongoDB connection closed');
    }
  }

  static async closeClickHouse(): Promise<void> {
    if (this.clickhouseClient) {
      await this.clickhouseClient.close();
      logger.info('ClickHouse connection closed');
    }
  }

  static async closeAll(): Promise<void> {
    await Promise.all([
      this.closeMongoDB(),
      this.closeClickHouse()
    ]);
  }

  static getMongoDb(): Db {
    if (!this.mongoDb) {
      throw new Error('MongoDB not connected. Call connectMongoDB() first.');
    }
    return this.mongoDb;
  }

  static getClickHouseClient(): ClickHouseClient {
    if (!this.clickhouseClient) {
      // In test environment, return a mock client
      if (process.env.NODE_ENV === 'test') {
        return {
          query: async () => ({ json: async () => [] }),
          insert: async () => ({ success: true }),
          ping: async () => ({ success: true }),
          close: async () => {},
        } as any;
      }
      throw new Error('ClickHouse not connected. Call connectClickHouse() first.');
    }
    return this.clickhouseClient;
  }
}
