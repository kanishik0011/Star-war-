import pino from 'pino';
import { env } from './env.js';

const options: pino.LoggerOptions =
  env.NODE_ENV === 'development'
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }
    : { level: env.NODE_ENV === 'test' ? 'silent' : 'info' };

export const logger = pino(options);
