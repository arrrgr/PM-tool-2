import { db } from "@/server/db";
import { userRoles, roles, projectPermissions, teamPermissions, PERMISSIONS as DB_PERMISSIONS } from "@/server/db/schema-rbac";
import { eq, and, or, inArray } from "drizzle-orm";

export const PERMISSIONS = DB_PERMISSIONS;

interface PermissionCheckOptions {
  userId: string;
  organizationId: string;
  permission: string;
  resource?: {
    type: 'project' | 'team' | 'task';
    id: string;
  };
}

export async function checkPermission({
  userId,
  organizationId,
  permission,
  resource,
}: PermissionCheckOptions): Promise<boolean> {
  try {
    // 1. Check organization-level roles
    const userOrgRoles = await db
      .select({
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(roles.organizationId, organizationId),
          eq(userRoles.scope, 'organization')
        )
      );

    // Check if user has permission at org level
    for (const role of userOrgRoles) {
      if (Array.isArray(role.permissions) && role.permissions.includes(permission)) {
        return true;
      }
    }

    // 2. If resource-specific, check resource-level permissions
    if (resource) {
      if (resource.type === 'project') {
        // Check project-specific roles
        const projectRoles = await db
          .select({
            permissions: roles.permissions,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(
            and(
              eq(userRoles.userId, userId),
              eq(userRoles.scope, 'project'),
              eq(userRoles.scopeId, resource.id)
            )
          );

        for (const role of projectRoles) {
          if (Array.isArray(role.permissions) && role.permissions.includes(permission)) {
            return true;
          }
        }

        // Check direct project permissions
        const directProjectPerms = await db
          .select({
            permissions: projectPermissions.permissions,
          })
          .from(projectPermissions)
          .where(
            and(
              eq(projectPermissions.projectId, resource.id),
              eq(projectPermissions.userId, userId)
            )
          );

        for (const perm of directProjectPerms) {
          if (Array.isArray(perm.permissions) && perm.permissions.includes(permission)) {
            return true;
          }
        }
      } else if (resource.type === 'team') {
        // Check team-specific roles
        const teamRoles = await db
          .select({
            permissions: roles.permissions,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(
            and(
              eq(userRoles.userId, userId),
              eq(userRoles.scope, 'team'),
              eq(userRoles.scopeId, resource.id)
            )
          );

        for (const role of teamRoles) {
          if (Array.isArray(role.permissions) && role.permissions.includes(permission)) {
            return true;
          }
        }

        // Check direct team permissions
        const directTeamPerms = await db
          .select({
            permissions: teamPermissions.permissions,
          })
          .from(teamPermissions)
          .where(
            and(
              eq(teamPermissions.teamId, resource.id),
              eq(teamPermissions.userId, userId)
            )
          );

        for (const perm of directTeamPerms) {
          if (Array.isArray(perm.permissions) && perm.permissions.includes(permission)) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<string[]> {
  try {
    const userOrgRoles = await db
      .select({
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(roles.organizationId, organizationId)
        )
      );

    const allPermissions = new Set<string>();
    
    for (const role of userOrgRoles) {
      if (Array.isArray(role.permissions)) {
        role.permissions.forEach(p => allPermissions.add(p));
      }
    }

    return Array.from(allPermissions);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

export async function assignRole(
  userId: string,
  roleId: string,
  scope: 'organization' | 'project' | 'team' = 'organization',
  scopeId?: string,
  grantedBy?: string
) {
  try {
    await db.insert(userRoles).values({
      userId,
      roleId,
      scope,
      scopeId,
      grantedBy,
    });
    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    return false;
  }
}

export async function removeRole(
  userId: string,
  roleId: string,
  scope: 'organization' | 'project' | 'team' = 'organization',
  scopeId?: string
) {
  try {
    await db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
          eq(userRoles.scope, scope),
          scopeId ? eq(userRoles.scopeId, scopeId) : undefined
        )
      );
    return true;
  } catch (error) {
    console.error('Error removing role:', error);
    return false;
  }
}

export async function createDefaultRoles(organizationId: string) {
  try {
    const { DEFAULT_ROLES } = await import("@/server/db/schema-rbac");
    
    const rolesToCreate = Object.values(DEFAULT_ROLES).map(role => ({
      name: role.name,
      description: role.description,
      type: role.type,
      permissions: role.permissions,
      organizationId,
      isDefault: true,
    }));

    const createdRoles = await db
      .insert(roles)
      .values(rolesToCreate)
      .returning();

    return createdRoles;
  } catch (error) {
    console.error('Error creating default roles:', error);
    return [];
  }
}