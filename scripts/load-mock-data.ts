import dotenv from 'dotenv';
import { DatabaseConfig } from '../src/config/database';
import { MockBlockchainService } from '../src/services/mock-blockchain.service';
import { MockPriceService } from '../src/services/mock-price.service';
import { RawTransaction, EnrichedTransaction, SupportedChain, SupportedToken } from '../src/models/transaction';
import { MongoClient, ObjectId } from 'mongodb';
import { logger } from '../src/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const MOCK_TRANSACTIONS_COUNT = parseInt(process.env.MOCK_TRANSACTIONS_COUNT || '1000');
const MOCK_DAYS_BACK = parseInt(process.env.MOCK_DAYS_BACK || '7');

async function loadMockData() {
  try {
    logger.info('🎭 Loading mock data...');

    // Generate mock transactions
    const transactions = await generateMockTransactions();
    
    // Save to files
    await saveMockDataToFiles(transactions);
    
    // Load to databases
    await loadToMongoDB(transactions.enriched);
    await loadToClickHouse(transactions.enriched);
    
    logger.info(`✅ Successfully loaded ${transactions.enriched.length} mock transactions`);
    
  } catch (error) {
    logger.error('❌ Failed to load mock data:', error);
    process.exit(1);
  } finally {
    await DatabaseConfig.closeAll();
  }
}

async function generateMockTransactions() {
  logger.info(`📊 Generating ${MOCK_TRANSACTIONS_COUNT} mock transactions...`);
  
  const blockchainService = new MockBlockchainService();
  const priceService = new MockPriceService();
  
  const rawTransactions: RawTransaction[] = [];
  const enrichedTransactions: EnrichedTransaction[] = [];
  
  // TODO: Implement realistic transaction generation
  // This should:
  // 1. Generate transactions with realistic patterns
  // 2. Distribute across different time periods
  // 3. Create realistic chain pair distributions
  // 4. Generate appropriate token distributions
  // 5. Include some failed transactions for testing
  
  for (let i = 0; i < MOCK_TRANSACTIONS_COUNT; i++) {
    const transactionId = generateTransactionHash();
    const rawTx = await blockchainService.getTransaction(transactionId);
    
    // Adjust timestamp to be within the last N days
    const daysBack = Math.random() * MOCK_DAYS_BACK;
    rawTx.timestamp = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
    
    rawTransactions.push(rawTx);
    
    // Enrich the transaction
    try {
      const tokenPrice = await priceService.getTokenPrice(rawTx.token as SupportedToken, rawTx.timestamp);
      const amountUSD = parseFloat(rawTx.amount) * tokenPrice;
      
      const enrichedTx: EnrichedTransaction = {
        ...rawTx,
        amountUSD,
        tokenPrice,
        status: generateRandomStatus(),
        enrichedAt: rawTx.timestamp + Math.random() * 60000, // Within 1 minute
        processingTime: Math.random() * 120000 + 10000, // 10s to 2min
        retryCount: Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0
      };
      
      enrichedTransactions.push(enrichedTx);
    } catch (error) {
      logger.warn(`Failed to enrich transaction ${transactionId}:`, error);
    }
    
    if ((i + 1) % 100 === 0) {
      logger.info(`Generated ${i + 1}/${MOCK_TRANSACTIONS_COUNT} transactions`);
    }
  }
  
  return { raw: rawTransactions, enriched: enrichedTransactions };
}

async function saveMockDataToFiles(transactions: { raw: RawTransaction[], enriched: EnrichedTransaction[] }) {
  logger.info('💾 Saving mock data to files...');
  
  const mockDataDir = path.join(__dirname, '../mock-data');
  
  // Create mock-data directory if it doesn't exist
  if (!fs.existsSync(mockDataDir)) {
    fs.mkdirSync(mockDataDir, { recursive: true });
  }
  
  // Save raw transactions
  fs.writeFileSync(
    path.join(mockDataDir, 'raw-transactions.json'),
    JSON.stringify(transactions.raw, null, 2)
  );
  
  // Save enriched transactions
  fs.writeFileSync(
    path.join(mockDataDir, 'enriched-transactions.json'),
    JSON.stringify(transactions.enriched, null, 2)
  );
  
  // Generate summary statistics
  const stats = generateDataStatistics(transactions.enriched);
  fs.writeFileSync(
    path.join(mockDataDir, 'data-summary.json'),
    JSON.stringify(stats, null, 2)
  );
  
  logger.info('✓ Mock data files saved');
}

