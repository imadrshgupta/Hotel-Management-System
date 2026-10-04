import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Guest extends TenantModel {
  declare first_name: string;
  declare last_name: string;
  declare email: string | null;
  declare phone: string | null;
  declare date_of_birth: Date | null;
  declare gender: string | null;
  declare nationality: string | null;
  declare id_type: string | null;
  declare id_number: string | null;
  declare id_expiry: Date | null;
  declare address: string | null;
  declare city: string | null;
  declare state: string | null;
  declare country: string | null;
  declare postal_code: string | null;
  declare company_name: string | null;
  declare tax_id: string | null;
  declare vip_status: string | null;
  declare notes: string | null;
  declare total_stays: number;
  declare total_revenue: number;
  declare last_stay_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    Guest.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        first_name: { type: DataTypes.STRING(100), allowNull: false },
        last_name: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(255), allowNull: true },
        phone: { type: DataTypes.STRING(50), allowNull: true },
        date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
        gender: { type: DataTypes.STRING(20), allowNull: true },
        nationality: { type: DataTypes.STRING(100), allowNull: true },
        id_type: { type: DataTypes.STRING(50), allowNull: true },
        id_number: { type: DataTypes.STRING(100), allowNull: true },
        id_expiry: { type: DataTypes.DATEONLY, allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
        city: { type: DataTypes.STRING(100), allowNull: true },
        state: { type: DataTypes.STRING(100), allowNull: true },
        country: { type: DataTypes.STRING(100), allowNull: true },
        postal_code: { type: DataTypes.STRING(20), allowNull: true },
        company_name: { type: DataTypes.STRING(255), allowNull: true },
        tax_id: { type: DataTypes.STRING(100), allowNull: true },
        vip_status: { type: DataTypes.STRING(20), allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        total_stays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        total_revenue: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        last_stay_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'guests',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { fields: ['email'] },
          { fields: ['phone'] },
          { fields: ['last_name', 'first_name'] },
          { fields: ['company_name'] },
          { fields: ['vip_status'] },
        ],
      }
    );
  }

  static associate(): void {
    Guest.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Guest.hasMany(require('./guest-document.model').GuestDocument, {
      foreignKey: 'guest_id',
      as: 'documents',
    });
    Guest.hasMany(require('./guest-preference.model').GuestPreference, {
      foreignKey: 'guest_id',
      as: 'preferences',
    });
    Guest.hasMany(require('./reservation-guest.model').ReservationGuest, {
      foreignKey: 'guest_id',
      as: 'reservations',
    });
    Guest.hasMany(require('./stay-guest.model').StayGuest, {
      foreignKey: 'guest_id',
      as: 'stays',
    });
  }
}
