import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class PurchaseOrderItem extends BaseModel {
  declare purchase_order_id: string;
  declare inventory_item_id: string;
  declare quantity: number;
  declare unit_price: number;
  declare tax_amount: number;
  declare total_amount: number;
  declare received_quantity: number;
  declare notes: string | null;

  static initialize(sequelize: Sequelize): void {
    PurchaseOrderItem.init(
      {
        id: UUIDPrimaryKey,
        purchase_order_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'purchase_orders', key: 'id' },
        },
        inventory_item_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'inventory_items', key: 'id' },
        },
        quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
        unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        received_quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
        notes: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'purchase_order_items',
        indexes: [
          { fields: ['purchase_order_id'] },
          { fields: ['inventory_item_id'] },
        ],
      }
    );
  }

  static associate(): void {
    PurchaseOrderItem.belongsTo(require('./purchase-order.model').PurchaseOrder, {
      foreignKey: 'purchase_order_id',
      as: 'purchaseOrder',
    });
    PurchaseOrderItem.belongsTo(require('./inventory-item.model').InventoryItem, {
      foreignKey: 'inventory_item_id',
      as: 'inventoryItem',
    });
  }
}
