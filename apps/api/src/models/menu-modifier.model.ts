import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class MenuModifier extends BaseModel {
  declare menu_item_id: string;
  declare name: string;
  declare price: number;
  declare is_default: boolean;
  declare is_active: boolean;

  static initialize(sequelize: Sequelize): void {
    MenuModifier.init(
      {
        id: UUIDPrimaryKey,
        menu_item_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'menu_items', key: 'id' },
        },
        name: { type: DataTypes.STRING(100), allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'menu_modifiers',
        indexes: [
          { fields: ['menu_item_id'] },
        ],
      }
    );
  }

  static associate(): void {
    MenuModifier.belongsTo(require('./menu-item.model').MenuItem, {
      foreignKey: 'menu_item_id',
      as: 'menuItem',
    });
  }
}
