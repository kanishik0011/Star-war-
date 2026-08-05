import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { RefreshSession } from '../models/RefreshSession.js';
import type { AuthUser } from '../types/auth.js';
import { HttpError } from '../utils/httpError.js';

interface RefreshTokenPayload {
  token: string;
  expiresAt: Date;
}

function ttlToMilliseconds(ttl: string): number {
  const match = /^(\d+)([mhd])$/.exec(ttl);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(user: AuthUser): string {
  const options: jwt.SignOptions = {
    expiresIn: env.ACCESS_TOKEN_TTL as Exclude<jwt.SignOptions['expiresIn'], undefined>,
  };
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    env.JWT_ACCESS_SECRET,
    options,
  );
}

export function verifyAccessToken(token: string): AuthUser {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (typeof payload === 'string') {
      throw new HttpError(401, 'Invalid access token');
    }
    const id = typeof payload.sub === 'string' ? payload.sub : null;
    const email = typeof payload.email === 'string' ? payload.email : null;
    const name = typeof payload.name === 'string' ? payload.name : null;
    const role = typeof payload.role === 'string' ? payload.role : 'user';
    if (!id || !email || !name) {
      throw new HttpError(401, 'Invalid access token');
    }
    return {
      id,
      email,
      name,
      role,
    };
  } catch {
    throw new HttpError(401, 'Invalid or expired access token');
  }
}

export function createRawRefreshToken(): RefreshTokenPayload {
  const token = crypto.randomBytes(48).toString('base64url');
  return {
    token,
    expiresAt: new Date(Date.now() + ttlToMilliseconds(env.REFRESH_TOKEN_TTL)),
  };
}

export async function createRefreshSession(input: {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<RefreshTokenPayload> {
  const refreshToken = createRawRefreshToken();
  const session: {
    userId: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  } = {
    userId: new Types.ObjectId(input.userId),
    tokenHash: hashToken(refreshToken.token),
    expiresAt: refreshToken.expiresAt,
  };
  if (input.userAgent) session.userAgent = input.userAgent;
  if (input.ipAddress) session.ipAddress = input.ipAddress;
  await RefreshSession.create(session);
  return refreshToken;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshSession.updateOne(
    { tokenHash: hashToken(token), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

export async function rotateRefreshToken(input: {
  token: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<{ userId: string; refreshToken: RefreshTokenPayload }> {
  const session = await RefreshSession.findOne({
    tokenHash: hashToken(input.token),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw new HttpError(401, 'Invalid or expired refresh token');
  }

  session.revokedAt = new Date();
  await session.save();

  const nextSession: { userId: string; userAgent?: string; ipAddress?: string } = {
    userId: String(session.userId),
  };
  if (input.userAgent) nextSession.userAgent = input.userAgent;
  if (input.ipAddress) nextSession.ipAddress = input.ipAddress;
  const refreshToken = await createRefreshSession(nextSession);

  return { userId: String(session.userId), refreshToken };
}
