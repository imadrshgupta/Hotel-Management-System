import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service';
import { sendSuccess, sendPaginated } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';

export class InvoiceController {
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.findById(req.params.id);
      sendSuccess(res, invoice);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const { invoices, total } = await invoiceService.findAll(req.propertyId!, req.query, page, limit);
      sendPaginated(res, invoices, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.generate(req.body.stay_id, req.user!.userId);
      sendSuccess(res, invoice, 'Invoice generated');
    } catch (error) {
      next(error);
    }
  }

  async finalize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.finalize(req.params.id, req.user!.userId);
      sendSuccess(res, invoice, 'Invoice finalized');
    } catch (error) {
      next(error);
    }
  }

  async void_(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.void(req.params.id, req.user!.userId);
      sendSuccess(res, invoice, 'Invoice voided');
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceController = new InvoiceController();
