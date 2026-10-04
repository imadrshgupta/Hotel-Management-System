import { Request, Response, NextFunction } from 'express';
import { stayService } from '../services/stay.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';

export class StayController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const filters = {
        status: req.query.status as string,
        room_id: req.query.room_id as string,
      };
      const { stays, total } = await stayService.findAll(req.propertyId!, filters, page, limit);
      sendPaginated(res, stays, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stay = await stayService.findById(req.params.id);
      sendSuccess(res, stay);
    } catch (error) {
      next(error);
    }
  }

  async getActiveStays(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stays = await stayService.getActiveByProperty(req.propertyId!);
      sendSuccess(res, stays);
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stay = await stayService.checkIn(
        {
          reservation_id: req.body.reservation_id,
          room_id: req.body.room_id,
          guest_id: req.body.guest_id,
          actual_check_in: req.body.actual_check_in,
          notes: req.body.notes,
        },
        req.user!.userId
      );
      sendCreated(res, stay, 'Check-in successful');
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stay = await stayService.checkOut(
        {
          stay_id: req.params.id,
          actual_check_out: req.body.actual_check_out,
          notes: req.body.notes,
        },
        req.user!.userId
      );
      sendSuccess(res, stay, 'Check-out successful');
    } catch (error) {
      next(error);
    }
  }

  async extendStay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stay = await stayService.extendStay(
        req.params.id,
        req.body.check_out_date,
        req.user!.userId
      );
      sendSuccess(res, stay, 'Stay extended successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const stayController = new StayController();
