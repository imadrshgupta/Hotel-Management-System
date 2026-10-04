import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class MenuItem extends TenantModel {
  declare category_id: string;
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare price: number;
  declare cost_price: number;
  declare is_available: boolean;
  declare is_veg: boolean;
  declare preparation_time: number | null;
  declare image_url: string | null;
  declare tax_ids: string[] | null;
  declare sort_order: number;

  static initialize(sequelize: Sequelize): void {
    MenuItem.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        category_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'menu_categories', key: 'id' },
        },
        name: { type: DataTypes.STRING(255), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        is_veg: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        preparation_time: { type: DataTypes.INTEGER, allowNull: true },
        image_url: { type: DataTypes.STRING(500), allowNull: true },
        tax_ids: { type: DataTypes.ARRAY(DataTypes.UUID), allowNull: true },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'menu_items',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['category_id'] },
          { unique: true, fields: ['property_id', 'code'] },
          { fields: ['is_available'] },
        ],
      }
    );
  }

  static associate(): void {
    MenuItem.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    MenuItem.belongsTo(require('./menu-category.model').MenuCategory, {
      foreignKey: 'category_id',
      as: 'category',
    });
    MenuItem.hasMany(require('./menu-modifier.model').MenuModifier, {
      foreignKey: 'menu_item_id',
      as: 'modifiers',
    });
  }
}
