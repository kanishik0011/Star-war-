import bcrypt from 'bcrypt';
import type { Response } from 'express';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import type { AuthUser } from '../types/auth.js';
import { HttpError } from '../utils/httpError.js';
import {
  createRefreshSession,
  rotateRefreshToken,
  signAccessToken,
  revokeRefreshToken,
} from './tokenService.js';

const refreshCookieName = 'refreshToken';

export function toAuthUser(user: {
  _id: unknown;
  email: string;
  name: string;
  role: string;
}): AuthUser {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: expiresAt,
    path: '/api/auth',
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(refreshCookieName, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth',
  });
}

export function getRefreshTokenFromCookies(cookies: unknown): string | undefined {
  if (!cookies || typeof cookies !== 'object') return undefined;
  const token = (cookies as Record<string, unknown>)[refreshCookieName];
  return typeof token === 'string' ? token : undefined;
}

export async function login(input: {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<{ user: AuthUser; accessToken: string; refreshToken: string; refreshExpiresAt: Date }> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const authUser = toAuthUser(user);
  const sessionInput: { userId: string; userAgent?: string; ipAddress?: string } = {
    userId: authUser.id,
  };
  if (input.userAgent) sessionInput.userAgent = input.userAgent;
  if (input.ipAddress) sessionInput.ipAddress = input.ipAddress;
  const refreshSession = await createRefreshSession(sessionInput);

  return {
    user: authUser,
    accessToken: signAccessToken(authUser),
    refreshToken: refreshSession.token,
    refreshExpiresAt: refreshSession.expiresAt,
  };
}

export async function refresh(input: {
  token: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<{ user: AuthUser; accessToken: string; refreshToken: string; refreshExpiresAt: Date }> {
  const rotated = await rotateRefreshToken(input);
  const user = await User.findById(rotated.userId);
  if (!user) {
    throw new HttpError(401, 'User no longer exists');
  }
  const authUser = toAuthUser(user);

  return {
    user: authUser,
    accessToken: signAccessToken(authUser),
    refreshToken: rotated.refreshToken.token,
    refreshExpiresAt: rotated.refreshToken.expiresAt,
  };
}

export async function logout(token?: string): Promise<void> {
  if (token) {
    await revokeRefreshToken(token);
  }
}
