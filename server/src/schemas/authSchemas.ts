import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  body: loginBodySchema,
});

export type LoginInput = z.infer<typeof loginBodySchema>;
