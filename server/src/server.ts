import http from 'node:http';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { createApp } from './app.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'API server listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down API server');
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
}

void bootstrap().catch((error: unknown) => {
  logger.fatal({ error }, 'Failed to start API server');
  process.exit(1);
});
