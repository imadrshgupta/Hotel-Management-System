import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../services/token.service';
import { AuthenticationError } from '../errors/app-error';
import { setLogContext, clearLogContext } from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      organizationId?: string;
      propertyId?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];

  verifyAccessToken(token)
    .then((payload) => {
      req.user = payload;
      req.organizationId = payload.organizationId;
      req.propertyId = payload.propertyId;

      setLogContext({
        userId: payload.userId,
        organizationId: payload.organizationId,
        propertyId: payload.propertyId,
      });

      next();
    })
    .catch((err) => {
      clearLogContext();
      next(new AuthenticationError('Invalid or expired token'));
    });
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  verifyAccessToken(token)
    .then((payload) => {
      req.user = payload;
      req.organizationId = payload.organizationId;
      req.propertyId = payload.propertyId;
      next();
    })
    .catch(() => {
      next();
    });
}
