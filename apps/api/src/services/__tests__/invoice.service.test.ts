// Mock all dependencies before importing
jest.mock('../../config/database', () => ({
  getSequelize: jest.fn(),
}));

jest.mock('../../models/invoice.model', () => ({
  Invoice: {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../models/stay.model', () => ({
  Stay: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/guest.model', () => ({
  Guest: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/folio.model', () => ({
  Folio: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../models/folio-item.model', () => ({
  FolioItem: {},
}));

jest.mock('../../models/payment.model', () => ({
  Payment: {
    findAll: jest.fn(),
  },
}));

jest.mock('../../models/audit-log.model', () => ({
  AuditLog: {
    create: jest.fn(),
  },
}));

import { InvoiceService, invoiceService } from '../invoice.service';
import { Invoice } from '../../models/invoice.model';
import { Stay } from '../../models/stay.model';
import { Guest } from '../../models/guest.model';
import { Folio } from '../../models/folio.model';
import { Payment } from '../../models/payment.model';
import { getSequelize } from '../../config/database';
import { AuditLog } from '../../models/audit-log.model';
import { NotFoundError, BusinessRuleError } from '../../errors/app-error';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    service = new InvoiceService();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return an invoice by id', async () => {
      const mockInvoice = { id: 'inv-1', invoice_number: 'INV2401ABC' };
      (Invoice.findByPk as jest.Mock).mockResolvedValue(mockInvoice);

      const result = await service.findById('inv-1');

      expect(result).toEqual(mockInvoice);
      expect(Invoice.findByPk).toHaveBeenCalledWith('inv-1', {
        include: expect.any(Array),
      });
    });

    it('should throw NotFoundError when invoice not found', async () => {
      (Invoice.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      const mockResult = {
        rows: [{ id: 'inv-1' }],
        count: 1,
      };
      (Invoice.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAll('prop-1', { status: 'DRAFT' }, 1, 20);

      expect(result.invoices).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply invoice_number filter', async () => {
      (Invoice.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      await service.findAll('prop-1', { invoice_number: 'INV24' }, 1, 20);

      expect(Invoice.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            invoice_number: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('generate', () => {
    it('should generate an invoice for a stay', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockStay = {
        id: 'stay-1',
        guest_id: 'guest-1',
        property_id: 'prop-1',
        organization_id: 'org-1',
      };
      (Stay.findByPk as jest.Mock).mockResolvedValue(mockStay);

      // No existing invoice
      (Invoice.findOne as jest.Mock).mockResolvedValue(null);

      const mockFolio = {
        total_charges: 5000,
        total_taxes: 500,
        total_discounts: 100,
      };
      (Folio.findOne as jest.Mock).mockResolvedValue(mockFolio);

      const mockPayments = [
        { amount: 3000 },
        { amount: 1000 },
      ];
      (Payment.findAll as jest.Mock).mockResolvedValue(mockPayments);

      const mockInvoice = { id: 'inv-1' };
      (Invoice.create as jest.Mock).mockResolvedValue(mockInvoice);

      const mockCreatedInvoice = {
        id: 'inv-1',
        invoice_number: 'INV2401ABC',
        total_amount: 5400,
        paid_amount: 4000,
        balance: 1400,
      };
      (Invoice.findByPk as jest.Mock).mockResolvedValue(mockCreatedInvoice);

      const result = await service.generate('stay-1', 'user-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(Invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          invoice_number: expect.stringContaining('INV'),
          stay_id: 'stay-1',
          guest_id: 'guest-1',
          subtotal: 5000,
          tax_amount: 500,
          discount_amount: 100,
          total_amount: 5400,
          paid_amount: 4000,
          balance: 1400,
        }),
        { transaction: mockTransaction }
      );
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw error when stay not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Stay.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.generate('nonexistent', 'user-1')).rejects.toThrow('not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error when invoice already exists', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Stay.findByPk as jest.Mock).mockResolvedValue({ id: 'stay-1' });
      (Invoice.findOne as jest.Mock).mockResolvedValue({ id: 'existing-inv' });

      await expect(service.generate('stay-1', 'user-1')).rejects.toThrow(BusinessRuleError);
    });

    it('should set status to PAID when fully paid', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockStay = {
        id: 'stay-1',
        guest_id: 'guest-1',
        property_id: 'prop-1',
        organization_id: 'org-1',
      };
      (Stay.findByPk as jest.Mock).mockResolvedValue(mockStay);
      (Invoice.findOne as jest.Mock).mockResolvedValue(null);

      const mockFolio = {
        total_charges: 5000,
        total_taxes: 0,
        total_discounts: 0,
      };
      (Folio.findOne as jest.Mock).mockResolvedValue(mockFolio);

      // Fully paid
      (Payment.findAll as jest.Mock).mockResolvedValue([{ amount: 5000 }]);
      (Invoice.create as jest.Mock).mockResolvedValue({ id: 'inv-1' });
      (Invoice.findByPk as jest.Mock).mockResolvedValue({ id: 'inv-1' });

      await service.generate('stay-1', 'user-1');

      expect(Invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PAID' }),
        expect.any(Object)
      );
    });

    it('should set status to PARTIALLY_PAID when partially paid', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockStay = {
        id: 'stay-1',
        guest_id: 'guest-1',
        property_id: 'prop-1',
        organization_id: 'org-1',
      };
      (Stay.findByPk as jest.Mock).mockResolvedValue(mockStay);
      (Invoice.findOne as jest.Mock).mockResolvedValue(null);

      const mockFolio = {
        total_charges: 5000,
        total_taxes: 0,
        total_discounts: 0,
      };
      (Folio.findOne as jest.Mock).mockResolvedValue(mockFolio);

      // Partially paid
      (Payment.findAll as jest.Mock).mockResolvedValue([{ amount: 2000 }]);
      (Invoice.create as jest.Mock).mockResolvedValue({ id: 'inv-1' });
      (Invoice.findByPk as jest.Mock).mockResolvedValue({ id: 'inv-1' });

      await service.generate('stay-1', 'user-1');

      expect(Invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PARTIALLY_PAID' }),
        expect.any(Object)
      );
    });
  });

  describe('finalize', () => {
    it('should finalize a draft invoice', async () => {
      const mockInvoice = {
        id: 'inv-1',
        status: 'DRAFT',
        organization_id: 'org-1',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (Invoice.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockInvoice)
        .mockResolvedValueOnce({ ...mockInvoice, status: 'FINAL' });

      const result = await service.finalize('inv-1', 'user-1');

      expect(mockInvoice.update).toHaveBeenCalledWith({ status: 'FINAL' });
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundError when invoice not found', async () => {
      (Invoice.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.finalize('nonexistent', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessRuleError for non-draft invoice', async () => {
      const mockInvoice = { id: 'inv-1', status: 'FINAL' };
      (Invoice.findByPk as jest.Mock).mockResolvedValue(mockInvoice);

      await expect(service.finalize('inv-1', 'user-1')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('void', () => {
    it('should void an invoice', async () => {
      const mockInvoice = {
        id: 'inv-1',
        status: 'FINAL',
        organization_id: 'org-1',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (Invoice.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockInvoice)
        .mockResolvedValueOnce({ ...mockInvoice, status: 'VOID' });

      const result = await service.void('inv-1', 'user-1');

      expect(mockInvoice.update).toHaveBeenCalledWith({ status: 'VOID' });
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundError when invoice not found', async () => {
      (Invoice.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.void('nonexistent', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessRuleError when invoice is already void', async () => {
      const mockInvoice = { id: 'inv-1', status: 'VOID' };
      (Invoice.findByPk as jest.Mock).mockResolvedValue(mockInvoice);

      await expect(service.void('inv-1', 'user-1')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('singleton export', () => {
    it('should export a singleton instance', () => {
      expect(invoiceService).toBeInstanceOf(InvoiceService);
    });
  });
});
