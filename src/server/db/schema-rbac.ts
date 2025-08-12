import { pgTableCreator, text, varchar, timestamp, boolean, jsonb, uuid, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users, organizations, projects, teams } from "./schema";

export const createTable = pgTableCreator((name) => `pmtool_${name}`);

// Define available permissions
export const PERMISSIONS = {
  // Project permissions
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE_MEMBERS: 'project:manage_members',
  
  // Task permissions
  TASK_VIEW: 'task:view',
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  TASK_COMMENT: 'task:comment',
  
  // Team permissions
  TEAM_VIEW: 'team:view',
  TEAM_CREATE: 'team:create',
  TEAM_EDIT: 'team:edit',
  TEAM_DELETE: 'team:delete',
  TEAM_MANAGE_MEMBERS: 'team:manage_members',
  
  // Organization permissions
  ORG_VIEW: 'org:view',
  ORG_EDIT: 'org:edit',
  ORG_MANAGE_MEMBERS: 'org:manage_members',
  ORG_MANAGE_BILLING: 'org:manage_billing',
  ORG_MANAGE_SETTINGS: 'org:manage_settings',
  
  // Knowledge base permissions
  KB_VIEW: 'kb:view',
  KB_CREATE: 'kb:create',
  KB_EDIT: 'kb:edit',
  KB_DELETE: 'kb:delete',
  
  // Template permissions
  TEMPLATE_VIEW: 'template:view',
  TEMPLATE_CREATE: 'template:create',
  TEMPLATE_EDIT: 'template:edit',
  TEMPLATE_DELETE: 'template:delete',
  TEMPLATE_USE: 'template:use',
} as const;

// Roles table
export const roles = createTable("role", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  
  // Permissions array
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  
  // Role type
  type: varchar("type", { length: 50 }).default("custom").notNull(), // system, custom
  isDefault: boolean("is_default").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User roles (many-to-many)
export const userRoles = createTable("user_role", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull(),
  
  // Scope
  scope: varchar("scope", { length: 50 }).default("organization").notNull(), // organization, project, team
  scopeId: uuid("scope_id"), // ID of the project/team if scoped
  
  grantedBy: uuid("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId, table.scope, table.scopeId] }),
}));

// Project-specific permissions
export const projectPermissions = createTable("project_permission", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  
  grantedBy: uuid("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
});

// Team-specific permissions
export const teamPermissions = createTable("team_permission", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  
  grantedBy: uuid("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
});

// Permission policies (for complex rules)
export const permissionPolicies = createTable("permission_policy", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  
  // Policy rules
  resource: varchar("resource", { length: 50 }).notNull(), // project, task, team, etc.
  action: varchar("action", { length: 50 }).notNull(), // view, create, edit, delete, etc.
  
  // Conditions (JSON for flexibility)
  conditions: jsonb("conditions").$type<{
    userAttribute?: string;
    resourceAttribute?: string;
    operator?: string;
    value?: any;
  }[]>().default([]),
  
  effect: varchar("effect", { length: 10 }).default("allow").notNull(), // allow, deny
  priority: integer("priority").default(0).notNull(),
  
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  grantedByUser: one(users, {
    fields: [userRoles.grantedBy],
    references: [users.id],
  }),
}));

export const projectPermissionsRelations = relations(projectPermissions, ({ one }) => ({
  project: one(projects, {
    fields: [projectPermissions.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectPermissions.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [projectPermissions.teamId],
    references: [teams.id],
  }),
  grantedByUser: one(users, {
    fields: [projectPermissions.grantedBy],
    references: [users.id],
  }),
}));

export const teamPermissionsRelations = relations(teamPermissions, ({ one }) => ({
  team: one(teams, {
    fields: [teamPermissions.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamPermissions.userId],
    references: [users.id],
  }),
  grantedByUser: one(users, {
    fields: [teamPermissions.grantedBy],
    references: [users.id],
  }),
}));

export const permissionPoliciesRelations = relations(permissionPolicies, ({ one }) => ({
  organization: one(organizations, {
    fields: [permissionPolicies.organizationId],
    references: [organizations.id],
  }),
}));

// Default roles configuration
export const DEFAULT_ROLES = {
  ADMIN: {
    name: 'Admin',
    description: 'Full access to all resources',
    type: 'system',
    permissions: Object.values(PERMISSIONS),
  },
  MANAGER: {
    name: 'Manager',
    description: 'Can manage projects and teams',
    type: 'system',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_EDIT,
      PERMISSIONS.PROJECT_MANAGE_MEMBERS,
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.TASK_COMMENT,
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.TEAM_CREATE,
      PERMISSIONS.TEAM_EDIT,
      PERMISSIONS.TEAM_MANAGE_MEMBERS,
      PERMISSIONS.KB_VIEW,
      PERMISSIONS.KB_CREATE,
      PERMISSIONS.KB_EDIT,
      PERMISSIONS.TEMPLATE_VIEW,
      PERMISSIONS.TEMPLATE_CREATE,
      PERMISSIONS.TEMPLATE_USE,
    ],
  },
  MEMBER: {
    name: 'Member',
    description: 'Standard team member access',
    type: 'system',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_COMMENT,
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.KB_VIEW,
      PERMISSIONS.TEMPLATE_VIEW,
      PERMISSIONS.TEMPLATE_USE,
    ],
  },
  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access',
    type: 'system',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.KB_VIEW,
      PERMISSIONS.TEMPLATE_VIEW,
    ],
  },
};

// Schemas
export const insertRoleSchema = createInsertSchema(roles);
export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertProjectPermissionSchema = createInsertSchema(projectPermissions);
export const insertTeamPermissionSchema = createInsertSchema(teamPermissions);
export const insertPermissionPolicySchema = createInsertSchema(permissionPolicies);

// Add missing import
import { integer } from "drizzle-orm/pg-core";