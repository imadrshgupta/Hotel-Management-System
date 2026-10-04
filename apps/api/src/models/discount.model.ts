import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Discount extends TenantModel {
  declare name: string;
  declare code: string;
  declare type: string;
  declare value: number;
  declare max_discount_amount: number | null;
  declare min_booking_amount: number | null;
  declare start_date: Date | null;
  declare end_date: Date | null;
  declare is_active: boolean;
  declare applies_to: string[] | null;
  declare max_uses: number | null;
  declare current_uses: number;

  static initialize(sequelize: Sequelize): void {
    Discount.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        type: { type: DataTypes.STRING(20), allowNull: false },
        value: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        max_discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        min_booking_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        start_date: { type: DataTypes.DATEONLY, allowNull: true },
        end_date: { type: DataTypes.DATEONLY, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        applies_to: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
        max_uses: { type: DataTypes.INTEGER, allowNull: true },
        current_uses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'discounts',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['property_id', 'code'] },
          { fields: ['is_active'] },
          { fields: ['start_date', 'end_date'] },
        ],
      }
    );
  }

  static associate(): void {
    Discount.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  }
}
