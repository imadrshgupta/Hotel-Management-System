import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel, UUIDPrimaryKey, TimestampFields } from './base.model';

export class GuestDocument extends BaseModel {
  declare guest_id: string;
  declare document_type: string;
  declare document_number: string;
  declare document_url: string | null;
  declare expiry_date: Date | null;
  declare is_verified: boolean;

  static initialize(sequelize: Sequelize): void {
    GuestDocument.init(
      {
        id: UUIDPrimaryKey,
        guest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'guests', key: 'id' },
        },
        document_type: { type: DataTypes.STRING(50), allowNull: false },
        document_number: { type: DataTypes.STRING(100), allowNull: false },
        document_url: { type: DataTypes.STRING(500), allowNull: true },
        expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
        is_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        ...TimestampFields,
      },
      {
        sequelize,
        tableName: 'guest_documents',
        indexes: [
          { fields: ['guest_id'] },
        ],
      }
    );
  }

  static associate(): void {
    GuestDocument.belongsTo(require('./guest.model').Guest, {
      foreignKey: 'guest_id',
      as: 'guest',
    });
  }
}
