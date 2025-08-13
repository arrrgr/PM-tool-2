import { sql } from 'drizzle-orm';
import { db } from '@/server/db';

async function seedKnowledgeBase() {
  console.log('🌱 Seeding knowledge base...');
  
  try {
    // Insert categories
    await db.execute(sql`
      INSERT INTO pmtool_kb_category (id, name, slug, organization_id) VALUES
      ('kb-cat-1', 'Documentation', 'documentation', 'pm-tool-org'),
      ('kb-cat-2', 'Features', 'features', 'pm-tool-org'),
      ('kb-cat-3', 'Bug Fixes', 'bug-fixes', 'pm-tool-org'),
      ('kb-cat-4', 'Deployment', 'deployment', 'pm-tool-org')
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('✅ Categories created');
    
    // Insert articles with smaller content to avoid issues
    const articles = [
      {
        id: 'kb-art-1',
        title: 'Release Notes - Development History',
        slug: 'release-notes',
        content: '# Release Notes\n\nThis document contains the development history and release notes for the PM Tool project.\n\n## Recent Changes\n\n### Aug 13, 2025 - Reorganize user management based on feedback\nCommit: `cf423e9` by Artur Grishkevich\n\n### Aug 13, 2025 - Add comprehensive role and permission management\nCommit: `02e1d9a` by Artur Grishkevich\n\n### Aug 13, 2025 - Consolidate user and permissions management\nCommit: `08d34d7` by Artur Grishkevich',
        summary: 'Complete development history and release notes for the PM Tool project'
      },
      {
        id: 'kb-art-2',
        title: 'Project Architecture Overview',
        slug: 'architecture',
        content: '# PM Tool Architecture\n\n## Technology Stack\n\n### Frontend\n- **Framework**: Next.js 15 with App Router\n- **Language**: TypeScript\n- **Styling**: Tailwind CSS\n- **UI Components**: shadcn/ui\n\n### Backend\n- **API**: Next.js API Routes\n- **Database**: PostgreSQL\n- **ORM**: Drizzle ORM\n- **Authentication**: NextAuth.js',
        summary: 'Complete technical architecture overview of the PM Tool'
      },
      {
        id: 'kb-art-3',
        title: 'Bug Fixes and Resolutions',
        slug: 'bug-fixes',
        content: '# Bug Fixes and Resolutions\n\nThis document tracks all bug fixes and issue resolutions.\n\n## Resolved Issues\n\n### Add trustHost to NextAuth config\n- **Date**: 2025-08-13\n- **Commit**: `e8ac2ac`\n\n### Update schema to match production database\n- **Date**: 2025-08-13\n- **Commit**: `8fd39ab`',
        summary: 'Complete list of bug fixes and issue resolutions'
      },
      {
        id: 'kb-art-4',
        title: 'Deployment Guide and History',
        slug: 'deployment-guide',
        content: '# Deployment Guide\n\n## Railway Deployment\n\nThis project is deployed on Railway.\n\n## Key Configuration\n\n- **Trust Host**: Enabled in NextAuth configuration\n- **Environment Variables**: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL\n- **Build Command**: npm run build\n- **Start Command**: npm run start',
        summary: 'Complete deployment guide and configuration for Railway'
      },
      {
        id: 'kb-art-5',
        title: 'Feature: User Management System',
        slug: 'feature-user-management',
        content: '# User Management System\n\n## Overview\n\nComprehensive user management system.\n\n## Features\n\n### User Management\n- View all users in a table format\n- Invite new users to the organization\n- Edit user roles\n- Activate/deactivate user accounts',
        summary: 'User and role management system implementation'
      },
      {
        id: 'kb-art-6',
        title: 'Feature: Kanban Board Implementation',
        slug: 'feature-kanban-boards',
        content: '# Kanban Board Implementation\n\n## Overview\n\nVisual task management with drag-and-drop.\n\n## Features\n\n### Board Functionality\n- Drag and drop tasks between columns\n- Visual status indicators\n- Priority badges\n- Assignee avatars',
        summary: 'Kanban board implementation with drag-and-drop'
      },
      {
        id: 'kb-art-7',
        title: 'Getting Started with PM Tool',
        slug: 'getting-started',
        content: '# Getting Started with PM Tool\n\n## Quick Start Guide\n\nWelcome to PM Tool!\n\n## Initial Setup\n\n### 1. Create Your Organization\n- Sign up for an account\n- Set up your organization profile\n\n### 2. Invite Team Members\n- Navigate to Organization > Users\n- Click Invite User',
        summary: 'Getting started guide for new users'
      }
    ];
    
    for (const article of articles) {
      await db.execute(sql`
        INSERT INTO pmtool_kb_article (
          id, title, slug, content, summary, status, type, 
          organization_id, author_id, category_id, tags, 
          published_at, created_at, updated_at
        ) VALUES (
          ${article.id}, 
          ${article.title}, 
          ${article.slug}, 
          ${article.content}, 
          ${article.summary}, 
          'published', 
          'documentation', 
          'pm-tool-org', 
          'arthur-admin', 
          'kb-cat-1', 
          '["documentation"]'::json,
          NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO NOTHING
      `);
      console.log(`✅ Created article: ${article.title}`);
    }
    
    console.log('✅ Knowledge base articles created successfully!');
    console.log(`📚 ${articles.length} articles added to the knowledge base`);
    
  } catch (error) {
    console.error('❌ Error seeding knowledge base:', error);
    throw error;
  }
}

seedKnowledgeBase()
  .then(() => {
    console.log('✨ Knowledge base seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed knowledge base:', error);
    process.exit(1);
  });