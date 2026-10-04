import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class MaintenanceTicket extends TenantModel {
  declare room_id: string | null;
  declare title: string;
  declare description: string;
  declare category: string;
  declare priority: string;
  declare status: string;
  declare assigned_to: string | null;
  declare reported_by: string;
  declare notes: string | null;
  declare started_at: Date | null;
  declare resolved_at: Date | null;
  declare closed_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    MaintenanceTicket.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        room_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'rooms', key: 'id' },
        },
        title: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        category: { type: DataTypes.STRING(50), allowNull: false },
        priority: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'MEDIUM' },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'OPEN' },
        assigned_to: { type: DataTypes.UUID, allowNull: true },
        reported_by: { type: DataTypes.UUID, allowNull: false },
        notes: { type: DataTypes.TEXT, allowNull: true },
        started_at: { type: DataTypes.DATE, allowNull: true },
        resolved_at: { type: DataTypes.DATE, allowNull: true },
        closed_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'maintenance_tickets',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['room_id'] },
          { fields: ['status'] },
          { fields: ['priority'] },
          { fields: ['category'] },
          { fields: ['assigned_to'] },
        ],
      }
    );
  }

  static associate(): void {
    MaintenanceTicket.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    MaintenanceTicket.belongsTo(require('./room.model').Room, {
      foreignKey: 'room_id',
      as: 'room',
    });
  }
}
