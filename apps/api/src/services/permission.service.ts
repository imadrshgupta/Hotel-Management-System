import { getSequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

export async function getUserPermissions(userId: string): Promise<string[]> {
  const sequelize = getSequelize();
  
  const permissions = await sequelize.query<{ slug: string }>(
    `
    SELECT DISTINCT p.slug
    FROM permissions p
    INNER JOIN role_permissions rp ON rp.permission_id = p.id
    INNER JOIN user_roles ur ON ur.role_id = rp.role_id
    INNER JOIN users u ON u.id = ur.user_id
    WHERE u.id = :userId
      AND u.is_active = true
      AND p.deleted_at IS NULL
    `,
    {
      replacements: { userId },
      type: QueryTypes.SELECT,
    }
  );

  return permissions.map((p) => p.slug);
}
