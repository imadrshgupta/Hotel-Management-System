import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class AuditLog extends TenantModel {
  declare user_id: string | null;
  declare action: string;
  declare entity: string;
  declare entity_id: string;
  declare old_value: Record<string, any> | null;
  declare new_value: Record<string, any> | null;
  declare ip_address: string | null;
  declare user_agent: string | null;

  static initialize(sequelize: Sequelize): void {
    AuditLog.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        user_id: { type: DataTypes.UUID, allowNull: true },
        action: { type: DataTypes.STRING(50), allowNull: false },
        entity: { type: DataTypes.STRING(50), allowNull: false },
        entity_id: { type: DataTypes.UUID, allowNull: false },
        old_value: { type: DataTypes.JSONB, allowNull: true },
        new_value: { type: DataTypes.JSONB, allowNull: true },
        ip_address: { type: DataTypes.STRING(45), allowNull: true },
        user_agent: { type: DataTypes.STRING(500), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'audit_logs',
        indexes: [
          { fields: ['property_id'] },
          { fields: ['user_id'] },
          { fields: ['entity', 'entity_id'] },
          { fields: ['action'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(): void {
    AuditLog.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  }
}
