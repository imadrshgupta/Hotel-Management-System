import { DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class User extends BaseModel {
  declare organization_id: string | null;
  declare email: string;
  declare password_hash: string;
  declare first_name: string;
  declare last_name: string;
  declare phone: string | null;
  declare avatar_url: string | null;
  declare is_active: boolean;
  declare is_email_verified: boolean;
  declare last_login_at: Date | null;
  declare password_changed_at: Date | null;

  declare password: string;

  static initialize(sequelize: Sequelize): void {
    User.init(
      {
        id: UUIDPrimaryKey,
        organization_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'organizations', key: 'id' },
        },
        email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        password_hash: { type: DataTypes.STRING(255), allowNull: false },
        first_name: { type: DataTypes.STRING(100), allowNull: false },
        last_name: { type: DataTypes.STRING(100), allowNull: false },
        phone: { type: DataTypes.STRING(50), allowNull: true },
        avatar_url: { type: DataTypes.STRING(500), allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        is_email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        last_login_at: { type: DataTypes.DATE, allowNull: true },
        password_changed_at: { type: DataTypes.DATE, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'users',
        paranoid: true,
        hooks: {
          beforeCreate: async (user: User) => {
            if (user.password) {
              const salt = await bcrypt.genSalt(12);
              user.password_hash = await bcrypt.hash(user.password, salt);
            }
          },
          beforeUpdate: async (user: User) => {
            if (user.changed('password') || user.changed('password_hash')) {
              if (user.password) {
                const salt = await bcrypt.genSalt(12);
                user.password_hash = await bcrypt.hash(user.password, salt);
              }
            }
          },
        },
        indexes: [
          { unique: true, fields: ['email'] },
          { fields: ['organization_id'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(): void {
    User.belongsTo(require('./organization.model').Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });
    User.belongsToMany(require('./role.model').Role, {
      through: require('./user-role.model').UserRole,
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  toJSON(): any {
    const values = { ...this.get() };
    delete values.password_hash;
    delete values.password;
    return values;
  }
}
