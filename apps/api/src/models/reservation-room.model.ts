import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class ReservationRoom extends BaseModel {
  declare reservation_id: string;
  declare room_id: string | null;
  declare room_type_id: string;
  declare rate: number;
  declare rate_per_night: number;
  declare nights: number;
  declare check_in_date: Date;
  declare check_out_date: Date;
  declare adults: number;
  declare children: number;
  declare status: string;
  declare assigned_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    ReservationRoom.init(
      {
        id: UUIDPrimaryKey,
        reservation_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'reservations', key: 'id' },
        },
        room_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'rooms', key: 'id' },
        },
        room_type_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'room_types', key: 'id' },
        },
        rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        rate_per_night: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        nights: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        check_in_date: { type: DataTypes.DATEONLY, allowNull: false },
        check_out_date: { type: DataTypes.DATEONLY, allowNull: false },
        adults: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        children: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PENDING' },
        assigned_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'reservation_rooms',
        indexes: [
          { fields: ['reservation_id'] },
          { fields: ['room_id'] },
          { fields: ['room_type_id'] },
          { fields: ['status'] },
        ],
      }
    );
  }

  static associate(): void {
    ReservationRoom.belongsTo(require('./reservation.model').Reservation, {
      foreignKey: 'reservation_id',
      as: 'reservation',
    });
    ReservationRoom.belongsTo(require('./room.model').Room, {
      foreignKey: 'room_id',
      as: 'room',
    });
    ReservationRoom.belongsTo(require('./room-type.model').RoomType, {
      foreignKey: 'room_type_id',
      as: 'roomType',
    });
  }
}
