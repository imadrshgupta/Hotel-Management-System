import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { setLogContext, clearLogContext } from '../config/logger';

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.headers['x-request-id'] = requestId;
  (req as any).requestId = requestId;

  setLogContext({ requestId });

  // Clean up after request
  _res.on('finish', () => {
    clearLogContext();
  });

  next();
}
