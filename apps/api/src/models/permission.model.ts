import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class Permission extends BaseModel {
  declare name: string;
  declare slug: string;
  declare module: string;
  declare action: string;
  declare description: string | null;

  static initialize(sequelize: Sequelize): void {
    Permission.init(
      {
        id: UUIDPrimaryKey,
        name: { type: DataTypes.STRING(100), allowNull: false },
        slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        module: { type: DataTypes.STRING(50), allowNull: false },
        action: { type: DataTypes.STRING(50), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'permissions',
        indexes: [
          { unique: true, fields: ['slug'] },
          { fields: ['module'] },
        ],
      }
    );
  }

  static associate(): void {
    Permission.belongsToMany(require('./role.model').Role, {
      through: require('./role-permission.model').RolePermission,
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  }
}
