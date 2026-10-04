import { Request, Response, NextFunction } from 'express';
import { folioService } from '../services/folio.service';
import { sendSuccess, sendCreated } from '../utils/send';

export class FolioController {
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const folio = await folioService.findById(req.params.id);
      sendSuccess(res, folio);
    } catch (error) {
      next(error);
    }
  }

  async findByStay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const folio = await folioService.findByStay(req.params.stayId);
      sendSuccess(res, folio);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await folioService.addItem(req.params.id, {
        ...req.body,
        posted_by: req.user!.userId,
      });
      sendCreated(res, item, 'Folio item added');
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await folioService.removeItem(req.params.itemId);
      sendSuccess(res, null, 'Folio item removed');
    } catch (error) {
      next(error);
    }
  }
}

export const folioController = new FolioController();
