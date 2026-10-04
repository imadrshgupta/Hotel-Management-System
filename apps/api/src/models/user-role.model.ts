import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class UserRole extends BaseModel {
  declare user_id: string;
  declare role_id: string;
  declare property_id: string | null;

  static initialize(sequelize: Sequelize): void {
    UserRole.init(
      {
        id: UUIDPrimaryKey,
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        role_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'roles', key: 'id' },
        },
        property_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'properties', key: 'id' },
        },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'user_roles',
        indexes: [
          { unique: true, fields: ['user_id', 'role_id', 'property_id'] },
          { fields: ['user_id'] },
          { fields: ['role_id'] },
        ],
      }
    );
  }

  static associate(): void {
    UserRole.belongsTo(require('./user.model').User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    UserRole.belongsTo(require('./role.model').Role, {
      foreignKey: 'role_id',
      as: 'role',
    });
  }
}
