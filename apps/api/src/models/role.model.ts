import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class Role extends BaseModel {
  declare organization_id: string | null;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare is_system: boolean;
  declare is_active: boolean;

  static initialize(sequelize: Sequelize): void {
    Role.init(
      {
        id: UUIDPrimaryKey,
        organization_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'organizations', key: 'id' },
        },
        name: { type: DataTypes.STRING(100), allowNull: false },
        slug: { type: DataTypes.STRING(100), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_system: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'roles',
        paranoid: true,
        indexes: [
          { unique: true, fields: ['organization_id', 'slug'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(): void {
    Role.belongsTo(require('./organization.model').Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });
    Role.belongsToMany(require('./user.model').User, {
      through: require('./user-role.model').UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users',
    });
    Role.belongsToMany(require('./permission.model').Permission, {
      through: require('./role-permission.model').RolePermission,
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions',
    });
  }
}
