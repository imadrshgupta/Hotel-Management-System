import winston from 'winston';
import { env } from './env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  env.isProduction()
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}${metaStr}`;
        })
      )
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'hms-api' },
  transports: [
    new winston.transports.Console(),
    ...(env.isProduction()
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

// Request context helper
export interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  propertyId?: string;
  module?: string;
  action?: string;
}

let currentContext: LogContext = {};

export function setLogContext(context: LogContext) {
  currentContext = { ...currentContext, ...context };
}

export function clearLogContext() {
  currentContext = {};
}

export function logWithContext(
  level: string,
  message: string,
  meta?: Record<string, any>
) {
  (logger as any)[level](message, { ...currentContext, ...meta });
}
