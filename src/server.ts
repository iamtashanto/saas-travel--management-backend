import { Server } from 'http';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { logger } from './common/utils/logger';
import { BookingExpirationWorker } from './workers/booking-expiration.worker';

let server: Server;

const startServer = async () => {
  try {
    // Database check can be done implicitly, but we can also explicit connect if needed
    // Prisma connects lazily by default, let's force a connect to fail fast
    await prisma.$connect();
    logger.info('✅ Prisma connected successfully');

    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`📚 Swagger docs available at ${env.APP_URL}/api/docs`);
    });

    // Start background workers
    BookingExpirationWorker.start();
  } catch (error) {
    logger.error(error, '❌ Failed to start server');
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown
const unexpectedErrorHandler = async (error: Error) => {
  logger.error(error, '❌ Unexpected error');
  if (server) {
    server.close(async () => {
      logger.info('Server closed');
      BookingExpirationWorker.stop();
      await prisma.$disconnect();
      redis.disconnect();
      process.exit(1);
    });
  } else {
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(1);
  }
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(async () => {
      logger.info('Server closed');
      await prisma.$disconnect();
      redis.disconnect();
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  if (server) {
    server.close(async () => {
      logger.info('Server closed');
      await prisma.$disconnect();
      redis.disconnect();
      process.exit(0);
    });
  }
});
