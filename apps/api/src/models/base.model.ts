import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export class BaseModel extends Model {
  declare id: string;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at: Date | null;

  static initialize(sequelize: Sequelize): void {
    // Override in subclasses
  }

  static associate(): void {
    // Override in subclasses
  }
}

export class TenantModel extends BaseModel {
  declare organization_id: string;
  declare property_id: string;
}

export class AuditedModel extends TenantModel {
  declare created_by: string | null;
  declare updated_by: string | null;
}

// Common field definitions
export const UUIDPrimaryKey = {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true,
};

export const TimestampFields = {
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
};

export const TenantFields = {
  organization_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id',
    },
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id',
    },
  },
};

export const AuditedFields = {
  ...TenantFields,
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
};
