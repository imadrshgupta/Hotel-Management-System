import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class BanquetHall extends TenantModel {
  declare name: string;
  declare code: string;
  declare capacity: number;
  declare area: number | null;
  declare floor: string | null;
  declare rate_per_hour: number;
  declare rate_per_day: number;
  declare is_active: boolean;
  declare amenities: string[] | null;
  declare image_url: string | null;

  static initialize(sequelize: Sequelize): void {
    BanquetHall.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        capacity: { type: DataTypes.INTEGER, allowNull: false },
        area: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        floor: { type: DataTypes.STRING(50), allowNull: true },
        rate_per_hour: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        rate_per_day: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        amenities: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
        image_url: { type: DataTypes.STRING(500), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'banquet_halls',
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
    BanquetHall.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    BanquetHall.hasMany(require('./banquet-event.model').BanquetEvent, {
      foreignKey: 'banquet_hall_id',
      as: 'events',
    });
  }
}
