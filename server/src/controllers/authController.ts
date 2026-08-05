import type { Request, Response } from 'express';
import {
  clearRefreshCookie,
  getRefreshTokenFromCookies,
  login,
  logout,
  refresh,
  setRefreshCookie,
} from '../services/authService.js';
import { loginBodySchema } from '../schemas/authSchemas.js';
import { HttpError } from '../utils/httpError.js';

function requestMeta(req: Request): { userAgent?: string; ipAddress?: string } {
  const meta: { userAgent?: string; ipAddress?: string } = {};
  const userAgent = req.get('user-agent');
  if (userAgent) meta.userAgent = userAgent;
  if (req.ip) meta.ipAddress = req.ip;
  return meta;
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const body = loginBodySchema.parse(req.body);
  const result = await login({ ...body, ...requestMeta(req) });
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  res.json({ user: result.user, accessToken: result.accessToken });
}

export async function refreshController(req: Request, res: Response): Promise<void> {
  const token = getRefreshTokenFromCookies(req.cookies);
  if (!token) {
    throw new HttpError(401, 'Refresh token missing');
  }
  const result = await refresh({ token, ...requestMeta(req) });
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  res.json({ user: result.user, accessToken: result.accessToken });
}

export async function logoutController(req: Request, res: Response): Promise<void> {
  const token = getRefreshTokenFromCookies(req.cookies);
  await logout(token);
  clearRefreshCookie(res);
  res.status(204).send();
}

export function meController(req: Request, res: Response): void {
  if (!req.user) {
    throw new HttpError(401, 'Authentication required');
  }
  res.json({ user: req.user });
}
