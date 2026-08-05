import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/star-wars-explorer'),
  JWT_ACCESS_SECRET: z.string().min(24).default('dev-access-secret-change-this-now'),
  JWT_REFRESH_SECRET: z.string().min(24).default('dev-refresh-secret-change-this-now'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  DEMO_USER_EMAIL: z.string().email().default('demo@starwars.dev'),
  DEMO_USER_PASSWORD: z.string().min(8).default('Falcon123!'),
});

export const env = envSchema.parse(process.env);
export type AppEnv = typeof env;
