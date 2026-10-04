import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Folio extends TenantModel {
  declare stay_id: string;
  declare folio_number: string;
  declare status: string;
  declare total_charges: number;
  declare total_payments: number;
  declare total_taxes: number;
  declare total_discounts: number;
  declare total_refunds: number;
  declare balance: number;

  static initialize(sequelize: Sequelize): void {
    Folio.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        stay_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'stays', key: 'id' },
        },
        folio_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'OPEN' },
        total_charges: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_payments: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_taxes: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_discounts: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_refunds: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'folios',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['folio_number'] },
          { fields: ['stay_id'] },
          { fields: ['status'] },
        ],
      }
    );
  }

  static associate(): void {
    Folio.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Folio.belongsTo(require('./stay.model').Stay, {
      foreignKey: 'stay_id',
      as: 'stay',
    });
    Folio.hasMany(require('./folio-item.model').FolioItem, {
      foreignKey: 'folio_id',
      as: 'items',
    });
    Folio.hasMany(require('./payment.model').Payment, {
      foreignKey: 'folio_id',
      as: 'payments',
    });
  }
}
