import { DataTypes, Sequelize } from 'sequelize';
import { AuditedModel, UUIDPrimaryKey, AuditedFields, TimestampFields } from './base.model';

export class BanquetEvent extends AuditedModel {
  declare banquet_hall_id: string;
  declare event_name: string;
  declare event_type: string;
  declare status: string;
  declare event_date: Date;
  declare start_time: string;
  declare end_time: string;
  declare guest_count: number;
  declare contact_name: string;
  declare contact_email: string | null;
  declare contact_phone: string;
  declare company_name: string | null;
  declare hall_charges: number;
  declare food_charges: number;
  declare additional_charges: number;
  declare total_amount: number;
  declare advance_paid: number;
  declare discount_amount: number;
  declare tax_amount: number;
  declare net_amount: number;
  declare special_requests: string | null;
  declare notes: string | null;
  declare cancelled_at: Date | null;
  declare cancellation_reason: string | null;

  static initialize(sequelize: Sequelize): void {
    BanquetEvent.init(
      {
        id: UUIDPrimaryKey,
        ...AuditedFields,
        banquet_hall_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'banquet_halls', key: 'id' },
        },
        event_name: { type: DataTypes.STRING(255), allowNull: false },
        event_type: { type: DataTypes.STRING(50), allowNull: false },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'INQUIRY' },
        event_date: { type: DataTypes.DATEONLY, allowNull: false },
        start_time: { type: DataTypes.STRING(5), allowNull: false },
        end_time: { type: DataTypes.STRING(5), allowNull: false },
        guest_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        contact_name: { type: DataTypes.STRING(255), allowNull: false },
        contact_email: { type: DataTypes.STRING(255), allowNull: true },
        contact_phone: { type: DataTypes.STRING(50), allowNull: false },
        company_name: { type: DataTypes.STRING(255), allowNull: true },
        hall_charges: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        food_charges: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        additional_charges: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        advance_paid: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        net_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        special_requests: { type: DataTypes.TEXT, allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        cancelled_at: { type: DataTypes.DATE, allowNull: true },
        cancellation_reason: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'banquet_events',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['banquet_hall_id'] },
          { fields: ['status'] },
          { fields: ['event_date'] },
          { fields: ['event_type'] },
        ],
      }
    );
  }

  static associate(): void {
    BanquetEvent.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    BanquetEvent.belongsTo(require('./banquet-hall.model').BanquetHall, {
      foreignKey: 'banquet_hall_id',
      as: 'banquetHall',
    });
    BanquetEvent.hasMany(require('./event-item.model').EventItem, {
      foreignKey: 'event_id',
      as: 'items',
    });
  }
}
