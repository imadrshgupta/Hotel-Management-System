import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Payment extends TenantModel {
  declare folio_id: string | null;
  declare stay_id: string | null;
  declare guest_id: string;
  declare amount: number;
  declare method: string;
  declare status: string;
  declare reference_number: string | null;
  declare card_last_four: string | null;
  declare card_type: string | null;
  declare notes: string | null;
  declare processed_by: string | null;
  declare processed_at: Date;

  static initialize(sequelize: Sequelize): void {
    Payment.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        folio_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'folios', key: 'id' },
        },
        stay_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'stays', key: 'id' },
        },
        guest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'guests', key: 'id' },
        },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        method: { type: DataTypes.STRING(30), allowNull: false },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'COMPLETED' },
        reference_number: { type: DataTypes.STRING(100), allowNull: true },
        card_last_four: { type: DataTypes.STRING(4), allowNull: true },
        card_type: { type: DataTypes.STRING(20), allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        processed_by: { type: DataTypes.UUID, allowNull: true },
        processed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'payments',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['folio_id'] },
          { fields: ['stay_id'] },
          { fields: ['guest_id'] },
          { fields: ['status'] },
          { fields: ['method'] },
          { fields: ['processed_at'] },
        ],
      }
    );
  }

  static associate(): void {
    Payment.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Payment.belongsTo(require('./folio.model').Folio, {
      foreignKey: 'folio_id',
      as: 'folio',
    });
    Payment.belongsTo(require('./stay.model').Stay, {
      foreignKey: 'stay_id',
      as: 'stay',
    });
    Payment.belongsTo(require('./guest.model').Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
    });
  }
}
