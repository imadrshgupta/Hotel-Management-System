import { Request, Response, NextFunction } from 'express';
import { housekeepingService } from '../services/housekeeping.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';

export class HousekeepingController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const { tasks, total } = await housekeepingService.findAll(req.propertyId!, req.query, page, limit);
      sendPaginated(res, tasks, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await housekeepingService.findById(req.params.id);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await housekeepingService.assign(req.params.id, req.body.assigned_to);
      sendSuccess(res, task, 'Task assigned');
    } catch (error) {
      next(error);
    }
  }

  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await housekeepingService.start(req.params.id);
      sendSuccess(res, task, 'Task started');
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await housekeepingService.complete(req.params.id);
      sendSuccess(res, task, 'Task completed');
    } catch (error) {
      next(error);
    }
  }

  async inspect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await housekeepingService.inspect(req.params.id, req.user!.userId);
      sendSuccess(res, task, 'Task inspected');
    } catch (error) {
      next(error);
    }
  }
}

export const housekeepingController = new HousekeepingController();
