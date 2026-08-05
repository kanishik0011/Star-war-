import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { HttpError } from '../utils/httpError.js';

export const notFoundHandler = () => {
  throw new HttpError(404, 'Route not found');
};

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const isKnown = error instanceof HttpError;
  const statusCode = isKnown ? error.statusCode : error instanceof ZodError ? 400 : 500;
  const message =
    isKnown || env.NODE_ENV !== 'production' ? (error as Error).message : 'Internal server error';

  if (!isKnown && env.NODE_ENV !== 'test') {
    logger.error({ error }, 'Unhandled request error');
  }

  res.status(statusCode).json({
    message,
    details:
      env.NODE_ENV !== 'production'
        ? isKnown
          ? error.details
          : error instanceof ZodError
            ? error.flatten()
            : undefined
        : undefined,
  });
};
