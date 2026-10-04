import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class MembershipPlan extends TenantModel {
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare points_per_dollar: number;
  declare minimum_points_for_redemption: number;
  declare redemption_value_per_point: number;
  declare tier_level: number;
  declare benefits: Record<string, any> | null;
  declare is_active: boolean;

  static initialize(sequelize: Sequelize): void {
    MembershipPlan.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        name: { type: DataTypes.STRING(100), allowNull: false },
        code: { type: DataTypes.STRING(20), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        points_per_dollar: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
        minimum_points_for_redemption: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
        redemption_value_per_point: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 0.01 },
        tier_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        benefits: { type: DataTypes.JSONB, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'membership_plans',
        paranoid: true,
        indexes: [
          { fields: ['property_id'] },
          { unique: true, fields: ['property_id', 'code'] },
        ],
      }
    );
  }

  static associate(): void {
    MembershipPlan.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    MembershipPlan.hasMany(require('./member.model').Member, {
      foreignKey: 'membership_plan_id',
      as: 'members',
    });
  }
}
