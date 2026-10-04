import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '3000'), 10),
  API_PREFIX: optionalEnv('API_PREFIX', '/api/v1'),

  DB: {
    HOST: requiredEnv('DB_HOST'),
    PORT: parseInt(optionalEnv('DB_PORT', '5432'), 10),
    NAME: requiredEnv('DB_NAME'),
    USER: requiredEnv('DB_USER'),
    PASSWORD: requiredEnv('DB_PASSWORD'),
    SSL: optionalEnv('DB_SSL', 'false') === 'true',
  },

  REDIS: {
    HOST: optionalEnv('REDIS_HOST', 'localhost'),
    PORT: parseInt(optionalEnv('REDIS_PORT', '6379'), 10),
    PASSWORD: optionalEnv('REDIS_PASSWORD', ''),
  },

  JWT: {
    SECRET: requiredEnv('JWT_SECRET'),
    EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '15m'),
    REFRESH_SECRET: requiredEnv('JWT_REFRESH_SECRET'),
    REFRESH_EXPIRES_IN: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  STORAGE: {
    ENDPOINT: optionalEnv('STORAGE_ENDPOINT', 'http://localhost:9000'),
    BUCKET: optionalEnv('STORAGE_BUCKET', 'hms-files'),
    ACCESS_KEY: optionalEnv('STORAGE_ACCESS_KEY', 'minioadmin'),
    SECRET_KEY: optionalEnv('STORAGE_SECRET_KEY', 'minioadmin'),
    REGION: optionalEnv('STORAGE_REGION', 'us-east-1'),
    PUBLIC_URL: optionalEnv('STORAGE_PUBLIC_URL', 'http://localhost:9000'),
  },

  QUEUE: {
    HOST: optionalEnv('QUEUE_HOST', 'localhost'),
    PORT: parseInt(optionalEnv('QUEUE_PORT', '6379'), 10),
  },

  LOG_LEVEL: optionalEnv('LOG_LEVEL', 'debug'),
  CORS_ORIGIN: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),

  isDevelopment: () => env.NODE_ENV === 'development',
  isProduction: () => env.NODE_ENV === 'production',
  isTest: () => env.NODE_ENV === 'test',
};
