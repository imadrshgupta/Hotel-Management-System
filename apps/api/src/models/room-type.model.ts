import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class RoomType extends TenantModel {
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare base_rate: number;
  declare max_occupancy: number;
  declare max_adults: number;
  declare max_children: number;
  declare bed_count: number;
  declare bed_type: string | null;
  declare room_area: number | null;
  declare is_active: boolean;
  declare amenities: string[] | null;
  declare image_url: string | null;
  declare sort_order: number;

  static initialize(sequelize: Sequelize): void {
    RoomType.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        base_rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        max_occupancy: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
        max_adults: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
        max_children: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        bed_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        bed_type: { type: DataTypes.STRING(50), allowNull: true },
        room_area: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        amenities: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
        image_url: { type: DataTypes.STRING(500), allowNull: true },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'room_types',
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
    RoomType.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    RoomType.hasMany(require('./room.model').Room, {
      foreignKey: 'room_type_id',
      as: 'rooms',
    });
  }
}
