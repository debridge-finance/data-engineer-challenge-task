import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DatabaseConfig } from '../config/database';
import { logger } from '../utils/logger';
import { HealthCheckResponse, ApiResponse } from '../models/api';

export async function createApp(): Promise<FastifyInstance> {
  const app: FastifyInstance = Fastify({
    logger: false // We use winston instead
  });

  // Register plugins
  await app.register(import('@fastify/cors'), {
    origin: true
  });
  
  await app.register(import('@fastify/helmet'));
  
  await app.register(import('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute'
  });

  // Request logging hook
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info(`${request.method} ${request.url}`, {
      query: request.query,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    });
  });

  // Health check endpoint
  app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthCheck: HealthCheckResponse = {
        status: 'healthy',
        services: {
          mongodb: false,
          clickhouse: false,
          temporal: false
        },
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      };

      // TODO: Implement actual health checks
      // This should:
      // 1. Check MongoDB connection
      // 2. Check ClickHouse connection  
      // 3. Check Temporal server connection
      // 4. Verify critical services are responsive
      // 5. Return appropriate HTTP status codes

      try {
        const db = DatabaseConfig.getMongoDb();
        await db.admin().ping();
        healthCheck.services.mongodb = true;
      } catch (error) {
        logger.warn('MongoDB health check failed:', error);
      }

      try {
        const clickhouse = DatabaseConfig.getClickHouseClient();
        await clickhouse.ping();
        healthCheck.services.clickhouse = true;
      } catch (error) {
        logger.warn('ClickHouse health check failed:', error);
      }

      // TODO: Add Temporal health check
      // healthCheck.services.temporal = await checkTemporalHealth();

      const allHealthy = Object.values(healthCheck.services).every(Boolean);
      healthCheck.status = allHealthy ? 'healthy' : 'degraded';

      const statusCode = allHealthy ? 200 : 503;
      return reply.status(statusCode).send(healthCheck);

    } catch (error) {
      logger.error('Health check failed:', error);
      return reply.status(503).send({
        status: 'unhealthy',
        services: { mongodb: false, clickhouse: false, temporal: false },
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      } as HealthCheckResponse);
    }
  });

  // Register route plugins
  await app.register(import('./routes/stats'), { prefix: '/api/stats' });
  await app.register(import('./routes/transactions'), { prefix: '/api/transactions' });
  await app.register(import('./routes/tokens'), { prefix: '/api/tokens' });
  await app.register(import('./routes/chains'), { prefix: '/api/chains' });

  // 404 handler
  app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(404).send({
      success: false,
      error: 'Endpoint not found',
      timestamp: Date.now()
    } as ApiResponse<null>);
  });

  // Error handler
  app.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    logger.error('Unhandled error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
      timestamp: Date.now()
    } as ApiResponse<null>);
  });

  return app;
}

export default createApp;
