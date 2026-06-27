import { Router } from 'express';
import { postPresign } from '../controllers/uploads.controller.js';
import { presignRateLimiter } from '../middleware/rateLimiter.js';

export const uploadsRouter = Router();

uploadsRouter.post('/presign', presignRateLimiter, postPresign);
