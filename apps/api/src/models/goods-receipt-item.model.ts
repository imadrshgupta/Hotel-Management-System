import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class GoodsReceiptItem extends BaseModel {
  declare goods_receipt_id: string;
  declare inventory_item_id: string;
  declare ordered_quantity: number;
  declare received_quantity: number;
  declare unit_cost: number;
  declare total_cost: number;
  declare notes: string | null;

  static initialize(sequelize: Sequelize): void {
    GoodsReceiptItem.init(
      {
        id: UUIDPrimaryKey,
        goods_receipt_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'goods_receipts', key: 'id' },
        },
        inventory_item_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'inventory_items', key: 'id' },
        },
        ordered_quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
        received_quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
        unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        total_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        notes: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'goods_receipt_items',
        indexes: [
          { fields: ['goods_receipt_id'] },
          { fields: ['inventory_item_id'] },
        ],
      }
    );
  }

  static associate(): void {
    GoodsReceiptItem.belongsTo(require('./goods-receipt.model').GoodsReceipt, {
      foreignKey: 'goods_receipt_id',
      as: 'goodsReceipt',
    });
    GoodsReceiptItem.belongsTo(require('./inventory-item.model').InventoryItem, {
      foreignKey: 'inventory_item_id',
      as: 'inventoryItem',
    });
  }
}
