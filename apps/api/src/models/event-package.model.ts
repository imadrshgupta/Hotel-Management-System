import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class EventPackage extends TenantModel {
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare price_per_person: number;
  declare minimum_guests: number;
  declare maximum_guests: number | null;
  declare is_active: boolean;

  static initialize(sequelize: Sequelize): void {
    EventPackage.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(255), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        price_per_person: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        minimum_guests: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        maximum_guests: { type: DataTypes.INTEGER, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'event_packages',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['property_id', 'code'] },
        ],
      }
    );
  }

  static associate(): void {
    EventPackage.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  }
}
