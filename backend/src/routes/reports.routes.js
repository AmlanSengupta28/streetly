import { Router } from 'express';
import {
  postReport,
  getReport,
  listReports,
  getAreaRollup,
  postFlag,
} from '../controllers/reports.controller.js';
import { reportRateLimiter } from '../middleware/rateLimiter.js';

export const reportsRouter = Router();

reportsRouter.get('/', listReports);
reportsRouter.get('/areas/rollup', getAreaRollup);
reportsRouter.get('/:id', getReport);
reportsRouter.post('/', reportRateLimiter, postReport);
reportsRouter.post('/:id/flag', postFlag);
