import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Table extends TenantModel {
  declare restaurant_id: string;
  declare number: string;
  declare capacity: number;
  declare status: string;
  declare section: string | null;

  static initialize(sequelize: Sequelize): void {
    Table.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        restaurant_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'restaurants', key: 'id' },
        },
        number: { type: DataTypes.STRING(20), allowNull: false },
        capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'AVAILABLE' },
        section: { type: DataTypes.STRING(50), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'tables',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['restaurant_id'] },
          { fields: ['status'] },
          { unique: true, fields: ['restaurant_id', 'number'] },
        ],
      }
    );
  }

  static associate(): void {
    Table.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Table.belongsTo(require('./restaurant.model').Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
    });
  }
}
