import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/app-error';

/**
 * Ensures the request has a valid organization and property context.
 * This middleware should be used after authenticate.
 */
export function requireProperty(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new ValidationError('Authentication required'));
  }

  if (!req.user.organizationId || !req.user.propertyId) {
    return next(new ValidationError('Organization and property context required'));
  }

  next();
}

/**
 * Validates that the requested resource belongs to the user's property.
 * Use as a factory for property-specific validation.
 */
export function validatePropertyAccess(resourcePropertyIdGetter: (req: Request) => string | undefined) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resourcePropertyId = resourcePropertyIdGetter(req);
    if (resourcePropertyId && req.propertyId && resourcePropertyId !== req.propertyId) {
      return next(new ValidationError('Resource does not belong to your property'));
    }
    next();
  };
}
