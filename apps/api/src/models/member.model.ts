import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class Member extends TenantModel {
  declare membership_plan_id: string;
  declare guest_id: string;
  declare member_number: string;
  declare points_balance: number;
  declare lifetime_points: number;
  declare total_redemption: number;
  declare status: string;
  declare joined_at: Date;
  declare tier_level: number;

  static initialize(sequelize: Sequelize): void {
    Member.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        membership_plan_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'membership_plans', key: 'id' },
        },
        guest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'guests', key: 'id' },
        },
        member_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        points_balance: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        lifetime_points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        total_redemption: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
        joined_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        tier_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'members',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['member_number'] },
          { fields: ['guest_id'] },
          { fields: ['membership_plan_id'] },
          { fields: ['status'] },
        ],
      }
    );
  }

  static associate(): void {
    Member.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Member.belongsTo(require('./membership-plan.model').MembershipPlan, {
      foreignKey: 'membership_plan_id',
      as: 'membershipPlan',
    });
    Member.belongsTo(require('./guest.model').Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
    });
    Member.hasMany(require('./loyalty-transaction.model').LoyaltyTransaction, {
      foreignKey: 'member_id',
      as: 'transactions',
    });
  }
}
