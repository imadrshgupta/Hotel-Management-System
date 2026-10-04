import { getSequelize } from '../config/database';
import { Invoice } from '../models/invoice.model';
import { Stay } from '../models/stay.model';
import { Guest } from '../models/guest.model';
import { Folio } from '../models/folio.model';
import { FolioItem } from '../models/folio-item.model';
import { Payment } from '../models/payment.model';
import { NotFoundError, BusinessRuleError } from '../errors/app-error';
import { generateInvoiceNumber } from '../utils/index';
import { AuditLog } from '../models/audit-log.model';

export class InvoiceService {
  async findById(id: string): Promise<Invoice> {
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Stay, as: 'stay' },
        { model: Guest, as: 'guest' },
      ],
    });
    if (!invoice) throw new NotFoundError('Invoice', id);
    return invoice;
  }

  async findAll(propertyId: string, filters: any, page: number = 1, limit: number = 20) {
    const where: any = { property_id: propertyId };
    if (filters.status) where.status = filters.status;
    if (filters.invoice_number) {
      const { Op } = require('sequelize');
      where.invoice_number = { [Op.iLike]: `%${filters.invoice_number}%` };
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [
        { model: Guest, as: 'guest', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { invoices: rows, total: count };
  }

  async generate(stayId: string, userId: string): Promise<Invoice> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const stay = await Stay.findByPk(stayId, { transaction });
      if (!stay) throw new NotFoundError('Stay', stayId);

      // Check if invoice already exists
      const existing = await Invoice.findOne({
        where: { stay_id: stayId, status: { [require('sequelize').Op.ne]: 'VOID' } },
        transaction,
      });
      if (existing) {
        throw new BusinessRuleError('Invoice already exists for this stay');
      }

      const folio = await Folio.findOne({
        where: { stay_id: stayId },
        transaction,
      });

      const payments = await Payment.findAll({
        where: { stay_id: stayId, status: 'COMPLETED' },
        transaction,
      });

      const subtotal = folio ? Number(folio.total_charges) : 0;
      const taxAmount = folio ? Number(folio.total_taxes) : 0;
      const discountAmount = folio ? Number(folio.total_discounts) : 0;
      const totalAmount = subtotal + taxAmount - discountAmount;
      const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance = totalAmount - paidAmount;

      const invoiceNumber = generateInvoiceNumber('INV');

      const invoice = await Invoice.create(
        {
          invoice_number: invoiceNumber,
          stay_id: stayId,
          guest_id: stay.guest_id,
          property_id: stay.property_id,
          organization_id: stay.organization_id,
          status: balance <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIALLY_PAID' : 'DRAFT',
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          balance,
          issued_at: new Date(),
        } as any,
        { transaction }
      );

      await transaction.commit();

      // Audit
      await AuditLog.create({
        user_id: userId,
        organization_id: stay.organization_id,
        property_id: stay.property_id,
        action: 'CREATE',
        entity: 'INVOICE',
        entity_id: invoice.id,
        new_value: { invoice_number: invoiceNumber, total_amount: totalAmount },
      } as any);

      return this.findById(invoice.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async finalize(id: string, userId: string): Promise<Invoice> {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) throw new NotFoundError('Invoice', id);
    if (invoice.status !== 'DRAFT') throw new BusinessRuleError('Only draft invoices can be finalized');

    await invoice.update({ status: 'FINAL' } as any);

    await AuditLog.create({
      user_id: userId,
      organization_id: invoice.organization_id,
      property_id: invoice.property_id,
      action: 'UPDATE',
      entity: 'INVOICE',
      entity_id: invoice.id,
      new_value: { status: 'FINAL' },
    } as any);

    return this.findById(id);
  }

  async void(id: string, userId: string): Promise<Invoice> {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) throw new NotFoundError('Invoice', id);
    if (invoice.status === 'VOID') throw new BusinessRuleError('Invoice is already void');

    await invoice.update({ status: 'VOID' } as any);

    await AuditLog.create({
      user_id: userId,
      organization_id: invoice.organization_id,
      property_id: invoice.property_id,
      action: 'VOID',
      entity: 'INVOICE',
      entity_id: invoice.id,
      new_value: { status: 'VOID' },
    } as any);

    return this.findById(id);
  }
}

export const invoiceService = new InvoiceService();
