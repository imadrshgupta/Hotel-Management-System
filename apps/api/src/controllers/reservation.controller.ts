import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservation.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';

export class ReservationController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const filters = {
        status: req.query.status,
        check_in_date: req.query.check_in_date,
        check_out_date: req.query.check_out_date,
        source: req.query.source,
        confirmation_number: req.query.confirmation_number,
      };

      const { reservations, total } = await reservationService.findAll(
        req.propertyId!,
        filters,
        page,
        limit
      );
      sendPaginated(res, reservations, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservation = await reservationService.findById(req.params.id);
      sendSuccess(res, reservation);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservation = await reservationService.create(
        {
          ...req.body,
          property_id: req.propertyId!,
          organization_id: req.organizationId!,
        },
        req.user!.userId
      );
      sendCreated(res, reservation, 'Reservation created successfully');
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservation = await reservationService.confirm(req.params.id, req.user!.userId);
      sendSuccess(res, reservation, 'Reservation confirmed');
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservation = await reservationService.cancel(
        req.params.id,
        req.user!.userId,
        req.body.reason
      );
      sendSuccess(res, reservation, 'Reservation cancelled');
    } catch (error) {
      next(error);
    }
  }

  async noShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservation = await reservationService.noShow(req.params.id, req.user!.userId);
      sendSuccess(res, reservation, 'Reservation marked as no-show');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservation = await reservationService.update(
        req.params.id,
        req.body,
        req.user!.userId
      );
      sendSuccess(res, reservation, 'Reservation updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const reservationController = new ReservationController();
