import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class OrderItem extends BaseModel {
  declare order_id: string;
  declare menu_item_id: string;
  declare name: string;
  declare quantity: number;
  declare unit_price: number;
  declare amount: number;
  declare tax_amount: number;
  declare discount_amount: number;
  declare modifiers: Record<string, any>[] | null;
  declare special_instructions: string | null;
  declare status: string;

  static initialize(sequelize: Sequelize): void {
    OrderItem.init(
      {
        id: UUIDPrimaryKey,
        order_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'orders', key: 'id' },
        },
        menu_item_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'menu_items', key: 'id' },
        },
        name: { type: DataTypes.STRING(255), allowNull: false },
        quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
        unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        modifiers: { type: DataTypes.JSONB, allowNull: true },
        special_instructions: { type: DataTypes.TEXT, allowNull: true },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PLACED' },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'order_items',
        indexes: [
          { fields: ['order_id'] },
          { fields: ['menu_item_id'] },
          { fields: ['status'] },
        ],
      }
    );
  }

  static associate(): void {
    OrderItem.belongsTo(require('./order.model').Order, {
      foreignKey: 'order_id',
      as: 'order',
    });
    OrderItem.belongsTo(require('./menu-item.model').MenuItem, {
      foreignKey: 'menu_item_id',
      as: 'menuItem',
    });
  }
}
