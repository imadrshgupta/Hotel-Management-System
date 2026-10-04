import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class InventoryCategory extends TenantModel {
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare is_active: boolean;

  static initialize(sequelize: Sequelize): void {
    InventoryCategory.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'inventory_categories',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['property_id', 'code'] },
        ],
      }
    );
  }

  static associate(): void {
    InventoryCategory.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    InventoryCategory.hasMany(require('./inventory-item.model').InventoryItem, {
      foreignKey: 'category_id',
      as: 'items',
    });
  }
}
