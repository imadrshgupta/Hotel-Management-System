import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase, getSequelize } from './config/database';
import { initializeModels } from './database/sequelize';
import { getRedisClient, closeRedis } from './config/redis';
import { initWebSocket } from './config/websocket';
import { initStorage } from './config/storage';
import { logger } from './config/logger';

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected');

    // Initialize models
    initializeModels();
    logger.info('Models initialized');

    // Sync models (create tables if not exist - only in development)
    if (env.isDevelopment()) {
      await getSequelize().sync({ alter: false });
      logger.info('Database synced');
    }

    // Initialize Redis
    getRedisClient();
    logger.info('Redis connected');

    // Initialize storage
    await initStorage();
    logger.info('Storage initialized');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket
    initWebSocket(server);
    logger.info('WebSocket initialized');

    // Start server
    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`API available at http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`Health check at http://localhost:${env.PORT}/health`);
      logger.info(`WebSocket at ws://localhost:${env.PORT}/ws`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        await closeRedis();
        const { closeDatabase } = await import('./config/database');
        await closeDatabase();
        logger.info('Shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
