import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class StockTransaction extends TenantModel {
  declare inventory_item_id: string;
  declare transaction_type: string;
  declare quantity: number;
  declare unit_cost: number;
  declare total_cost: number;
  declare reference_type: string | null;
  declare reference_id: string | null;
  declare from_location: string | null;
  declare to_location: string | null;
  declare notes: string | null;
  declare performed_by: string;

  static initialize(sequelize: Sequelize): void {
    StockTransaction.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        inventory_item_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'inventory_items', key: 'id' },
        },
        transaction_type: { type: DataTypes.STRING(30), allowNull: false },
        quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
        unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        total_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        reference_type: { type: DataTypes.STRING(50), allowNull: true },
        reference_id: { type: DataTypes.UUID, allowNull: true },
        from_location: { type: DataTypes.STRING(100), allowNull: true },
        to_location: { type: DataTypes.STRING(100), allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        performed_by: { type: DataTypes.UUID, allowNull: false },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'stock_transactions',
        indexes: [
          { fields: ['property_id'] },
          { fields: ['inventory_item_id'] },
          { fields: ['transaction_type'] },
          { fields: ['reference_type', 'reference_id'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(): void {
    StockTransaction.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    StockTransaction.belongsTo(require('./inventory-item.model').InventoryItem, {
      foreignKey: 'inventory_item_id',
      as: 'inventoryItem',
    });
  }
}
