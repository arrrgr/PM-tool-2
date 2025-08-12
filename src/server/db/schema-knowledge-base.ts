import { pgTableCreator, varchar, text, timestamp, boolean, json, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

export const createTable = pgTableCreator((name) => `pmtool_${name}`);

// Enums
export const articleStatusEnum = pgEnum('article_status', ['draft', 'published', 'archived']);
export const articleTypeEnum = pgEnum('article_type', ['guide', 'faq', 'reference', 'tutorial', 'troubleshooting']);

// Knowledge Base Articles
export const kbArticles = createTable('kb_article', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  summary: text('summary'),
  status: articleStatusEnum('status').default('draft'),
  type: articleTypeEnum('type').default('guide'),
  authorId: varchar('author_id', { length: 255 }).notNull().references(() => users.id),
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
  embedding: json('embedding').$type<number[]>(), // For semantic search
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
  createdAt: timestamp('created_at').defaultNow(),
});

// Q&A System
export const kbQuestions = createTable('kb_question', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  question: text('question').notNull(),
  answer: text('answer'),
  articleId: varchar('article_id', { length: 255 }).references(() => kbArticles.id),
  askedById: varchar('asked_by_id', { length: 255 }).notNull().references(() => users.id),
  answeredById: varchar('answered_by_id', { length: 255 }).references(() => users.id),
  isAiAnswer: boolean('is_ai_answer').default(false),
  sources: json('sources').$type<{ articleId: string; snippet: string }[]>().default([]),
  rating: integer('rating'), // 1-5 stars
  metadata: json('metadata').$type<{
    confidence?: number;
    model?: string;
    tokens?: number;
  }>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  answeredAt: timestamp('answered_at'),
});

// Search History (for improving search)
export const kbSearchHistory = createTable('kb_search_history', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  query: text('query').notNull(),
  results: json('results').$type<{ articleId: string; score: number }[]>().default([]),
  clickedResult: varchar('clicked_result', { length: 255 }),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  searchType: varchar('search_type', { length: 50 }).default('text'), // text, semantic, hybrid
  createdAt: timestamp('created_at').defaultNow(),
});

// Article Feedback
export const kbArticleFeedback = createTable('kb_article_feedback', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  articleId: varchar('article_id', { length: 255 }).notNull().references(() => kbArticles.id),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  helpful: boolean('helpful').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const kbArticlesRelations = relations(kbArticles, ({ one, many }) => ({
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
  parent: one(kbCategories, {
    fields: [kbCategories.parentId],
    references: [kbCategories.id],
    relationName: 'subcategories',
  }),
  subcategories: many(kbCategories, { relationName: 'subcategories' }),
  articles: many(kbArticles),
}));

export const kbQuestionsRelations = relations(kbQuestions, ({ one }) => ({
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