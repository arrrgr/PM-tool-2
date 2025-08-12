import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  varchar, 
  integer,
  jsonb,
  boolean
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./schema";

// Knowledge Base Articles
export const knowledgeArticles = pgTable("pmtool_knowledge_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // AI fields
  embedding: jsonb("embedding").$type<number[]>(), // Store embeddings as JSON array
  aiGenerated: boolean("ai_generated").default(false),
  
  // Metadata
  authorId: varchar("author_id", { length: 255 }).notNull(),
  projectId: uuid("project_id"),
  isPublished: boolean("is_published").default(true),
  viewCount: integer("view_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Article Relations
export const articleRelations = relations(knowledgeArticles, ({ one, many }) => ({
  author: one(users, {
    fields: [knowledgeArticles.authorId],
    references: [users.id],
  }),
  feedbacks: many(articleFeedback),
}));

// Article Feedback (for AI improvement)
export const articleFeedback = pgTable("pmtool_article_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  helpful: boolean("helpful").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Query History (for analytics and improvement)
export const aiQueries = pgTable("pmtool_ai_queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  context: jsonb("context"), // Referenced articles, etc.
  tokens: integer("tokens"),
  responseTime: integer("response_time"), // in ms
  helpful: boolean("helpful"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories for organization
export const knowledgeCategories = pgTable("pmtool_knowledge_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // Hex color
  icon: varchar("icon", { length: 50 }), // Icon name
  parentId: uuid("parent_id"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoryRelations = relations(knowledgeCategories, ({ one }) => ({
  parent: one(knowledgeCategories, {
    fields: [knowledgeCategories.parentId],
    references: [knowledgeCategories.id],
  }),
}));