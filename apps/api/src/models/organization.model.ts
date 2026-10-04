import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class Organization extends BaseModel {
  declare name: string;
  declare slug: string;
  declare email: string;
  declare phone: string | null;
  declare address: string | null;
  declare logo_url: string | null;
  declare is_active: boolean;
  declare settings: Record<string, any> | null;

  static initialize(sequelize: Sequelize): void {
    Organization.init(
      {
        id: UUIDPrimaryKey,
        name: { type: DataTypes.STRING(255), allowNull: false },
        slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        email: { type: DataTypes.STRING(255), allowNull: false },
        phone: { type: DataTypes.STRING(50), allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
        logo_url: { type: DataTypes.STRING(500), allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        settings: { type: DataTypes.JSONB, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'organizations',
        paranoid: true,
        indexes: [
          { unique: true, fields: ['slug'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(): void {
    Organization.hasMany(require('./property.model').Property, {
      foreignKey: 'organization_id',
      as: 'properties',
    });
    Organization.hasMany(require('./user.model').User, {
      foreignKey: 'organization_id',
      as: 'users',
    });
  }
}
