import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class ReservationGuest extends BaseModel {
  declare reservation_id: string;
  declare guest_id: string;
  declare is_primary: boolean;
  declare room_number: string | null;

  static initialize(sequelize: Sequelize): void {
    ReservationGuest.init(
      {
        id: UUIDPrimaryKey,
        reservation_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'reservations', key: 'id' },
        },
        guest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'guests', key: 'id' },
        },
        is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        room_number: { type: DataTypes.STRING(20), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'reservation_guests',
        indexes: [
          { fields: ['reservation_id'] },
          { fields: ['guest_id'] },
          { unique: true, fields: ['reservation_id', 'guest_id'] },
        ],
      }
    );
  }

  static associate(): void {
    ReservationGuest.belongsTo(require('./reservation.model').Reservation, {
      foreignKey: 'reservation_id',
      as: 'reservation',
    });
    ReservationGuest.belongsTo(require('./guest.model').Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
    });
  }
}
