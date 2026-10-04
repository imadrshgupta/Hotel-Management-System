import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Refund extends TenantModel {
  declare payment_id: string;
  declare amount: number;
  declare reason: string;
  declare status: string;
  declare reference_number: string | null;
  declare processed_by: string | null;
  declare processed_at: Date;

  static initialize(sequelize: Sequelize): void {
    Refund.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        payment_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'payments', key: 'id' },
        },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        reason: { type: DataTypes.TEXT, allowNull: false },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'COMPLETED' },
        reference_number: { type: DataTypes.STRING(100), allowNull: true },
        processed_by: { type: DataTypes.UUID, allowNull: true },
        processed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'refunds',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['payment_id'] },
          { fields: ['status'] },
          { fields: ['processed_at'] },
        ],
      }
    );
  }

  static associate(): void {
    Refund.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Refund.belongsTo(require('./payment.model').Payment, {
      foreignKey: 'payment_id',
      as: 'payment',
    });
  }
}
