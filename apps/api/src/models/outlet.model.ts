import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Outlet extends TenantModel {
  declare name: string;
  declare code: string;
  declare type: string;
  declare is_active: boolean;
  declare operating_hours: Record<string, any> | null;

  static initialize(sequelize: Sequelize): void {
    Outlet.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        type: { type: DataTypes.STRING(30), allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        operating_hours: { type: DataTypes.JSONB, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'outlets',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['property_id', 'code'] },
        ],
      }
    );
  }

  static associate(): void {
    Outlet.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Outlet.hasMany(require('./restaurant.model').Restaurant, {
      foreignKey: 'outlet_id',
      as: 'restaurants',
    });
  }
}
