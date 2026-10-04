import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Room extends TenantModel {
  declare room_type_id: string;
  declare floor_id: string | null;
  declare number: string;
  declare name: string | null;
  declare status: string;
  declare is_active: boolean;
  declare is_smoking: boolean;
  declare is_accessible: boolean;
  declare has_balcony: boolean;
  declare connecting_room_id: string | null;
  declare notes: string | null;
  declare rate_override: number | null;
  declare last_maintained_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    Room.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        room_type_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'room_types', key: 'id' },
        },
        floor_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'floors', key: 'id' },
        },
        number: { type: DataTypes.STRING(20), allowNull: false },
        name: { type: DataTypes.STRING(100), allowNull: true },
        status: {
          type: DataTypes.STRING(30),
          allowNull: false,
          defaultValue: 'VACANT_CLEAN',
        },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        is_smoking: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        is_accessible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        has_balcony: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        connecting_room_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'rooms', key: 'id' },
        },
        notes: { type: DataTypes.TEXT, allowNull: true },
        rate_override: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        last_maintained_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'rooms',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['property_id', 'number'] },
          { fields: ['room_type_id'] },
          { fields: ['floor_id'] },
          { fields: ['status'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(): void {
    Room.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Room.belongsTo(require('./room-type.model').RoomType, {
      foreignKey: 'room_type_id',
      as: 'roomType',
    });
    Room.belongsTo(require('./floor.model').Floor, {
      foreignKey: 'floor_id',
      as: 'floor',
    });
    Room.belongsTo(Room, {
      foreignKey: 'connecting_room_id',
      as: 'connectingRoom',
    });
    Room.hasMany(require('./room-status-history.model').RoomStatusHistory, {
      foreignKey: 'room_id',
      as: 'statusHistory',
    });
    Room.hasMany(require('./room-amenity.model').RoomAmenity, {
      foreignKey: 'room_id',
      as: 'amenities',
    });
  }
}
