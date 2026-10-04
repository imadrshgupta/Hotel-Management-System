import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Tax extends TenantModel {
  declare name: string;
  declare code: string;
  declare rate: number;
  declare type: string;
  declare is_inclusive: boolean;
  declare is_active: boolean;
  declare applies_to: string[] | null;

  static initialize(sequelize: Sequelize): void {
    Tax.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
        type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PERCENTAGE' },
        is_inclusive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        applies_to: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'taxes',
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
    Tax.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  }
}
