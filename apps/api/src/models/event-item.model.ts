import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class EventItem extends BaseModel {
  declare event_id: string;
  declare description: string;
  declare category: string;
  declare quantity: number;
  declare unit_price: number;
  declare amount: number;
  declare notes: string | null;

  static initialize(sequelize: Sequelize): void {
    EventItem.init(
      {
        id: UUIDPrimaryKey,
        event_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'banquet_events', key: 'id' },
        },
        description: { type: DataTypes.STRING(500), allowNull: false },
        category: { type: DataTypes.STRING(50), allowNull: false },
        quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
        unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        notes: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'event_items',
        indexes: [
          { fields: ['event_id'] },
        ],
      }
    );
  }

  static associate(): void {
    EventItem.belongsTo(require('./banquet-event.model').BanquetEvent, {
      foreignKey: 'event_id',
      as: 'event',
    });
  }
}
