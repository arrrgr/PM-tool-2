import { pgTableCreator, text, varchar, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users, organizations, projects } from "./schema";

export const createTable = pgTableCreator((name) => `pmtool_${name}`);

export const projectTemplates = createTable("project_template", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  key: varchar("key", { length: 10 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6366f1"),
  icon: varchar("icon", { length: 50 }),
  
  // Template configuration
  isPublic: boolean("is_public").default(false).notNull(),
  category: varchar("category", { length: 50 }).default("general"),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Task templates
  taskTemplates: jsonb("task_templates").$type<{
    title: string;
    description?: string;
    type: string;
    priority: string;
    estimatedHours?: number;
    subtasks?: string[];
    labels?: string[];
  }[]>().default([]),
  
  // Workflow configuration
  workflowStates: jsonb("workflow_states").$type<string[]>().default(["To Do", "In Progress", "In Review", "Done"]),
  customFields: jsonb("custom_fields").$type<{
    name: string;
    type: string;
    required: boolean;
    options?: string[];
  }[]>().default([]),
  
  // Organization and creator
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templateUsageStats = createTable("template_usage_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => projectTemplates.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  usedBy: uuid("used_by").references(() => users.id).notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

// Relations
export const projectTemplatesRelations = relations(projectTemplates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projectTemplates.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [projectTemplates.createdBy],
    references: [users.id],
  }),
  usageStats: many(templateUsageStats),
}));

export const templateUsageStatsRelations = relations(templateUsageStats, ({ one }) => ({
  template: one(projectTemplates, {
    fields: [templateUsageStats.templateId],
    references: [projectTemplates.id],
  }),
  project: one(projects, {
    fields: [templateUsageStats.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [templateUsageStats.usedBy],
    references: [users.id],
  }),
}));

// Schemas
export const insertProjectTemplateSchema = createInsertSchema(projectTemplates);
export const insertTemplateUsageStatSchema = createInsertSchema(templateUsageStats);