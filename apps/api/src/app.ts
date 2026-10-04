import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { requestId } from './middlewares/request-id';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { rateLimiter } from './middlewares/rate-limiter';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// Rate limiting
app.use(rateLimiter());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (!env.isTest()) {
  app.use(morgan(env.isProduction() ? 'combined' : 'dev'));
}

// Request ID
app.use(requestId);

// Health check (before API prefix)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (req, res) => {
  const checks: Record<string, string> = {};

  try {
    const { getSequelize } = await import('./config/database');
    await getSequelize().authenticate();
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  try {
    const { getRedisClient } = await import('./config/redis');
    await getRedisClient().ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use(routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
