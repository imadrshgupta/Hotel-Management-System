import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class MenuCategory extends TenantModel {
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare is_active: boolean;
  declare sort_order: number;
  declare image_url: string | null;

  static initialize(sequelize: Sequelize): void {
    MenuCategory.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        image_url: { type: DataTypes.STRING(500), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'menu_categories',
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
    MenuCategory.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    MenuCategory.hasMany(require('./menu-item.model').MenuItem, {
      foreignKey: 'category_id',
      as: 'items',
    });
  }
}
