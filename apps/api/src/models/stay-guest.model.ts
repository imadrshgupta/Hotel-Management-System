import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class StayGuest extends BaseModel {
  declare stay_id: string;
  declare guest_id: string;
  declare is_primary: boolean;

  static initialize(sequelize: Sequelize): void {
    StayGuest.init(
      {
        id: UUIDPrimaryKey,
        stay_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'stays', key: 'id' },
        },
        guest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'guests', key: 'id' },
        },
        is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'stay_guests',
        indexes: [
          { fields: ['stay_id'] },
          { fields: ['guest_id'] },
          { unique: true, fields: ['stay_id', 'guest_id'] },
        ],
      }
    );
  }

  static associate(): void {
    StayGuest.belongsTo(require('./stay.model').Stay, {
      foreignKey: 'stay_id',
      as: 'stay',
    });
    StayGuest.belongsTo(require('./guest.model').Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
    });
  }
}
