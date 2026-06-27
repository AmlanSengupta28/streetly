import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { reportsRouter } from './routes/reports.routes.js';
import { uploadsRouter } from './routes/uploads.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/reports', reportsRouter);
  app.use('/api/uploads', uploadsRouter);

  app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
  app.use(errorHandler);

  return app;
}
