import dotenv from 'dotenv';
import { createApp } from './api';
import { DatabaseConfig } from './config/database';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database connections
    logger.info('Connecting to databases...');
    await DatabaseConfig.connectMongoDB();
    await DatabaseConfig.connectClickHouse();
    
    // Create Fastify app
    const app = await createApp();
    
    // Start HTTP server
    await app.listen({ port: Number(PORT), host: '0.0.0.0' });
    logger.info(`🚀 DeBridge ETL API server started on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`📈 API docs: http://localhost:${PORT}/api`);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await DatabaseConfig.closeAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await DatabaseConfig.closeAll();
  process.exit(0);
});

startServer();
