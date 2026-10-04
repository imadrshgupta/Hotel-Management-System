// Mock all dependencies before importing the service
jest.mock('../../config/database', () => ({
  getSequelize: jest.fn(),
}));

jest.mock('../../models/payment.model', () => ({
  Payment: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    sum: jest.fn(),
  },
}));

jest.mock('../../models/refund.model', () => ({
  Refund: {
    create: jest.fn(),
  },
}));

jest.mock('../../models/folio.model', () => ({
  Folio: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
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

jest.mock('../../config/websocket', () => ({
  broadcastToProperty: jest.fn(),
}));

jest.mock('../../models/audit-log.model', () => ({
  AuditLog: {
    create: jest.fn(),
  },
}));

import { PaymentService, paymentService } from '../payment.service';
import { Payment } from '../../models/payment.model';
import { Refund } from '../../models/refund.model';
import { Folio } from '../../models/folio.model';
import { Stay } from '../../models/stay.model';
import { Guest } from '../../models/guest.model';
import { getSequelize } from '../../config/database';
import { broadcastToProperty } from '../../config/websocket';
import { AuditLog } from '../../models/audit-log.model';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a payment by id', async () => {
      const mockPayment = { id: 'pay-1', amount: 100, status: 'COMPLETED' };
      (Payment.findByPk as jest.Mock).mockResolvedValue(mockPayment);

      const result = await service.findById('pay-1');

      expect(result).toEqual(mockPayment);
      expect(Payment.findByPk).toHaveBeenCalledWith('pay-1', {
        include: expect.any(Array),
      });
    });

    it('should throw NotFoundError when payment not found', async () => {
      (Payment.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('findByFolio', () => {
    it('should return payments for a folio', async () => {
      const mockPayments = [{ id: 'pay-1' }, { id: 'pay-2' }];
      (Payment.findAll as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.findByFolio('folio-1');

      expect(result).toEqual(mockPayments);
      expect(Payment.findAll).toHaveBeenCalledWith({
        where: { folio_id: 'folio-1' },
        order: [['processed_at', 'DESC']],
      });
    });
  });

  describe('create', () => {
    it('should create a payment successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockStay = {
        id: 'stay-1',
        status: 'ACTIVE',
        guest_id: 'guest-1',
        property_id: 'prop-1',
        organization_id: 'org-1',
      };
      (Stay.findByPk as jest.Mock).mockResolvedValue(mockStay);

      const mockFolio = {
        id: 'folio-1',
        total_charges: 500,
        total_taxes: 50,
        total_discounts: 0,
        total_payments: 0,
        total_refunds: 0,
        balance: 550,
        update: jest.fn(),
      };
      (Folio.findOne as jest.Mock).mockResolvedValue(mockFolio);

      const mockPayment = { id: 'pay-1' };
      (Payment.create as jest.Mock).mockResolvedValue(mockPayment);

      const mockCreatedPayment = { id: 'pay-1', amount: 100, guest: { first_name: 'John' } };
      (Payment.findByPk as jest.Mock).mockResolvedValue(mockCreatedPayment);

      const data = {
        stay_id: 'stay-1',
        amount: 100,
        method: 'CARD',
      };

      const result = await service.create(data, 'user-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockFolio.update).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalled();
      expect(broadcastToProperty).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedPayment);
    });

    it('should throw error when stay not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Stay.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create({ stay_id: 'nonexistent', amount: 100, method: 'CARD' }, 'user-1')
      ).rejects.toThrow('not found');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error when stay is not active', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Stay.findByPk as jest.Mock).mockResolvedValue({ id: 'stay-1', status: 'CHECKED_OUT' });

      await expect(
        service.create({ stay_id: 'stay-1', amount: 100, method: 'CARD' }, 'user-1')
      ).rejects.toThrow('Stay is not active');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error when no open folio found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Stay.findByPk as jest.Mock).mockResolvedValue({ id: 'stay-1', status: 'ACTIVE' });
      (Folio.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create({ stay_id: 'stay-1', amount: 100, method: 'CARD' }, 'user-1')
      ).rejects.toThrow('not found');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error for zero amount', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Stay.findByPk as jest.Mock).mockResolvedValue({ id: 'stay-1', status: 'ACTIVE' });
      (Folio.findOne as jest.Mock).mockResolvedValue({ id: 'folio-1' });

      await expect(
        service.create({ stay_id: 'stay-1', amount: 0, method: 'CARD' }, 'user-1')
      ).rejects.toThrow('greater than 0');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error for negative amount', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Stay.findByPk as jest.Mock).mockResolvedValue({ id: 'stay-1', status: 'ACTIVE' });
      (Folio.findOne as jest.Mock).mockResolvedValue({ id: 'folio-1' });

      await expect(
        service.create({ stay_id: 'stay-1', amount: -50, method: 'CARD' }, 'user-1')
      ).rejects.toThrow('greater than 0');
    });
  });

  describe('refund', () => {
    it('should create a refund successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockPayment = {
        id: 'pay-1',
        amount: 100,
        status: 'COMPLETED',
        property_id: 'prop-1',
        organization_id: 'org-1',
        folio_id: 'folio-1',
        update: jest.fn(),
      } as any;
      (Payment.findByPk as jest.Mock).mockResolvedValue(mockPayment);

      const mockRefund = { id: 'ref-1', amount: 50 };
      (Refund.create as jest.Mock).mockResolvedValue(mockRefund);

      const mockFolio = {
        id: 'folio-1',
        total_refunds: 0,
        total_charges: 500,
        total_taxes: 50,
        total_discounts: 0,
        total_payments: 100,
        update: jest.fn(),
      };
      (Folio.findByPk as jest.Mock).mockResolvedValue(mockFolio);

      const result = await service.refund('pay-1', { amount: 50, reason: 'Customer request' }, 'user-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(Refund.create).toHaveBeenCalled();
      expect(mockPayment.update).toHaveBeenCalled();
      expect(mockFolio.update).toHaveBeenCalled();
      expect(result).toEqual(mockRefund);
    });

    it('should throw error when payment not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Payment.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        service.refund('nonexistent', { amount: 50, reason: 'test' }, 'user-1')
      ).rejects.toThrow('not found');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error when payment already refunded', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Payment.findByPk as jest.Mock).mockResolvedValue({
        id: 'pay-1',
        amount: 100,
        status: 'REFUNDED',
        update: jest.fn(),
      } as any);

      await expect(
        service.refund('pay-1', { amount: 50, reason: 'test' }, 'user-1')
      ).rejects.toThrow('already refunded');
    });

    it('should throw error for zero refund amount', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Payment.findByPk as jest.Mock).mockResolvedValue({
        id: 'pay-1',
        amount: 100,
        status: 'COMPLETED',
        update: jest.fn(),
      } as any);

      await expect(
        service.refund('pay-1', { amount: 0, reason: 'test' }, 'user-1')
      ).rejects.toThrow('greater than 0');
    });

    it('should throw error when refund exceeds payment amount', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Payment.findByPk as jest.Mock).mockResolvedValue({
        id: 'pay-1',
        amount: 100,
        status: 'COMPLETED',
        update: jest.fn(),
      } as any);

      await expect(
        service.refund('pay-1', { amount: 150, reason: 'test' }, 'user-1')
      ).rejects.toThrow('exceeds payment amount');
    });
  });

  describe('singleton export', () => {
    it('should export a singleton instance', () => {
      expect(paymentService).toBeInstanceOf(PaymentService);
    });
  });
});
