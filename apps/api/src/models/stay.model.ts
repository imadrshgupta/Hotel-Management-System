import { DataTypes, Sequelize } from 'sequelize';
import { AuditedModel, UUIDPrimaryKey, AuditedFields, TimestampFields } from './base.model';

export class Stay extends AuditedModel {
  declare reservation_id: string;
  declare room_id: string;
  declare guest_id: string;
  declare check_in_date: Date;
  declare check_out_date: Date;
  declare actual_check_in: Date | null;
  declare actual_check_out: Date | null;
  declare status: string;
  declare adults: number;
  declare children: number;
  declare rate: number;
  declare notes: string | null;

  static initialize(sequelize: Sequelize): void {
    Stay.init(
      {
        id: UUIDPrimaryKey,
        ...AuditedFields,
        reservation_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'reservations', key: 'id' },
        },
        room_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'rooms', key: 'id' },
        },
        guest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'guests', key: 'id' },
        },
        check_in_date: { type: DataTypes.DATEONLY, allowNull: false },
        check_out_date: { type: DataTypes.DATEONLY, allowNull: false },
        actual_check_in: { type: DataTypes.DATE, allowNull: true },
        actual_check_out: { type: DataTypes.DATE, allowNull: true },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
        adults: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        children: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        notes: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'stays',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['reservation_id'] },
          { fields: ['room_id'] },
          { fields: ['guest_id'] },
          { fields: ['status'] },
          { fields: ['check_in_date'] },
          { fields: ['check_out_date'] },
        ],
      }
    );
  }

  static associate(): void {
    Stay.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Stay.belongsTo(require('./reservation.model').Reservation, {
      foreignKey: 'reservation_id',
      as: 'reservation',
    });
    Stay.belongsTo(require('./room.model').Room, {
      foreignKey: 'room_id',
      as: 'room',
    });
    Stay.belongsTo(require('./guest.model').Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
    });
    Stay.hasMany(require('./stay-guest.model').StayGuest, {
      foreignKey: 'stay_id',
      as: 'guests',
    });
    Stay.hasOne(require('./folio.model').Folio, {
      foreignKey: 'stay_id',
      as: 'folio',
    });
  }
}