async function loadToMongoDB(transactions: EnrichedTransaction[]) {
  logger.info('📄 Loading data to MongoDB...');
  
  const db = await DatabaseConfig.connectMongoDB();
  const collection = db.collection('enrichedTransactions');
  
  // TODO: Implement efficient bulk loading
  // Consider:
  // - Batch insertions for better performance
  // - Handling duplicate transactions
  // - Progress reporting for large datasets
  // - Error handling for individual transaction failures
  
  const batchSize = 100;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const documents = batch.map(tx => ({
      ...tx,
      _id: new ObjectId(),
      hash: tx.hash,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    try {
      await collection.insertMany(documents, { ordered: false });
    } catch (error: any) {
      // Handle duplicate key errors gracefully
      if (error.code !== 11000) {
        throw error;
      }
    }
    
    logger.info(`Loaded ${Math.min(i + batchSize, transactions.length)}/${transactions.length} transactions to MongoDB`);
  }
  
  logger.info('✓ MongoDB data loading completed');
}

async function loadToClickHouse(transactions: EnrichedTransaction[]) {
  logger.info('📊 Loading data to ClickHouse...');
  
  const clickhouse = await DatabaseConfig.connectClickHouse();
  
  // Transform transactions to metrics format
  const metrics = transactions.map(tx => ({
    _id: new ObjectId(),
    hash: tx.hash,
    fromChain: tx.fromChain,
    toChain: tx.toChain,
    token: tx.token,
    amountUSD: tx.amountUSD,
    processingTimeMs: tx.processingTime || 0,
    timestamp: tx.timestamp,
    date: new Date(tx.timestamp).toISOString().split('T')[0],
    hour: new Date(tx.timestamp).getHours()
  }));
  
  // TODO: Implement efficient ClickHouse bulk loading
  // Consider:
  // - Batch insertions with optimal batch sizes
  // - Proper error handling
  // - Progress reporting
  // - Data validation before insertion
  
  const batchSize = 1000;
  for (let i = 0; i < metrics.length; i += batchSize) {
    const batch = metrics.slice(i, i + batchSize);
    
    await clickhouse.insert({
      table: 'transaction_metrics',
      values: batch,
      format: 'JSONEachRow'
    });
    
    logger.info(`Loaded ${Math.min(i + batchSize, metrics.length)}/${metrics.length} metrics to ClickHouse`);
  }
  
  logger.info('✓ ClickHouse data loading completed');
}

function generateTransactionHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateRandomStatus(): 'pending' | 'completed' | 'failed' {
  const rand = Math.random();
  if (rand < 0.85) return 'completed';
  if (rand < 0.95) return 'pending';
  return 'failed';
}

function generateDataStatistics(transactions: EnrichedTransaction[]) {
  const stats = {
    totalTransactions: transactions.length,
    statusDistribution: {
      completed: 0,
      pending: 0,
      failed: 0
    },
    chainDistribution: {} as Record<string, number>,
    tokenDistribution: {} as Record<string, number>,
    totalVolumeUSD: 0,
    avgTransactionSize: 0,
    timeRange: {
      earliest: Math.min(...transactions.map(tx => tx.timestamp)),
      latest: Math.max(...transactions.map(tx => tx.timestamp))
    }
  };
  
  transactions.forEach(tx => {
    stats.statusDistribution[tx.status]++;
    stats.chainDistribution[tx.fromChain] = (stats.chainDistribution[tx.fromChain] || 0) + 1;
    stats.tokenDistribution[tx.token] = (stats.tokenDistribution[tx.token] || 0) + 1;
    stats.totalVolumeUSD += tx.amountUSD;
  });
  
  stats.avgTransactionSize = stats.totalVolumeUSD / transactions.length;
  
  return stats;
}

// Run data loading if called directly
if (require.main === module) {
  loadMockData();
}
