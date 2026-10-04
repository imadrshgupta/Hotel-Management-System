import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class RolePermission extends BaseModel {
  declare role_id: string;
  declare permission_id: string;

  static initialize(sequelize: Sequelize): void {
    RolePermission.init(
      {
        id: UUIDPrimaryKey,
        role_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'roles', key: 'id' },
        },
        permission_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'permissions', key: 'id' },
        },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'role_permissions',
        indexes: [
          { unique: true, fields: ['role_id', 'permission_id'] },
          { fields: ['role_id'] },
          { fields: ['permission_id'] },
        ],
      }
    );
  }

  static associate(): void {
    RolePermission.belongsTo(require('./role.model').Role, {
      foreignKey: 'role_id',
      as: 'role',
    });
    RolePermission.belongsTo(require('./permission.model').Permission, {
      foreignKey: 'permission_id',
      as: 'permission',
    });
  }
}
