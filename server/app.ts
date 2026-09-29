import express from 'express';
import apiRouter from './routes/api.ts';
import { requestLogger } from './middleware/logger.ts';
import { errorHandler } from './middleware/errorHandler.ts';

export function createApp() {
  const app = express();

  // Basic CORS & JSON parsers
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestLogger);

  // Health checks for Cloud Run & container orchestration
  app.get(['/healthz', '/_health', '/health'], (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // Mount Backend API
  app.use('/api', apiRouter);

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
