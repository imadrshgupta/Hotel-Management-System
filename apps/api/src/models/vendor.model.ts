import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Vendor extends TenantModel {
  declare name: string;
  declare code: string;
  declare contact_person: string | null;
  declare email: string | null;
  declare phone: string | null;
  declare address: string | null;
  declare city: string | null;
  declare state: string | null;
  declare country: string | null;
  declare postal_code: string | null;
  declare tax_id: string | null;
  declare payment_terms: string | null;
  declare notes: string | null;
  declare is_active: boolean;
  declare rating: number | null;

  static initialize(sequelize: Sequelize): void {
    Vendor.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(255), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        contact_person: { type: DataTypes.STRING(255), allowNull: true },
        email: { type: DataTypes.STRING(255), allowNull: true },
        phone: { type: DataTypes.STRING(50), allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
        city: { type: DataTypes.STRING(100), allowNull: true },
        state: { type: DataTypes.STRING(100), allowNull: true },
        country: { type: DataTypes.STRING(100), allowNull: true },
        postal_code: { type: DataTypes.STRING(20), allowNull: true },
        tax_id: { type: DataTypes.STRING(100), allowNull: true },
        payment_terms: { type: DataTypes.STRING(100), allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        rating: { type: DataTypes.DECIMAL(3, 1), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'vendors',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['property_id', 'code'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(): void {
    Vendor.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  }
}
