import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  json,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { type AdapterAccount } from 'next-auth/adapters';

export const createTable = pgTableCreator((name) => `pmtool_${name}`);

// NextAuth tables
export const users = createTable('user', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerified: timestamp('emailVerified', {
    mode: 'date',
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar('image', { length: 255 }),
  hashedPassword: varchar('hashed_password', { length: 255 }),
  organizationId: varchar('organization_id', { length: 255 }),
  role: varchar('role', { length: 50 }).default('member'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const accounts = createTable(
  'account',
  {
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 255 })
      .$type<AdapterAccount['type']>()
      .notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index('account_userId_idx').on(account.userId),
  }),
);

export const sessions = createTable(
  'session',
  {
    sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (session) => ({
    userIdIdx: index('session_userId_idx').on(session.userId),
  }),
);

export const verificationTokens = createTable(
  'verificationToken',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// Organizations
export const organizations = createTable('organization', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  logo: varchar('logo', { length: 255 }),
  settings: json('settings').$type<{
    defaultTaskStatuses?: string[];
    defaultPriorities?: string[];
    features?: {
      knowledgeBase?: boolean;
      timeTracking?: boolean;
      reporting?: boolean;
    };
  }>(),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Projects
export const projects = createTable('project', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  key: varchar('key', { length: 10 }).notNull(),
  description: text('description'),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .references(() => organizations.id),
  parentProjectId: varchar('parent_project_id', { length: 255 }),
  leaderId: varchar('leader_id', { length: 255 }).references(() => users.id),
  status: varchar('status', { length: 50 }).default('active'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isArchived: boolean('is_archived').default(false),
  settings: json('settings').$type<{
    taskStatuses?: string[];
    workflow?: string;
    permissions?: Record<string, string[]>;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tasks
export const tasks = createTable('task', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  key: varchar('key', { length: 20 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  projectId: varchar('project_id', { length: 255 })
    .notNull()
    .references(() => projects.id),
  parentTaskId: varchar('parent_task_id', { length: 255 }),
  assigneeId: varchar('assignee_id', { length: 255 }).references(() => users.id),
  reporterId: varchar('reporter_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  status: varchar('status', { length: 50 }).default('To Do'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  type: varchar('type', { length: 50 }).default('task'),
  storyPoints: integer('story_points'),
  originalEstimate: integer('original_estimate'),
  remainingEstimate: integer('remaining_estimate'),
  timeSpent: integer('time_spent').default(0),
  dueDate: timestamp('due_date'),
  labels: json('labels').$type<string[]>(),
  customFields: json('custom_fields').$type<Record<string, any>>(),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Comments
export const comments = createTable('comment', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  taskId: varchar('task_id', { length: 255 })
    .notNull()
    .references(() => tasks.id),
  authorId: varchar('author_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  isInternal: boolean('is_internal').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Attachments
export const attachments = createTable('attachment', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  taskId: varchar('task_id', { length: 255 })
    .references(() => tasks.id),
  commentId: varchar('comment_id', { length: 255 })
    .references(() => comments.id),
  knowledgeBaseId: varchar('knowledge_base_id', { length: 255 }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  fileSize: integer('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  s3Key: varchar('s3_key', { length: 500 }).notNull(),
  uploadedBy: varchar('uploaded_by', { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Time Tracking
export const workLogs = createTable('work_log', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  taskId: varchar('task_id', { length: 255 })
    .notNull()
    .references(() => tasks.id),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  timeSpent: integer('time_spent').notNull(),
  description: text('description'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Knowledge Base
export const knowledgeBase = createTable('knowledge_base', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .references(() => organizations.id),
  projectId: varchar('project_id', { length: 255 })
    .references(() => projects.id),
  authorId: varchar('author_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  tags: json('tags').$type<string[]>(),
  isPublic: boolean('is_public').default(true),
  embedding: text('embedding'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Activity Logs
export const activityLogs = createTable('activity_log', {
  id: serial('id').primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .references(() => organizations.id),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Integrations
export const integrations = createTable('integration', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .references(() => organizations.id),
  type: varchar('type', { length: 50 }).notNull(),
  config: json('config').$type<{
    webhookUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    channelId?: string;
    repositoryId?: string;
    settings?: Record<string, any>;
  }>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  assignedTasks: many(tasks, { relationName: 'assignee' }),
  reportedTasks: many(tasks, { relationName: 'reporter' }),
  comments: many(comments),
  workLogs: many(workLogs),
  knowledgeBaseEntries: many(knowledgeBase),
  activityLogs: many(activityLogs),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  knowledgeBase: many(knowledgeBase),
  activityLogs: many(activityLogs),
  integrations: many(integrations),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  leader: one(users, {
    fields: [projects.leaderId],
    references: [users.id],
  }),
  parentProject: one(projects, {
    fields: [projects.parentProjectId],
    references: [projects.id],
    relationName: 'subprojects',
  }),
  subprojects: many(projects, { relationName: 'subprojects' }),
  tasks: many(tasks),
  knowledgeBase: many(knowledgeBase),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: 'assignee',
  }),
  reporter: one(users, {
    fields: [tasks.reporterId],
    references: [users.id],
    relationName: 'reporter',
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: 'subtasks',
  }),
  subtasks: many(tasks, { relationName: 'subtasks' }),
  comments: many(comments),
  attachments: many(attachments),
  workLogs: many(workLogs),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
  comment: one(comments, {
    fields: [attachments.commentId],
    references: [comments.id],
  }),
  uploadedByUser: one(users, {
    fields: [attachments.uploadedBy],
    references: [users.id],
  }),
}));

export const workLogsRelations = relations(workLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [workLogs.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [workLogs.userId],
    references: [users.id],
  }),
}));

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  organization: one(organizations, {
    fields: [knowledgeBase.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [knowledgeBase.projectId],
    references: [projects.id],
  }),
  author: one(users, {
    fields: [knowledgeBase.authorId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [activityLogs.organizationId],
    references: [organizations.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  organization: one(organizations, {
    fields: [integrations.organizationId],
    references: [organizations.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));