import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Floor extends TenantModel {
  declare name: string;
  declare code: string;
  declare level: number;
  declare is_active: boolean;
  declare description: string | null;

  static initialize(sequelize: Sequelize): void {
    Floor.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        level: { type: DataTypes.INTEGER, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'floors',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['property_id', 'code'] },
          { fields: ['level'] },
        ],
      }
    );
  }

  static associate(): void {
    Floor.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Floor.hasMany(require('./room.model').Room, {
      foreignKey: 'floor_id',
      as: 'rooms',
    });
  }
}
