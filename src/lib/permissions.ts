// Simplified role-based permissions using existing user roles
// No need for complex RBAC - just use the role field from users table

export type UserRole = 'admin' | 'member' | 'viewer';

// Simple permission checks based on user role
export function canCreateProject(role: string | null): boolean {
  return role === 'admin';
}

export function canEditProject(role: string | null): boolean {
  return role === 'admin';
}

export function canDeleteProject(role: string | null): boolean {
  return role === 'admin';
}

export function canCreateTask(role: string | null): boolean {
  return role === 'admin' || role === 'member';
}

export function canEditTask(role: string | null, isAssignee: boolean = false): boolean {
  if (role === 'admin') return true;
  if (role === 'member' && isAssignee) return true;
  return false;
}

export function canDeleteTask(role: string | null): boolean {
  return role === 'admin';
}

export function canAssignTask(role: string | null): boolean {
  return role === 'admin' || role === 'member';
}

export function canManageUsers(role: string | null): boolean {
  return role === 'admin';
}

export function canManageOrganization(role: string | null): boolean {
  return role === 'admin';
}

export function canExportData(role: string | null): boolean {
  return role === 'admin' || role === 'member';
}

export function canViewReports(role: string | null): boolean {
  return role === 'admin' || role === 'member';
}

export function canManageKnowledgeBase(role: string | null): boolean {
  return role === 'admin' || role === 'member';
}

export function canTrackTime(role: string | null): boolean {
  return role === 'admin' || role === 'member';
}

export function canViewBilling(role: string | null): boolean {
  return role === 'admin';
}

// Helper to check multiple permissions at once
export function getUserCapabilities(role: string | null) {
  return {
    projects: {
      create: canCreateProject(role),
      edit: canEditProject(role),
      delete: canDeleteProject(role),
    },
    tasks: {
      create: canCreateTask(role),
      edit: role === 'admin', // Can be refined with isAssignee check
      delete: canDeleteTask(role),
      assign: canAssignTask(role),
    },
    users: {
      manage: canManageUsers(role),
    },
    organization: {
      manage: canManageOrganization(role),
    },
    data: {
      export: canExportData(role),
      viewReports: canViewReports(role),
    },
    knowledgeBase: {
      manage: canManageKnowledgeBase(role),
    },
    time: {
      track: canTrackTime(role),
    },
    billing: {
      view: canViewBilling(role),
    },
  };
}