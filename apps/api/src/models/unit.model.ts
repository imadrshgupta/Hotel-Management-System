import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class Unit extends BaseModel {
  declare name: string;
  declare symbol: string;
  declare base_unit: string | null;
  declare conversion_factor: number;

  static initialize(sequelize: Sequelize): void {
    Unit.init(
      {
        id: UUIDPrimaryKey,
        name: { type: DataTypes.STRING(50), allowNull: false },
        symbol: { type: DataTypes.STRING(10), allowNull: false, unique: true },
        base_unit: { type: DataTypes.STRING(50), allowNull: true },
        conversion_factor: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 1 },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'units',
        indexes: [
          { unique: true, fields: ['symbol'] },
        ],
      }
    );
  }

  static associate(): void {
    // No associations needed
  }
}
