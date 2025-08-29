import dotenv from 'dotenv';
import { Worker } from '@temporalio/worker';
import { DatabaseConfig } from './config/database';
import { logger } from './utils/logger';
import * as activities from './activities';

// Load environment variables
dotenv.config();

async function startWorker() {
  try {
    // Initialize database connections
    logger.info('Worker: Connecting to databases...');
    await DatabaseConfig.connectMongoDB();
    await DatabaseConfig.connectClickHouse();

    // TODO: Configure Temporal worker
    // This worker should:
    // 1. Connect to Temporal server
    // 2. Register workflows and activities
    // 3. Set up proper task queues
    // 4. Configure retry policies
    // 5. Handle graceful shutdown

    const worker = await Worker.create({
      workflowsPath: require.resolve('./workflows'),
      activities,
      taskQueue: 'debridge-etl-queue',
      // TODO: Add worker configuration
      // Consider:
      // - maxConcurrentActivityTaskExecutions
      // - maxConcurrentWorkflowTaskExecutions
      // - Identity for worker identification
      // - Interceptors for monitoring
      // - Data converter for custom serialization
    });

    logger.info('🔄 Temporal worker starting...');
    await worker.run();

  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Worker: SIGTERM received, shutting down gracefully...');
  await DatabaseConfig.closeAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Worker: SIGINT received, shutting down gracefully...');
  await DatabaseConfig.closeAll();
  process.exit(0);
});

startWorker();
