import { Op } from 'sequelize';
import { HousekeepingTask } from '../models/housekeeping-task.model';
import { Room } from '../models/room.model';
import { getSequelize } from '../config/database';
import { NotFoundError, BusinessRuleError } from '../errors/app-error';
import { ROOM_STATUS_TRANSITIONS } from '../constants/index';
import { broadcastToProperty } from '../config/websocket';

export class HousekeepingService {
  async findById(id: string): Promise<HousekeepingTask> {
    const task = await HousekeepingTask.findByPk(id, {
      include: [{ model: Room, as: 'room', attributes: ['id', 'number', 'status'] }],
    });
    if (!task) throw new NotFoundError('Housekeeping task', id);
    return task;
  }

  async findAll(propertyId: string, filters: any, page: number = 1, limit: number = 20) {
    const where: any = { property_id: propertyId };
    if (filters.status) where.status = filters.status;
    if (filters.task_type) where.task_type = filters.task_type;
    if (filters.assigned_to) where.assigned_to = filters.assigned_to;

    const { count, rows } = await HousekeepingTask.findAndCountAll({
      where,
      include: [{ model: Room, as: 'room', attributes: ['id', 'number', 'status'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { tasks: rows, total: count };
  }

  async assign(taskId: string, assignedTo: string): Promise<HousekeepingTask> {
    const task = await HousekeepingTask.findByPk(taskId);
    if (!task) throw new NotFoundError('Housekeeping task', taskId);
    if (task.status !== 'PENDING') throw new BusinessRuleError('Can only assign pending tasks');

    await task.update({ status: 'ASSIGNED', assigned_to: assignedTo } as any);

    broadcastToProperty(task.property_id, 'housekeeping:assigned', {
      taskId: task.id,
      roomId: task.room_id,
    });

    return this.findById(taskId);
  }

  async start(taskId: string): Promise<HousekeepingTask> {
    const task = await HousekeepingTask.findByPk(taskId);
    if (!task) throw new NotFoundError('Housekeeping task', taskId);
    if (!['PENDING', 'ASSIGNED'].includes(task.status)) {
      throw new BusinessRuleError('Task must be pending or assigned to start');
    }

    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      await task.update({
        status: 'IN_PROGRESS',
        started_at: new Date(),
      } as any, { transaction });

      // Update room status to CLEANING
      const room = await Room.findByPk(task.room_id, { transaction });
      if (room && room.status === 'DIRTY') {
        await room.update({ status: 'CLEANING' }, { transaction });
      }

      await transaction.commit();
      return this.findById(taskId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async complete(taskId: string): Promise<HousekeepingTask> {
    const task = await HousekeepingTask.findByPk(taskId);
    if (!task) throw new NotFoundError('Housekeeping task', taskId);
    if (task.status !== 'IN_PROGRESS') throw new BusinessRuleError('Task must be in progress to complete');

    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      await task.update({
        status: 'COMPLETED',
        completed_at: new Date(),
      } as any, { transaction });

      // Update room status to INSPECTION
      const room = await Room.findByPk(task.room_id, { transaction });
      if (room && room.status === 'CLEANING') {
        await room.update({ status: 'INSPECTION' }, { transaction });
      }

      await transaction.commit();
      return this.findById(taskId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async inspect(taskId: string, inspectedBy: string): Promise<HousekeepingTask> {
    const task = await HousekeepingTask.findByPk(taskId);
    if (!task) throw new NotFoundError('Housekeeping task', taskId);
    if (task.status !== 'COMPLETED') throw new BusinessRuleError('Task must be completed to inspect');

    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      await task.update({
        status: 'INSPECTED',
        inspected_by: inspectedBy,
        inspected_at: new Date(),
      } as any, { transaction });

      // Update room status to VACANT_CLEAN
      const room = await Room.findByPk(task.room_id, { transaction });
      if (room && room.status === 'INSPECTION') {
        await room.update({ status: 'VACANT_CLEAN' }, { transaction });
      }

      await transaction.commit();
      return this.findById(taskId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export const housekeepingService = new HousekeepingService();
