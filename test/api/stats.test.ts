import { FastifyInstance } from 'fastify';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';
import { createApp } from '../../src/api';
import { clearTestData, setupTestDatabase, teardownTestDatabase } from '../setup';
import { DatabaseConfig } from '../../src/config/database';
import { EnrichedTransaction } from '../../src/models/transaction';

describe('Stats API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    await setupTestDatabase();
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  afterEach(async () => {
    await clearTestData();
  });

  const createTestTransaction = (overrides: Partial<EnrichedTransaction> = {}): EnrichedTransaction => ({
    hash: '0x' + Math.random().toString(16).substr(2, 40),
    fromChain: 'ethereum',
    toChain: 'polygon',
    token: 'USDC',
    amount: '1000.000000',
    timestamp: Date.now(),
    blockNumber: 18500000,
    fromAddress: '0xabcd1234',
    toAddress: '0xefgh5678',
    amountUSD: 1000.50,
    tokenPrice: 1.0005,
    status: 'completed',
    enrichedAt: Date.now(),
    processingTime: 45000,
    ...overrides
  });

  describe('GET /api/stats/volume', () => {
    it('should return volume statistics with default parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/stats/volume'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('totalVolume');
      expect(body.data).toHaveProperty('transactionCount');
      expect(body.data).toHaveProperty('avgTransactionSize');
      expect(body.data).toHaveProperty('topTokens');
      expect(body.data).toHaveProperty('chainBreakdown');
      expect(body).toHaveProperty('timestamp');
    });

    it('should accept period parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/stats/volume?period=7d'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should accept chain filters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/stats/volume?from=ethereum&to=polygon'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should reject invalid period parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/stats/volume?period=invalid'
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('period');
    });

    it('should calculate statistics from actual data', async () => {
      // TODO: This test should be implemented by candidates
      // Insert test transactions and verify calculations
      const db = DatabaseConfig.getMongoDb();
      const transactions = [
        createTestTransaction({ amountUSD: 1000, token: 'USDC' }),
        createTestTransaction({ amountUSD: 2000, token: 'USDT' }),
        createTestTransaction({ amountUSD: 1500, token: 'USDC' })
      ];

      await db.collection('enrichedTransactions').insertMany(
        transactions.map(tx => ({ ...tx, _id: new ObjectId() }))
      );

      // Candidates should implement actual ClickHouse queries here
      // and verify the returned statistics match the test data
    });
  });

  describe('GET /api/stats/processing-time', () => {
    it('should return processing time statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/stats/processing-time'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('averageProcessingTime');
      expect(body.data).toHaveProperty('medianProcessingTime');
      expect(body.data).toHaveProperty('p95ProcessingTime');
      expect(body.data).toHaveProperty('p99ProcessingTime');
      expect(body.data).toHaveProperty('chainPairStats');
    });

    it('should calculate percentiles from actual data', async () => {
      // TODO: Candidates should implement this test
      // Insert transactions with various processing times
      // Verify percentile calculations are correct
    });
  });
});
