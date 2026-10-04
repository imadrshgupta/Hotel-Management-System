import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`Operational error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error(`Unexpected error: ${err.message}`, {
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const details = (err as any).errors?.map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Database validation failed',
        details,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const details = (err as any).errors?.map((e: any) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A record with this value already exists',
        details,
      },
    };
    res.status(409).json(response);
    return;
  }

  // Sequelize foreign key error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'REFERENCE_ERROR',
        message: 'Referenced record does not exist',
      },
    };
    res.status(400).json(response);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      },
    };
    res.status(401).json(response);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired',
      },
    };
    res.status(401).json(response);
    return;
  }

  // Default error
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isProduction()
        ? 'An unexpected error occurred'
        : err.message,
    },
  };
  res.status(500).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  };
  res.status(404).json(response);
}
