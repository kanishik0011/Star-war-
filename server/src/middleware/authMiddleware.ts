import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../services/tokenService.js';
import { HttpError } from '../utils/httpError.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
