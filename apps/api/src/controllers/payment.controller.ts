import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { sendSuccess, sendCreated } from '../utils/send';

export class PaymentController {
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.findById(req.params.id);
      sendSuccess(res, payment);
    } catch (error) {
      next(error);
    }
  }

  async findByFolio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await paymentService.findByFolio(req.params.folioId);
      sendSuccess(res, payments);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.create(
        {
          stay_id: req.body.stay_id,
          amount: req.body.amount,
          method: req.body.method,
          reference_number: req.body.reference_number,
          card_last_four: req.body.card_last_four,
          card_type: req.body.card_type,
          notes: req.body.notes,
        },
        req.user!.userId
      );
      sendCreated(res, payment, 'Payment processed successfully');
    } catch (error) {
      next(error);
    }
  }

  async refund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refund = await paymentService.refund(
        req.params.id,
        { amount: req.body.amount, reason: req.body.reason },
        req.user!.userId
      );
      sendSuccess(res, refund, 'Refund processed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
