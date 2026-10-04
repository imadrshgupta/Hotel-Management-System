import { DataTypes, Sequelize } from 'sequelize';
import { AuditedModel, UUIDPrimaryKey, AuditedFields, TimestampFields } from './base.model';

export class GoodsReceipt extends AuditedModel {
  declare purchase_order_id: string;
  declare receipt_number: string;
  declare received_date: Date;
  declare status: string;
  declare notes: string | null;

  static initialize(sequelize: Sequelize): void {
    GoodsReceipt.init(
      {
        id: UUIDPrimaryKey,
        ...AuditedFields,
        purchase_order_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'purchase_orders', key: 'id' },
        },
        receipt_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        received_date: { type: DataTypes.DATEONLY, allowNull: false },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'RECEIVED' },
        notes: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'goods_receipts',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['receipt_number'] },
          { fields: ['purchase_order_id'] },
          { fields: ['received_date'] },
        ],
      }
    );
  }

  static associate(): void {
    GoodsReceipt.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    GoodsReceipt.belongsTo(require('./purchase-order.model').PurchaseOrder, {
      foreignKey: 'purchase_order_id',
      as: 'purchaseOrder',
    });
    GoodsReceipt.hasMany(require('./goods-receipt-item.model').GoodsReceiptItem, {
      foreignKey: 'goods_receipt_id',
      as: 'items',
    });
  }
}
