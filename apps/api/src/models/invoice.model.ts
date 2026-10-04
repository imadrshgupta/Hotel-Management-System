import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Invoice extends TenantModel {
  declare invoice_number: string;
  declare stay_id: string;
  declare guest_id: string;
  declare status: string;
  declare subtotal: number;
  declare tax_amount: number;
  declare discount_amount: number;
  declare total_amount: number;
  declare paid_amount: number;
  declare balance: number;
  declare notes: string | null;
  declare issued_at: Date;
  declare paid_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    Invoice.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        invoice_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        stay_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'stays', key: 'id' },
        },
        guest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'guests', key: 'id' },
        },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'DRAFT' },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        paid_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        notes: { type: DataTypes.TEXT, allowNull: true },
        issued_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        paid_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'invoices',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['invoice_number'] },
          { fields: ['stay_id'] },
          { fields: ['guest_id'] },
          { fields: ['status'] },
          { fields: ['issued_at'] },
        ],
      }
    );
  }

  static associate(): void {
    Invoice.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Invoice.belongsTo(require('./stay.model').Stay, {
      foreignKey: 'stay_id',
      as: 'stay',
    });
    Invoice.belongsTo(require('./guest.model').Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
    });
  }
}
