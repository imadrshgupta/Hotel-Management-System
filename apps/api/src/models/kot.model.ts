import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Kot extends TenantModel {
  declare order_id: string;
  declare kot_number: string;
  declare status: string;
  declare priority: string;
  declare notes: string | null;
  declare printed_at: Date | null;
  declare started_at: Date | null;
  declare ready_at: Date | null;
  declare served_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    Kot.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        order_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'orders', key: 'id' },
        },
        kot_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PRINTED' },
        priority: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'NORMAL' },
        notes: { type: DataTypes.TEXT, allowNull: true },
        printed_at: { type: DataTypes.DATE, allowNull: true },
        started_at: { type: DataTypes.DATE, allowNull: true },
        ready_at: { type: DataTypes.DATE, allowNull: true },
        served_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'kot',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['kot_number'] },
          { fields: ['order_id'] },
          { fields: ['status'] },
          { fields: ['printed_at'] },
        ],
      }
    );
  }

  static associate(): void {
    Kot.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Kot.belongsTo(require('./order.model').Order, {
      foreignKey: 'order_id',
      as: 'order',
    });
  }
}
