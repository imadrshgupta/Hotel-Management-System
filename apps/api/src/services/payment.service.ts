import { getSequelize } from '../config/database';
import { Payment } from '../models/payment.model';
import { Refund } from '../models/refund.model';
import { Folio } from '../models/folio.model';
import { Stay } from '../models/stay.model';
import { Guest } from '../models/guest.model';
import { NotFoundError, BusinessRuleError, ValidationError } from '../errors/app-error';
import { broadcastToProperty } from '../config/websocket';
import { AuditLog } from '../models/audit-log.model';

export class PaymentService {
  async findById(id: string): Promise<Payment> {
    const payment = await Payment.findByPk(id, {
      include: [{ model: Guest, as: 'guest', attributes: ['id', 'first_name', 'last_name'] }],
    });
    if (!payment) throw new NotFoundError('Payment', id);
    return payment;
  }

  async findByFolio(folioId: string): Promise<Payment[]> {
    return Payment.findAll({
      where: { folio_id: folioId },
      order: [['processed_at', 'DESC']],
    });
  }

  async create(data: {
    stay_id: string;
    amount: number;
    method: string;
    reference_number?: string;
    card_last_four?: string;
    card_type?: string;
    notes?: string;
  }, userId: string): Promise<Payment> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const stay = await Stay.findByPk(data.stay_id, { transaction });
      if (!stay) throw new NotFoundError('Stay', data.stay_id);
      if (stay.status !== 'ACTIVE') throw new BusinessRuleError('Stay is not active');

      const folio = await Folio.findOne({
        where: { stay_id: data.stay_id, status: 'OPEN' },
        transaction,
      });
      if (!folio) throw new NotFoundError('Open folio for stay');

      if (data.amount <= 0) {
        throw new ValidationError('Payment amount must be greater than 0');
      }

      // Create payment
      const payment = await Payment.create(
        {
          ...data,
          folio_id: folio.id,
          guest_id: stay.guest_id,
          property_id: stay.property_id,
          organization_id: stay.organization_id,
          status: 'COMPLETED',
          processed_by: userId,
          processed_at: new Date(),
        } as any,
        { transaction }
      );

      // Update folio
      const newTotalPayments = Number(folio.total_payments) + data.amount;
      const newBalance = Number(folio.total_charges) + Number(folio.total_taxes)
        - Number(folio.total_discounts) - newTotalPayments + Number(folio.total_refunds);

      await folio.update({
        total_payments: newTotalPayments,
        balance: newBalance,
      }, { transaction });

      await transaction.commit();

      // Audit
      await AuditLog.create({
        user_id: userId,
        organization_id: stay.organization_id,
        property_id: stay.property_id,
        action: 'CREATE',
        entity: 'PAYMENT',
        entity_id: payment.id,
        new_value: { amount: data.amount, method: data.method },
      } as any);

      broadcastToProperty(stay.property_id, 'payment:created', {
        paymentId: payment.id,
        stayId: data.stay_id,
        amount: data.amount,
      });

      return this.findById(payment.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async refund(paymentId: string, data: {
    amount: number;
    reason: string;
  }, userId: string): Promise<Refund> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.findByPk(paymentId, { transaction });
      if (!payment) throw new NotFoundError('Payment', paymentId);
      if (payment.status === 'REFUNDED') throw new BusinessRuleError('Payment already refunded');

      if (data.amount <= 0) throw new ValidationError('Refund amount must be greater than 0');
      if (data.amount > Number(payment.amount)) throw new BusinessRuleError('Refund amount exceeds payment amount');

      // Create refund
      const refund = await Refund.create(
        {
          payment_id: paymentId,
          property_id: payment.property_id,
          organization_id: payment.organization_id,
          amount: data.amount,
          reason: data.reason,
          status: 'COMPLETED',
          processed_by: userId,
          processed_at: new Date(),
        } as any,
        { transaction }
      );

      // Update payment status
      const totalRefunded = data.amount;
      if (totalRefunded >= Number(payment.amount)) {
        await payment.update({ status: 'REFUNDED' }, { transaction });
      } else {
        await payment.update({ status: 'PARTIALLY_REFUNDED' }, { transaction });
      }

      // Update folio
      const folio = payment.folio_id ? await Folio.findByPk(payment.folio_id, { transaction }) : null;
      if (folio) {
        const newTotalRefunds = Number(folio.total_refunds) + data.amount;
        const newBalance = Number(folio.total_charges) + Number(folio.total_taxes)
          - Number(folio.total_discounts) - Number(folio.total_payments) + newTotalRefunds;

        await folio.update({
          total_refunds: newTotalRefunds,
          balance: newBalance,
        }, { transaction });
      }

      await transaction.commit();
      return refund;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
