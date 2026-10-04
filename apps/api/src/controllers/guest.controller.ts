import { Request, Response, NextFunction } from 'express';
import { guestService } from '../services/guest.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';

export class GuestController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const filters = {
        search: req.query.search as string,
        vip_status: req.query.vip_status as string,
      };
      const { guests, total } = await guestService.findAll(req.propertyId!, filters, page, limit);
      sendPaginated(res, guests, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const guest = await guestService.findById(req.params.id);
      sendSuccess(res, guest);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const guest = await guestService.create({
        ...req.body,
        property_id: req.propertyId,
        organization_id: req.organizationId,
      });
      sendCreated(res, guest, 'Guest created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const guest = await guestService.update(req.params.id, req.body);
      sendSuccess(res, guest, 'Guest updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await guestService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async searchDuplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const guests = await guestService.searchDuplicate(
        req.propertyId!,
        req.query.email as string,
        req.query.phone as string
      );
      sendSuccess(res, guests);
    } catch (error) {
      next(error);
    }
  }

  async addDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await guestService.addDocument(req.params.id, req.body);
      sendCreated(res, document, 'Document added successfully');
    } catch (error) {
      next(error);
    }
  }

  async addPreference(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const preference = await guestService.addPreference(
        req.params.id,
        req.body.key,
        req.body.value
      );
      sendCreated(res, preference, 'Preference saved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const guestController = new GuestController();
