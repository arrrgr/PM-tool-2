import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { roles, userRoles, users } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionsManager } from '@/components/permissions/permissions-manager';
import { checkPermission, PERMISSIONS } from '@/lib/permissions';

async function PermissionsContent() {
  const session = await auth();
  
  if (!session?.user?.organizationId || !session?.user?.id) {
    return <div>No organization found</div>;
  }

  // Check if user has permission to manage permissions
  // First check if user is admin or owner by their role in the users table
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  const isAdminOrOwner = currentUser?.role === 'admin' || currentUser?.role === 'owner';
  
  const canManage = isAdminOrOwner || await checkPermission({
    userId: session.user.id,
    organizationId: session.user.organizationId,
    permission: PERMISSIONS.ORG_MANAGE_SETTINGS,
  });

  if (!canManage) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You don't have permission to manage organization permissions.
        </p>
      </div>
    );
  }

  // Get all roles for the organization
  let orgRoles = [];
  try {
    orgRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.organizationId, session.user.organizationId));
  } catch (error) {
    console.error('Error fetching roles:', error);
    // If no roles exist, return empty array
    orgRoles = [];
  }

  // Get all users in the organization
  const orgUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
    })
    .from(users)
    .where(eq(users.organizationId, session.user.organizationId));

  // Transform users to include their roles
  const usersWithRoles = orgUsers.map(user => ({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
    roles: user.role ? [{ id: user.role, name: user.role, type: 'system' }] : [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Permissions Management</h2>
        <p className="text-muted-foreground">
          Manage roles and permissions for your organization members.
        </p>
      </div>

      <PermissionsManager
        roles={orgRoles}
        users={usersWithRoles}
        currentUserId={session.user.id}
      />
    </div>
  );
}

export default function PermissionsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading permissions...</div>}>
        <PermissionsContent />
      </Suspense>
    </DashboardLayout>
  );
}