import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class InventoryItem extends TenantModel {
  declare category_id: string;
  declare unit_id: string;
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare sku: string | null;
  declare barcode: string | null;
  declare current_stock: number;
  declare minimum_stock: number;
  declare maximum_stock: number;
  declare reorder_point: number;
  declare cost_price: number;
  declare selling_price: number;
  declare is_active: boolean;
  declare is_consumable: boolean;

  static initialize(sequelize: Sequelize): void {
    InventoryItem.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        category_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'inventory_categories', key: 'id' },
        },
        unit_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'units', key: 'id' },
        },
        name: { type: DataTypes.STRING(255), allowNull: false },
        code: { type: DataTypes.STRING(50), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        sku: { type: DataTypes.STRING(100), allowNull: true },
        barcode: { type: DataTypes.STRING(100), allowNull: true },
        current_stock: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
        minimum_stock: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
        maximum_stock: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
        reorder_point: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
        cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        is_consumable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'inventory_items',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['category_id'] },
          { fields: ['unit_id'] },
          { unique: true, fields: ['property_id', 'code'] },
          { fields: ['sku'] },
          { fields: ['barcode'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(): void {
    InventoryItem.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    InventoryItem.belongsTo(require('./inventory-category.model').InventoryCategory, {
      foreignKey: 'category_id',
      as: 'category',
    });
    InventoryItem.belongsTo(require('./unit.model').Unit, {
      foreignKey: 'unit_id',
      as: 'unit',
    });
    InventoryItem.hasMany(require('./stock-transaction.model').StockTransaction, {
      foreignKey: 'inventory_item_id',
      as: 'transactions',
    });
  }
}
