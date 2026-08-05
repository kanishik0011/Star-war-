import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginController,
  logoutController,
  meController,
  refreshController,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../schemas/authSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

authRouter.post('/login', authLimiter, validate(loginSchema), asyncHandler(loginController));
authRouter.post('/refresh', authLimiter, asyncHandler(refreshController));
authRouter.post('/logout', asyncHandler(logoutController));
authRouter.get('/me', requireAuth, meController);
