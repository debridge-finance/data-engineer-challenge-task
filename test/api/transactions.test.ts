import { FastifyInstance } from 'fastify';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';
import { createApp } from '../../src/api';
import { clearTestData, setupTestDatabase, teardownTestDatabase } from '../setup';
import { DatabaseConfig } from '../../src/config/database';
import { EnrichedTransaction } from '../../src/models/transaction';

describe('Transactions API', () => {
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

  describe('GET /api/transactions', () => {
    it('should return paginated transactions with default parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/transactions'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.success).toBe(true);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toHaveProperty('page');
      expect(body.pagination).toHaveProperty('limit');
      expect(body.pagination).toHaveProperty('total');
      expect(body.pagination).toHaveProperty('hasNext');
      expect(body.pagination).toHaveProperty('hasPrev');
    });

    it('should filter by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/transactions?status=completed'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should filter by chain pair', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/transactions?fromChain=ethereum&toChain=polygon'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/transactions?limit=10&offset=20'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.pagination.limit).toBe(10);
    });

    it('should reject invalid status parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/transactions?status=invalid'
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should return actual transaction data when present', async () => {
      throw new Error('TODO: Implement transaction data retrieval tests');
      const db = DatabaseConfig.getMongoDb();
      const testTx = createTestTransaction({
        status: 'completed',
        fromChain: 'ethereum',
        toChain: 'polygon'
      });

      await db.collection('enrichedTransactions').insertOne({
        ...testTx,
        _id: new ObjectId()
      });

      throw new Error('TODO: Implement transaction existence tests');
    });
  });

  describe('GET /api/transactions/:hash', () => {
    it('should return specific transaction by hash', async () => {
      const testHash = '0x1234567890abcdef';
      
      const response = await app.inject({
        method: 'GET',
        url: `/api/transactions/${testHash}`
      });

      // Should return 404 for non-existent transaction
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });

    it('should return transaction when it exists', async () => {
      // TODO: Candidates should implement this test
      const db = DatabaseConfig.getMongoDb();
      const testTx = createTestTransaction();

      await db.collection('enrichedTransactions').insertOne({
        ...testTx,
        _id: new ObjectId()
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/transactions/${testTx.hash}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.hash).toBe(testTx.hash);
    });
  });
});
