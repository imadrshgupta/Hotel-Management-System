import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class HousekeepingTask extends TenantModel {
  declare room_id: string;
  declare task_type: string;
  declare priority: string;
  declare status: string;
  declare assigned_to: string | null;
  declare notes: string | null;
  declare started_at: Date | null;
  declare completed_at: Date | null;
  declare inspected_by: string | null;
  declare inspected_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    HousekeepingTask.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        room_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'rooms', key: 'id' },
        },
        task_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'CHECKOUT' },
        priority: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'MEDIUM' },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PENDING' },
        assigned_to: { type: DataTypes.UUID, allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        started_at: { type: DataTypes.DATE, allowNull: true },
        completed_at: { type: DataTypes.DATE, allowNull: true },
        inspected_by: { type: DataTypes.UUID, allowNull: true },
        inspected_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'housekeeping_tasks',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['room_id'] },
          { fields: ['status'] },
          { fields: ['assigned_to'] },
          { fields: ['task_type'] },
          { fields: ['priority'] },
        ],
      }
    );
  }

  static associate(): void {
    HousekeepingTask.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    HousekeepingTask.belongsTo(require('./room.model').Room, {
      foreignKey: 'room_id',
      as: 'room',
    });
  }
}
