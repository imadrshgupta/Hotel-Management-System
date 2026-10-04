import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class RoomStatusHistory extends BaseModel {
  declare room_id: string;
  declare property_id: string;
  declare from_status: string;
  declare to_status: string;
  declare changed_by: string | null;
  declare reason: string | null;

  static initialize(sequelize: Sequelize): void {
    RoomStatusHistory.init(
      {
        id: UUIDPrimaryKey,
        room_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'rooms', key: 'id' },
        },
        property_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'properties', key: 'id' },
        },
        from_status: { type: DataTypes.STRING(30), allowNull: false },
        to_status: { type: DataTypes.STRING(30), allowNull: false },
        changed_by: { type: DataTypes.UUID, allowNull: true },
        reason: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'room_status_history',
        indexes: [
          { fields: ['room_id'] },
          { fields: ['property_id'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(): void {
    RoomStatusHistory.belongsTo(require('./room.model').Room, {
      foreignKey: 'room_id',
      as: 'room',
    });
  }
}
