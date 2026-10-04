import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Notification extends TenantModel {
  declare user_id: string;
  declare type: string;
  declare title: string;
  declare message: string;
  declare is_read: boolean;
  declare reference_type: string | null;
  declare reference_id: string | null;
  declare metadata: Record<string, any> | null;
  declare read_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    Notification.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        type: { type: DataTypes.STRING(30), allowNull: false },
        title: { type: DataTypes.STRING(255), allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        reference_type: { type: DataTypes.STRING(50), allowNull: true },
        reference_id: { type: DataTypes.UUID, allowNull: true },
        metadata: { type: DataTypes.JSONB, allowNull: true },
        read_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'notifications',
        indexes: [
          { fields: ['property_id'] },
          { fields: ['user_id'] },
          { fields: ['is_read'] },
          { fields: ['type'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(): void {
    Notification.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Notification.belongsTo(require('./user.model').User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }
}
