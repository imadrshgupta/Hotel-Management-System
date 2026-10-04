import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
  DatabaseError,
  RateLimitError,
  ExternalServiceError,
  AppError,
} from '../app-error';

describe('AppError Classes', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom values', () => {
      const error = new AppError('Custom', 400, 'CUSTOM_CODE', { detail: 'info' });
      expect(error.message).toBe('Custom');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.details).toEqual({ detail: 'info' });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should include details', () => {
      const error = new ValidationError('Bad field', { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should create auth error with custom message', () => {
      const error = new AuthenticationError('Token expired');
      expect(error.message).toBe('Token expired');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with default message', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should create authorization error with custom message', () => {
      const error = new AuthorizationError('Missing permission: admin');
      expect(error.message).toBe('Missing permission: admin');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with resource name and id', () => {
      const error = new NotFoundError('User', '123');
      expect(error.message).toBe("User with id '123' not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create not found error without id', () => {
      const error = new NotFoundError('Config');
      expect(error.message).toBe('Config not found');
    });

    it('should default to Resource', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.message).toBe('Duplicate entry');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('BusinessRuleError', () => {
    it('should create business rule error with default code', () => {
      const error = new BusinessRuleError('Invalid state');
      expect(error.message).toBe('Invalid state');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('BUSINESS_RULE_ERROR');
    });

    it('should create business rule error with custom code', () => {
      const error = new BusinessRuleError('Room occupied', 'ROOM_OCCUPIED');
      expect(error.code).toBe('ROOM_OCCUPIED');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with default message', () => {
      const error = new DatabaseError();
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });

    it('should include details', () => {
      const error = new DatabaseError('Query failed', { query: 'SELECT' });
      expect(error.details).toEqual({ query: 'SELECT' });
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error', () => {
      const error = new ExternalServiceError('Stripe', 'Payment failed');
      expect(error.message).toBe('Stripe: Payment failed');
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });

    it('should use default message', () => {
      const error = new ExternalServiceError('Stripe');
      expect(error.message).toBe('Stripe: Service unavailable');
    });
  });
});
