import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class RoomAmenity extends BaseModel {
  declare room_id: string;
  declare amenity_name: string;
  declare amenity_value: string | null;

  static initialize(sequelize: Sequelize): void {
    RoomAmenity.init(
      {
        id: UUIDPrimaryKey,
        room_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'rooms', key: 'id' },
        },
        amenity_name: { type: DataTypes.STRING(100), allowNull: false },
        amenity_value: { type: DataTypes.STRING(255), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'room_amenities',
        indexes: [
          { fields: ['room_id'] },
        ],
      }
    );
  }

  static associate(): void {
    RoomAmenity.belongsTo(require('./room.model').Room, {
      foreignKey: 'room_id',
      as: 'room',
    });
  }
}
