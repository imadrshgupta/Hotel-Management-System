import { Request, Response, NextFunction } from 'express';
import { roomService } from '../services/room.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';

export class RoomController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const filter = {
        property_id: req.propertyId!,
        status: req.query.status as string,
        room_type_id: req.query.room_type_id as string,
        floor_id: req.query.floor_id as string,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        number: req.query.number as string,
      };

      const { rooms, total } = await roomService.findAll(filter, page, limit);
      sendPaginated(res, rooms, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await roomService.findById(req.params.id);
      sendSuccess(res, room);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await roomService.create(
        { ...req.body, property_id: req.propertyId, organization_id: req.organizationId },
        req.user!.userId
      );
      sendCreated(res, room, 'Room created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await roomService.update(req.params.id, req.body);
      sendSuccess(res, room, 'Room updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await roomService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await roomService.changeStatus({
        room_id: req.params.id,
        to_status: req.body.status,
        reason: req.body.reason,
        changed_by: req.user!.userId,
      });
      sendSuccess(res, room, 'Room status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStatusSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await roomService.getStatusSummary(req.propertyId!);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await roomService.getStatusHistory(req.params.id);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}

export const roomController = new RoomController();
