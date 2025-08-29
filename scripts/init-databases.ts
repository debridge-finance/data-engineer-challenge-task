import dotenv from 'dotenv';
import { DatabaseConfig } from '../src/config/database';
import { logger } from '../src/utils/logger';

dotenv.config();

async function initializeDatabases() {
  try {
    logger.info('🔧 Initializing databases...');

    // Initialize MongoDB
    await initializeMongoDB();
    
    // Initialize ClickHouse
    await initializeClickHouse();
    
    logger.info('✅ Database initialization completed successfully');
    
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await DatabaseConfig.closeAll();
  }
}

async function initializeMongoDB() {
  logger.info('📄 Initializing MongoDB...');
  
  const db = await DatabaseConfig.connectMongoDB();
  
  // TODO: Create MongoDB collections and indexes
  // This should:
  // 1. Create rawTransactions collection
  // 2. Create enrichedTransactions collection
  // 3. Create processing logs collection
  // 4. Set up proper indexes for performance
  // 5. Configure TTL indexes for cleanup
  
  // Create collections
  const collections = [
    'rawTransactions',
    'enrichedTransactions',
    'processingLogs',
    'tokenPrices'
  ];
  
  for (const collectionName of collections) {
    try {
      await db.createCollection(collectionName);
      logger.info(`✓ Created collection: ${collectionName}`);
    } catch (error: any) {
      if (error.code === 48) {
        logger.info(`✓ Collection already exists: ${collectionName}`);
      } else {
        throw error;
      }
    }
  }
  
  // Create indexes
  const enrichedTransactions = db.collection('enrichedTransactions');
  
  // TODO: Implement comprehensive indexing strategy
  // Consider indexes for:
  // - Transaction hash (unique)
  // - Status queries
  // - Chain pair queries
  // - Token queries
  // - Timestamp range queries
  // - Compound indexes for common query patterns
  
  await enrichedTransactions.createIndex({ hash: 1 }, { unique: true });
  await enrichedTransactions.createIndex({ status: 1 });
  await enrichedTransactions.createIndex({ fromChain: 1, toChain: 1 });
  await enrichedTransactions.createIndex({ token: 1 });
  await enrichedTransactions.createIndex({ timestamp: -1 });
  await enrichedTransactions.createIndex({ fromChain: 1, toChain: 1, token: 1 });
  
  logger.info('✓ MongoDB indexes created');
}

async function initializeClickHouse() {
  logger.info('📊 Initializing ClickHouse...');
  
  const clickhouse = await DatabaseConfig.connectClickHouse();
  
  // TODO: Create ClickHouse tables and materialized views
  // This should:
  // 1. Create transaction_metrics table
  // 2. Create daily_stats table
  // 3. Create materialized views for common aggregations
  // 4. Set up proper partitioning and TTL
  // 5. Configure compression and optimization
  
  // Create transaction_metrics table
  await clickhouse.command({
    query: `
      CREATE TABLE IF NOT EXISTS transaction_metrics (
        transactionId String,
        fromChain String,
        toChain String,
        token String,
        amountUSD Float64,
        processingTimeMs UInt32,
        timestamp UInt64,
        date Date,
        hour UInt8
      ) ENGINE = MergeTree()
      PARTITION BY date
      ORDER BY (date, hour, fromChain, toChain)
      TTL date + INTERVAL 90 DAY
    `
  });
  
  // Create daily_stats table
  await clickhouse.command({
    query: `
      CREATE TABLE IF NOT EXISTS daily_stats (
        date Date,
        fromChain String,
        toChain String,
        totalVolume Float64,
        transactionCount UInt32,
        avgProcessingTime Float64,
        uniqueTokens UInt32
      ) ENGINE = SummingMergeTree()
      PARTITION BY toYYYYMM(date)
      ORDER BY (date, fromChain, toChain)
      TTL date + INTERVAL 365 DAY
    `
  });
  
  // Create token_volumes materialized view
  await clickhouse.command({
    query: `
      CREATE MATERIALIZED VIEW IF NOT EXISTS token_volumes_mv
      ENGINE = SummingMergeTree()
      PARTITION BY toYYYYMM(date)
      ORDER BY (date, token)
      AS SELECT
        date,
        token,
        sum(amountUSD) as totalVolume,
        count() as transactionCount,
        avg(amountUSD) as avgAmount
      FROM transaction_metrics
      GROUP BY date, token
    `
  });
  
  logger.info('✓ ClickHouse tables and views created');
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabases();
}
