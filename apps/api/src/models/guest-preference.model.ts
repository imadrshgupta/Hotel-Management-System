import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class GuestPreference extends BaseModel {
  declare guest_id: string;
  declare preference_key: string;
  declare preference_value: string;

  static initialize(sequelize: Sequelize): void {
    GuestPreference.init(
      {
        id: UUIDPrimaryKey,
        guest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'guests', key: 'id' },
        },
        preference_key: { type: DataTypes.STRING(100), allowNull: false },
        preference_value: { type: DataTypes.TEXT, allowNull: false },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'guest_preferences',
        indexes: [
          { fields: ['guest_id'] },
          { unique: true, fields: ['guest_id', 'preference_key'] },
        ],
      }
    );
  }

  static associate(): void {
    GuestPreference.belongsTo(require('./guest.model').Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
    });
  }
}
