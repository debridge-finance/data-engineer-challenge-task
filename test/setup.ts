import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseConfig } from '../src/config/database';

let mongoServer: MongoMemoryServer;

export async function setupTestDatabase() {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27018, // Use different port to avoid conflicts
    },
  });
  
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  
  // Initialize database connections
  await DatabaseConfig.connectMongoDB();
  
  // Mock ClickHouse for tests since we don't need real ClickHouse in unit tests
  process.env.CLICKHOUSE_HOST = 'localhost';
  process.env.CLICKHOUSE_PORT = '8123';
  
  process.env.NODE_ENV = 'test';
  
  // Connect to test databases
  await DatabaseConfig.connectMongoDB();
  
  // Initialize test collections
  const db = DatabaseConfig.getMongoDb();
  await db.collection('enrichedTransactions').createIndex({ hash: 1 }, { unique: true });
  await db.collection('enrichedTransactions').createIndex({ status: 1 });
  await db.collection('enrichedTransactions').createIndex({ fromChain: 1, toChain: 1 });
}

export async function teardownTestDatabase() {
  await DatabaseConfig.closeAll();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function clearTestData() {
  // Clear test data from in-memory MongoDB
  const db = DatabaseConfig.getMongoDb();
  
  if (db) {
    await db.collection('rawTransactions').deleteMany({});
    await db.collection('enrichedTransactions').deleteMany({});
  }
}
