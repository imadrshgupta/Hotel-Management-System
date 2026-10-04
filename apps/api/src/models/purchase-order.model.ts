import { DataTypes, Sequelize } from 'sequelize';
import { AuditedModel, UUIDPrimaryKey, AuditedFields, TimestampFields } from './base.model';

export class PurchaseOrder extends AuditedModel {
  declare po_number: string;
  declare vendor_id: string;
  declare status: string;
  declare order_date: Date;
  declare expected_delivery_date: Date | null;
  declare actual_delivery_date: Date | null;
  declare subtotal: number;
  declare tax_amount: number;
  declare total_amount: number;
  declare notes: string | null;
  declare approved_by: string | null;
  declare approved_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    PurchaseOrder.init(
      {
        id: UUIDPrimaryKey,
        ...AuditedFields,
        po_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        vendor_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'vendors', key: 'id' },
        },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'DRAFT' },
        order_date: { type: DataTypes.DATEONLY, allowNull: false },
        expected_delivery_date: { type: DataTypes.DATEONLY, allowNull: true },
        actual_delivery_date: { type: DataTypes.DATEONLY, allowNull: true },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        notes: { type: DataTypes.TEXT, allowNull: true },
        approved_by: { type: DataTypes.UUID, allowNull: true },
        approved_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'purchase_orders',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['po_number'] },
          { fields: ['vendor_id'] },
          { fields: ['status'] },
          { fields: ['order_date'] },
        ],
      }
    );
  }

  static associate(): void {
    PurchaseOrder.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    PurchaseOrder.belongsTo(require('./vendor.model').Vendor, {
      foreignKey: 'vendor_id',
      as: 'vendor',
    });
    PurchaseOrder.hasMany(require('./purchase-order-item.model').PurchaseOrderItem, {
      foreignKey: 'purchase_order_id',
      as: 'items',
    });
    PurchaseOrder.hasMany(require('./goods-receipt.model').GoodsReceipt, {
      foreignKey: 'purchase_order_id',
      as: 'receipts',
    });
  }
}
