import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Restaurant extends TenantModel {
  declare outlet_id: string;
  declare name: string;
  declare code: string;
  declare is_active: boolean;
  declare is_active_for_room_service: boolean;

  static initialize(sequelize: Sequelize): void {
    Restaurant.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        outlet_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'outlets', key: 'id' },
        },
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        is_active_for_room_service: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'restaurants',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['outlet_id'] },
          { unique: true, fields: ['property_id', 'code'] },
        ],
      }
    );
  }

  static associate(): void {
    Restaurant.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Restaurant.belongsTo(require('./outlet.model').Outlet, {
      foreignKey: 'outlet_id',
      as: 'outlet',
    });
    Restaurant.hasMany(require('./table.model').Table, {
      foreignKey: 'restaurant_id',
      as: 'tables',
    });
  }
}
