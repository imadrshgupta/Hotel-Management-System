import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Order extends TenantModel {
  declare order_number: string;
  declare restaurant_id: string;
  declare table_id: string | null;
  declare stay_id: string | null;
  declare room_number: string | null;
  declare order_type: string;
  declare status: string;
  declare guest_count: number;
  declare subtotal: number;
  declare tax_amount: number;
  declare discount_amount: number;
  declare total_amount: number;
  declare notes: string | null;
  declare ordered_by: string | null;

  static initialize(sequelize: Sequelize): void {
    Order.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        order_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        restaurant_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'restaurants', key: 'id' },
        },
        table_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'tables', key: 'id' },
        },
        stay_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'stays', key: 'id' },
        },
        room_number: { type: DataTypes.STRING(20), allowNull: true },
        order_type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'DINE_IN' },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PLACED' },
        guest_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        notes: { type: DataTypes.TEXT, allowNull: true },
        ordered_by: { type: DataTypes.UUID, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'orders',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['order_number'] },
          { fields: ['restaurant_id'] },
          { fields: ['table_id'] },
          { fields: ['stay_id'] },
          { fields: ['status'] },
          { fields: ['order_type'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(): void {
    Order.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Order.belongsTo(require('./restaurant.model').Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
    });
    Order.belongsTo(require('./table.model').Table, {
      foreignKey: 'table_id',
      as: 'table',
    });
    Order.belongsTo(require('./stay.model').Stay, {
      foreignKey: 'stay_id',
      as: 'stay',
    });
    Order.hasMany(require('./order-item.model').OrderItem, {
      foreignKey: 'order_id',
      as: 'items',
    });
    Order.hasOne(require('./kot.model').Kot, {
      foreignKey: 'order_id',
      as: 'kot',
    });
  }
}
