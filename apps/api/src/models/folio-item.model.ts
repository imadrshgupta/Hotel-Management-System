import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class FolioItem extends BaseModel {
  declare folio_id: string;
  declare description: string;
  declare category: string;
  declare quantity: number;
  declare unit_price: number;
  declare amount: number;
  declare tax_amount: number;
  declare discount_amount: number;
  declare net_amount: number;
  declare reference_type: string | null;
  declare reference_id: string | null;
  declare posted_by: string | null;
  declare posted_at: Date;

  static initialize(sequelize: Sequelize): void {
    FolioItem.init(
      {
        id: UUIDPrimaryKey,
        folio_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'folios', key: 'id' },
        },
        description: { type: DataTypes.STRING(500), allowNull: false },
        category: { type: DataTypes.STRING(50), allowNull: false },
        quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
        unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        net_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        reference_type: { type: DataTypes.STRING(50), allowNull: true },
        reference_id: { type: DataTypes.UUID, allowNull: true },
        posted_by: { type: DataTypes.UUID, allowNull: true },
        posted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'folio_items',
        indexes: [
          { fields: ['folio_id'] },
          { fields: ['category'] },
          { fields: ['reference_type', 'reference_id'] },
          { fields: ['posted_at'] },
        ],
      }
    );
  }

  static associate(): void {
    FolioItem.belongsTo(require('./folio.model').Folio, {
      foreignKey: 'folio_id',
      as: 'folio',
    });
  }
}
