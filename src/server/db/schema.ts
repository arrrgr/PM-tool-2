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
  isEpic: boolean('is_epic').default(false),
  progress: integer('progress').default(0), // 0-100 percentage for epics
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

// Knowledge Base Articles
export const kbArticles = createTable('kb_article', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  summary: text('summary'),
  status: varchar('status', { length: 20 }).default('draft'),
  type: varchar('type', { length: 50 }).default('guide'),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .references(() => organizations.id),
  authorId: varchar('author_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  categoryId: varchar('category_id', { length: 255 }).references(() => kbCategories.id),
  tags: json('tags').$type<string[]>().default([]),
  metadata: json('metadata').$type<{
    readTime?: number;
    views?: number;
    likes?: number;
    aiGenerated?: boolean;
    lastAiUpdate?: Date;
    relatedArticles?: string[];
    keywords?: string[];
  }>().default({}),
  embedding: json('embedding').$type<number[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at'),
});

// Knowledge Base Categories
export const kbCategories = createTable('kb_category', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  parentId: varchar('parent_id', { length: 255 }).references(() => kbCategories.id),
  icon: varchar('icon', { length: 50 }),
  order: integer('order').default(0),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Q&A System
export const kbQuestions = createTable('kb_question', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  question: text('question').notNull(),
  answer: text('answer'),
  articleId: varchar('article_id', { length: 255 }).references(() => kbArticles.id),
  askedById: varchar('asked_by_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  answeredById: varchar('answered_by_id', { length: 255 })
    .references(() => users.id),
  isAiAnswer: boolean('is_ai_answer').default(false),
  sources: json('sources').$type<{ articleId: string; snippet: string }[]>().default([]),
  rating: integer('rating'),
  metadata: json('metadata').$type<{
    confidence?: number;
    model?: string;
    tokens?: number;
  }>().default({}),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow(),
  answeredAt: timestamp('answered_at'),
});

// Search History
export const kbSearchHistory = createTable('kb_search_history', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  query: text('query').notNull(),
  results: json('results').$type<{ articleId: string; score: number }[]>().default([]),
  clickedResult: varchar('clicked_result', { length: 255 }),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  searchType: varchar('search_type', { length: 50 }).default('text'),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Article Feedback
export const kbArticleFeedback = createTable('kb_article_feedback', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  articleId: varchar('article_id', { length: 255 })
    .notNull()
    .references(() => kbArticles.id),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  helpful: boolean('helpful').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
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
  kbArticles: many(kbArticles),
  askedQuestions: many(kbQuestions, { relationName: 'askedQuestions' }),
  answeredQuestions: many(kbQuestions, { relationName: 'answeredQuestions' }),
  kbFeedback: many(kbArticleFeedback),
  activityLogs: many(activityLogs),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  kbArticles: many(kbArticles),
  kbCategories: many(kbCategories),
  kbQuestions: many(kbQuestions),
  kbSearchHistory: many(kbSearchHistory),
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

export const kbArticlesRelations = relations(kbArticles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [kbArticles.organizationId],
    references: [organizations.id],
  }),
  author: one(users, {
    fields: [kbArticles.authorId],
    references: [users.id],
  }),
  category: one(kbCategories, {
    fields: [kbArticles.categoryId],
    references: [kbCategories.id],
  }),
  questions: many(kbQuestions),
  feedback: many(kbArticleFeedback),
}));

export const kbCategoriesRelations = relations(kbCategories, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [kbCategories.organizationId],
    references: [organizations.id],
  }),
  parent: one(kbCategories, {
    fields: [kbCategories.parentId],
    references: [kbCategories.id],
    relationName: 'subcategories',
  }),
  subcategories: many(kbCategories, { relationName: 'subcategories' }),
  articles: many(kbArticles),
}));

export const kbQuestionsRelations = relations(kbQuestions, ({ one }) => ({
  organization: one(organizations, {
    fields: [kbQuestions.organizationId],
    references: [organizations.id],
  }),
  article: one(kbArticles, {
    fields: [kbQuestions.articleId],
    references: [kbArticles.id],
  }),
  askedBy: one(users, {
    fields: [kbQuestions.askedById],
    references: [users.id],
    relationName: 'askedQuestions',
  }),
  answeredBy: one(users, {
    fields: [kbQuestions.answeredById],
    references: [users.id],
    relationName: 'answeredQuestions',
  }),
}));

export const kbArticleFeedbackRelations = relations(kbArticleFeedback, ({ one }) => ({
  article: one(kbArticles, {
    fields: [kbArticleFeedback.articleId],
    references: [kbArticles.id],
  }),
  user: one(users, {
    fields: [kbArticleFeedback.userId],
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

// Re-export knowledge schema
export * from './schema-knowledge';

// Re-export organization schema
export * from './schema-organization';

// Re-export templates schema
export * from './schema-templates';

// Re-export RBAC schema
export * from './schema-rbac';