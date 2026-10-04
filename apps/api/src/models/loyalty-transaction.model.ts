import { DataTypes, Sequelize } from 'sequelize';
import { TenantModel, UUIDPrimaryKey, TenantFields, TimestampFields } from './base.model';

export class LoyaltyTransaction extends TenantModel {
  declare member_id: string;
  declare transaction_type: string;
  declare points: number;
  declare balance_after: number;
  declare reference_type: string | null;
  declare reference_id: string | null;
  declare description: string | null;
  declare performed_by: string | null;

  static initialize(sequelize: Sequelize): void {
    LoyaltyTransaction.init(
      {
        id: UUIDPrimaryKey,
        ...TenantFields,
        member_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'members', key: 'id' },
        },
        transaction_type: { type: DataTypes.STRING(30), allowNull: false },
        points: { type: DataTypes.INTEGER, allowNull: false },
        balance_after: { type: DataTypes.INTEGER, allowNull: false },
        reference_type: { type: DataTypes.STRING(50), allowNull: true },
        reference_id: { type: DataTypes.UUID, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        performed_by: { type: DataTypes.UUID, allowNull: true },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'loyalty_transactions',
        indexes: [
          { fields: ['property_id'] },
          { fields: ['member_id'] },
          { fields: ['transaction_type'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(): void {
    LoyaltyTransaction.belongsTo(require('./property.model').Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    LoyaltyTransaction.belongsTo(require('./member.model').Member, {
      foreignKey: 'member_id',
      as: 'member',
    });
  }
}
