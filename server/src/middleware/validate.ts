import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { HttpError } from '../utils/httpError.js';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const payload: unknown = {
      body: req.body as unknown,
      params: req.params as unknown,
      query: req.query as unknown,
    };
    const result = schema.safeParse(payload);
    if (!result.success) {
      next(new HttpError(400, 'Invalid request input', result.error.flatten()));
      return;
    }
    next();
  };
}
