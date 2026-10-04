// Mock all dependencies before importing
jest.mock('../../config/database', () => ({
  getSequelize: jest.fn(),
}));

jest.mock('../../config/websocket', () => ({
  broadcastToProperty: jest.fn(),
}));

jest.mock('../../models/housekeeping-task.model', () => ({
  HousekeepingTask: {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

jest.mock('../../models/room.model', () => ({
  Room: {
    findByPk: jest.fn(),
  },
}));

import { HousekeepingService, housekeepingService } from '../housekeeping.service';
import { HousekeepingTask } from '../../models/housekeeping-task.model';
import { Room } from '../../models/room.model';
import { getSequelize } from '../../config/database';
import { broadcastToProperty } from '../../config/websocket';
import { NotFoundError, BusinessRuleError } from '../../errors/app-error';

describe('HousekeepingService', () => {
  let service: HousekeepingService;

  beforeEach(() => {
    service = new HousekeepingService();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      const mockTask = { id: 'task-1', status: 'PENDING', room_id: 'room-1' };
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(mockTask);

      const result = await service.findById('task-1');

      expect(result).toEqual(mockTask);
      expect(HousekeepingTask.findByPk).toHaveBeenCalledWith('task-1', {
        include: expect.any(Array),
      });
    });

    it('should throw NotFoundError when task not found', async () => {
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const mockResult = {
        rows: [{ id: 'task-1' }],
        count: 1,
      };
      (HousekeepingTask.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAll('prop-1', { status: 'PENDING' }, 1, 20);

      expect(result.tasks).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply all filters', async () => {
      (HousekeepingTask.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      await service.findAll('prop-1', {
        status: 'PENDING',
        task_type: 'CHECKOUT',
        assigned_to: 'user-1',
      });

      expect(HousekeepingTask.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            property_id: 'prop-1',
            status: 'PENDING',
            task_type: 'CHECKOUT',
            assigned_to: 'user-1',
          }),
        })
      );
    });
  });

  describe('assign', () => {
    it('should assign a pending task', async () => {
      const mockTask = {
        id: 'task-1',
        status: 'PENDING',
        property_id: 'prop-1',
        room_id: 'room-1',
        update: jest.fn(),
      };
      (HousekeepingTask.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce({ id: 'task-1', status: 'ASSIGNED', assigned_to: 'user-1' });

      const result = await service.assign('task-1', 'user-1');

      expect(mockTask.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ASSIGNED', assigned_to: 'user-1' })
      );
      expect(broadcastToProperty).toHaveBeenCalled();
    });

    it('should throw NotFoundError when task not found', async () => {
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.assign('nonexistent', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessRuleError for non-pending task', async () => {
      const mockTask = {
        id: 'task-1',
        status: 'IN_PROGRESS',
      };
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(mockTask);

      await expect(service.assign('task-1', 'user-1')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('start', () => {
    it('should start a pending task', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockTask = {
        id: 'task-1',
        status: 'PENDING',
        room_id: 'room-1',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (HousekeepingTask.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce({ id: 'task-1', status: 'IN_PROGRESS' });

      const mockRoom = {
        id: 'room-1',
        status: 'DIRTY',
        update: jest.fn(),
      };
      (Room.findByPk as jest.Mock).mockResolvedValue(mockRoom);

      const result = await service.start('task-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTask.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'IN_PROGRESS' }),
        { transaction: mockTransaction }
      );
      expect(mockRoom.update).toHaveBeenCalledWith(
        { status: 'CLEANING' },
        { transaction: mockTransaction }
      );
    });

    it('should start an assigned task', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockTask = {
        id: 'task-1',
        status: 'ASSIGNED',
        room_id: 'room-1',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (HousekeepingTask.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce({ id: 'task-1', status: 'IN_PROGRESS' });

      const mockRoom = { id: 'room-1', status: 'DIRTY', update: jest.fn() };
      (Room.findByPk as jest.Mock).mockResolvedValue(mockRoom);

      await service.start('task-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw NotFoundError when task not found', async () => {
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.start('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessRuleError for invalid status', async () => {
      const mockTask = { id: 'task-1', status: 'COMPLETED' };
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(mockTask);

      await expect(service.start('task-1')).rejects.toThrow(BusinessRuleError);
    });

    it('should not update room if not DIRTY', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockTask = {
        id: 'task-1',
        status: 'PENDING',
        room_id: 'room-1',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (HousekeepingTask.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce({ id: 'task-1', status: 'IN_PROGRESS' });

      const mockRoom = { id: 'room-1', status: 'VACANT_CLEAN', update: jest.fn() };
      (Room.findByPk as jest.Mock).mockResolvedValue(mockRoom);

      await service.start('task-1');

      expect(mockRoom.update).not.toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete an in-progress task', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockTask = {
        id: 'task-1',
        status: 'IN_PROGRESS',
        room_id: 'room-1',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (HousekeepingTask.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce({ id: 'task-1', status: 'COMPLETED' });

      const mockRoom = { id: 'room-1', status: 'CLEANING', update: jest.fn() };
      (Room.findByPk as jest.Mock).mockResolvedValue(mockRoom);

      const result = await service.complete('task-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTask.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'COMPLETED' }),
        { transaction: mockTransaction }
      );
      expect(mockRoom.update).toHaveBeenCalledWith(
        { status: 'INSPECTION' },
        { transaction: mockTransaction }
      );
    });

    it('should throw NotFoundError when task not found', async () => {
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.complete('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessRuleError for invalid status', async () => {
      const mockTask = { id: 'task-1', status: 'PENDING' };
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(mockTask);

      await expect(service.complete('task-1')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('inspect', () => {
    it('should inspect a completed task', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockTask = {
        id: 'task-1',
        status: 'COMPLETED',
        room_id: 'room-1',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (HousekeepingTask.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce({ id: 'task-1', status: 'INSPECTED' });

      const mockRoom = { id: 'room-1', status: 'INSPECTION', update: jest.fn() };
      (Room.findByPk as jest.Mock).mockResolvedValue(mockRoom);

      const result = await service.inspect('task-1', 'inspector-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'INSPECTED',
          inspected_by: 'inspector-1',
        }),
        { transaction: mockTransaction }
      );
      expect(mockRoom.update).toHaveBeenCalledWith(
        { status: 'VACANT_CLEAN' },
        { transaction: mockTransaction }
      );
    });

    it('should throw NotFoundError when task not found', async () => {
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.inspect('nonexistent', 'inspector-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessRuleError for invalid status', async () => {
      const mockTask = { id: 'task-1', status: 'IN_PROGRESS' };
      (HousekeepingTask.findByPk as jest.Mock).mockResolvedValue(mockTask);

      await expect(service.inspect('task-1', 'inspector-1')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('singleton export', () => {
    it('should export a singleton instance', () => {
      expect(housekeepingService).toBeInstanceOf(HousekeepingService);
    });
  });
});
