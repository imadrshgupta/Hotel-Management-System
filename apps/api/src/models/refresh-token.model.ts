import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class RefreshToken extends BaseModel {
  declare user_id: string;
  declare token: string;
  declare expires_at: Date;
  declare is_revoked: boolean;
  declare user_agent: string | null;
  declare ip_address: string | null;

  static initialize(sequelize: Sequelize): void {
    RefreshToken.init(
      {
        id: UUIDPrimaryKey,
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        token: { type: DataTypes.STRING(500), allowNull: false, unique: true },
        expires_at: { type: DataTypes.DATE, allowNull: false },
        is_revoked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        user_agent: { type: DataTypes.STRING(500), allowNull: true },
        ip_address: { type: DataTypes.STRING(45), allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'refresh_tokens',
        indexes: [
          { fields: ['user_id'] },
          { unique: true, fields: ['token'] },
          { fields: ['expires_at'] },
          { fields: ['is_revoked'] },
        ],
      }
    );
  }

  static associate(): void {
    RefreshToken.belongsTo(require('./user.model').User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }
}
