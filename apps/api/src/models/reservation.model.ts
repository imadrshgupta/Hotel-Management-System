import { DataTypes, Sequelize } from 'sequelize';
import { AuditedModel, UUIDPrimaryKey, AuditedFields, TimestampFields } from './base.model';

export class Reservation extends AuditedModel {
  declare confirmation_number: string;
  declare status: string;
  declare check_in_date: Date;
  declare check_out_date: Date;
  declare adults: number;
  declare children: number;
  declare rooms_count: number;
  declare source: string;
  declare room_type_id: string;
  declare rate_plan_id: string | null;
  declare total_amount: number;
  declare advance_paid: number;
  declare discount_amount: number;
  declare tax_amount: number;
  declare net_amount: number;
  declare special_requests: string | null;
  declare notes: string | null;
  declare cancelled_at: Date | null;
  declare cancelled_by: string | null;
  declare cancellation_reason: string | null;
  declare no_show_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    Reservation.init(
      {
        id: UUIDPrimaryKey,
        ...AuditedFields,
        confirmation_number: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'INQUIRY',
        },
        check_in_date: { type: DataTypes.DATEONLY, allowNull: false },
        check_out_date: { type: DataTypes.DATEONLY, allowNull: false },
        adults: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        children: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        rooms_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        source: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'DIRECT' },
        room_type_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'room_types', key: 'id' },
        },
        rate_plan_id: { type: DataTypes.UUID, allowNull: true },
        total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        advance_paid: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        net_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        special_requests: { type: DataTypes.TEXT, allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        cancelled_at: { type: DataTypes.DATE, allowNull: true },
        cancelled_by: { type: DataTypes.UUID, allowNull: true },
        cancellation_reason: { type: DataTypes.TEXT, allowNull: true },
        no_show_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'reservations',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['confirmation_number'] },
          { fields: ['status'] },
          { fields: ['check_in_date'] },
          { fields: ['check_out_date'] },
          { fields: ['room_type_id'] },
          { fields: ['source'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(): void {
    Reservation.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Reservation.belongsTo(require('./room-type.model').RoomType, {
      foreignKey: 'room_type_id',
      as: 'roomType',
    });
    Reservation.belongsTo(require('./user.model').User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    Reservation.hasMany(require('./reservation-room.model').ReservationRoom, {
      foreignKey: 'reservation_id',
      as: 'rooms',
    });
    Reservation.hasMany(require('./reservation-guest.model').ReservationGuest, {
      foreignKey: 'reservation_id',
      as: 'guests',
    });
    Reservation.hasOne(require('./stay.model').Stay, {
      foreignKey: 'reservation_id',
      as: 'stay',
    });
  }
}
