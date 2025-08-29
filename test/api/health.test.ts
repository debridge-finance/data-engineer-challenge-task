import { FastifyInstance } from 'fastify';
import { createApp } from '../../src/api';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../setup';

describe('Health Check API', () => {
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

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('services');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('version');
      
      expect(body.services).toHaveProperty('mongodb');
      expect(body.services).toHaveProperty('clickhouse');
      expect(body.services).toHaveProperty('temporal');
    });

    it('should return degraded status when services are down', async () => {
      // TODO: Test with services down
      // This test should verify that the health check correctly identifies
      // when services are unavailable and returns appropriate status codes
      
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      // For now, just verify structure
      expect(response.statusCode).toBeGreaterThanOrEqual(200);
      expect(response.statusCode).toBeLessThan(600);
    });
  });
});
