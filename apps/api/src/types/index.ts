export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface TenantEntity extends BaseEntity {
  organization_id: string;
  property_id: string;
}

export interface AuditedEntity extends TenantEntity {
  created_by?: string;
  updated_by?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId?: string;
  propertyId?: string;
  role?: string;
}

export interface ServiceContext {
  userId: string;
  organizationId: string;
  propertyId: string;
}

export interface WhereClause {
  [key: string]: any;
}

export interface FindOptions {
  where?: WhereClause;
  include?: any[];
  attributes?: string[];
  order?: [string, string][];
  limit?: number;
  offset?: number;
  paranoid?: boolean;
  transaction?: any;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
