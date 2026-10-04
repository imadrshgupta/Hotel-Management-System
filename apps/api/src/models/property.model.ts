import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class Property extends BaseModel {
  declare organization_id: string;
  declare name: string;
  declare slug: string;
  declare email: string;
  declare phone: string | null;
  declare address: string | null;
  declare city: string | null;
  declare state: string | null;
  declare country: string | null;
  declare postal_code: string | null;
  declare timezone: string;
  declare currency: string;
  declare tax_id: string | null;
  declare is_active: boolean;
  declare settings: Record<string, any> | null;
  declare check_in_time: string;
  declare check_out_time: string;

  static initialize(sequelize: Sequelize): void {
    Property.init(
      {
        id: UUIDPrimaryKey,
        organization_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'organizations', key: 'id' },
        },
        name: { type: DataTypes.STRING(255), allowNull: false },
        slug: { type: DataTypes.STRING(255), allowNull: false },
        email: { type: DataTypes.STRING(255), allowNull: false },
        phone: { type: DataTypes.STRING(50), allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
        city: { type: DataTypes.STRING(100), allowNull: true },
        state: { type: DataTypes.STRING(100), allowNull: true },
        country: { type: DataTypes.STRING(100), allowNull: true },
        postal_code: { type: DataTypes.STRING(20), allowNull: true },
        timezone: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'UTC' },
        currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
        tax_id: { type: DataTypes.STRING(100), allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        settings: { type: DataTypes.JSONB, allowNull: true },
        check_in_time: { type: DataTypes.STRING(5), allowNull: false, defaultValue: '14:00' },
        check_out_time: { type: DataTypes.STRING(5), allowNull: false, defaultValue: '11:00' },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'properties',
        paranoid: true,
        indexes: [
          { fields: ['organization_id'] },
          { unique: true, fields: ['organization_id', 'slug'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(): void {
    Property.belongsTo(require('./organization.model').Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });
    Property.hasMany(require('./floor.model').Floor, {
      foreignKey: 'property_id',
      as: 'floors',
    });
    Property.hasMany(require('./room.model').Room, {
      foreignKey: 'property_id',
      as: 'rooms',
    });
    Property.hasMany(require('./room-type.model').RoomType, {
      foreignKey: 'property_id',
      as: 'roomTypes',
    });
  }
}
