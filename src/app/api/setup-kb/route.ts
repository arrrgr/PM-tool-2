import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  // Simple auth check - only allow with secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'setup-kb-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Creating knowledge base tables...');
    
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pmtool_kb_category (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        parent_id VARCHAR(255) REFERENCES pmtool_kb_category(id),
        organization_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pmtool_kb_article (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        summary TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        type VARCHAR(50) DEFAULT 'guide',
        organization_id VARCHAR(255) NOT NULL,
        author_id VARCHAR(255) NOT NULL,
        category_id VARCHAR(255) REFERENCES pmtool_kb_category(id),
        tags JSON DEFAULT '[]'::json,
        metadata JSON DEFAULT '{}'::json,
        embedding JSON,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        published_at TIMESTAMP
      )
    `);

    console.log('Tables created. Adding categories...');
    
    // Insert categories
    const categories = [
      { id: 'kb-cat-doc', name: 'Documentation', slug: 'documentation' },
      { id: 'kb-cat-feat', name: 'Features', slug: 'features' },
      { id: 'kb-cat-bug', name: 'Bug Fixes', slug: 'bug-fixes' },
      { id: 'kb-cat-deploy', name: 'Deployment', slug: 'deployment' },
    ];

    for (const cat of categories) {
      await db.execute(sql`
        INSERT INTO pmtool_kb_category (id, name, slug, organization_id)
        VALUES (${cat.id}, ${cat.name}, ${cat.slug}, 'pm-tool-org')
        ON CONFLICT (id) DO NOTHING
      `);
    }

    console.log('Categories added. Adding articles...');

    // Create articles
    const articles = [
      {
        title: 'Release Notes - PM Tool Development',
        slug: 'release-notes-v1',
        content: `# Release Notes\n\n## Version 1.0 - Production Release\n\n### Recent Updates\n- User Management Reorganization\n- Role-Based Access Control\n- Railway Deployment\n- Knowledge Base\n- Kanban Boards\n\n### Bug Fixes\n- Fixed authentication issues\n- Resolved database column mapping\n- Fixed template page errors`,
        summary: 'Complete development history and release notes',
        categoryId: 'kb-cat-doc',
      },
      {
        title: 'Getting Started Guide',
        slug: 'getting-started-guide',
        content: `# Getting Started with PM Tool\n\n## Welcome!\nThis guide will help you get started.\n\n## First Steps\n\n### 1. Organization Setup\nSet up your organization profile.\n\n### 2. Creating Projects\n- Navigate to Projects page\n- Click New Project\n- Fill in details\n\n### 3. Managing Tasks\n- Create tasks within projects\n- Use Kanban board\n- Assign to team members`,
        summary: 'Quick start guide for new users',
        categoryId: 'kb-cat-doc',
      },
      {
        title: 'User Management Features',
        slug: 'user-management-features',
        content: `# User Management System\n\n## Overview\nManage users, roles, and permissions.\n\n## Key Features\n\n### User Management\n- User Table View\n- Invite System\n- Role Assignment\n- Status Control\n\n### Role System\n- Default Roles: Admin, Member, Viewer\n- Custom Roles\n- Granular Permissions`,
        summary: 'User and role management documentation',
        categoryId: 'kb-cat-feat',
      },
      {
        title: 'Kanban Board Guide',
        slug: 'kanban-board-guide',
        content: `# Kanban Board\n\n## Visual Task Management\n\n### Features\n- Drag & Drop\n- Status Columns\n- Task Cards\n- Quick Actions\n\n### Using the Board\n1. View tasks in columns\n2. Drag to change status\n3. Click for details\n4. Use filters`,
        summary: 'How to use the Kanban board',
        categoryId: 'kb-cat-feat',
      },
      {
        title: 'Deployment Configuration',
        slug: 'deployment-config',
        content: `# Railway Deployment Guide\n\n## Environment Setup\n\n### Required Variables\n- DATABASE_URL\n- NEXTAUTH_SECRET\n- NEXTAUTH_URL\n\n### Configuration Steps\n1. Create Railway project\n2. Add PostgreSQL database\n3. Set environment variables\n4. Deploy from GitHub`,
        summary: 'Railway deployment configuration guide',
        categoryId: 'kb-cat-deploy',
      },
    ];

    let articlesCreated = 0;
    for (const article of articles) {
      const id = nanoid();
      await db.execute(sql`
        INSERT INTO pmtool_kb_article (
          id, title, slug, content, summary, status, type,
          organization_id, author_id, category_id, tags, published_at
        ) VALUES (
          ${id}, ${article.title}, ${article.slug}, ${article.content}, 
          ${article.summary}, 'published', 'documentation',
          'pm-tool-org', 'arthur-admin', ${article.categoryId}, 
          '["documentation"]'::json, NOW()
        )
        ON CONFLICT (slug) DO NOTHING
      `);
      articlesCreated++;
    }

    return NextResponse.json({
      success: true,
      message: 'Knowledge base setup complete!',
      categoriesCreated: categories.length,
      articlesCreated,
    });
    
  } catch (error: any) {
    console.error('Error setting up knowledge base:', error);
    return NextResponse.json(
      { 
        error: 'Failed to setup knowledge base', 
        details: error.message || error,
        code: error.code 
      },
      { status: 500 }
    );
  }
}