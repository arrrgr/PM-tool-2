import { sql } from 'drizzle-orm';
import { db } from '../src/server/db/index.js';

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
    
    // Insert articles
    await db.execute(sql`
      INSERT INTO pmtool_kb_article (id, title, slug, content, summary, status, type, organization_id, author_id, category_id, tags, published_at, created_at, updated_at) VALUES
      ('kb-art-1', 'Release Notes - Development History', 'release-notes', 
      ${'# Release Notes\n\nThis document contains the development history and release notes for the PM Tool project.\n\n## Recent Changes\n\n### Aug 13, 2025 - Reorganize user management based on feedback\nCommit: `cf423e9` by Artur Grishkevich\n\n---\n\n### Aug 13, 2025 - Add comprehensive role and permission management\nCommit: `02e1d9a` by Artur Grishkevich\n\n---\n\n### Aug 13, 2025 - Consolidate user and permissions management\nCommit: `08d34d7` by Artur Grishkevich'},
      'Complete development history and release notes for the PM Tool project',
      'published', 'documentation', 'pm-tool-org', 'arthur-admin', 'kb-cat-1',
      '["release-notes", "changelog", "development"]'::json,
      NOW(), NOW(), NOW()),
      
      ('kb-art-2', 'Project Architecture Overview', 'architecture',
      ${'# PM Tool Architecture\n\n## Technology Stack\n\n### Frontend\n- **Framework**: Next.js 15 with App Router\n- **Language**: TypeScript\n- **Styling**: Tailwind CSS\n- **UI Components**: shadcn/ui\n- **State Management**: React hooks and context\n\n### Backend\n- **API**: Next.js API Routes\n- **Database**: PostgreSQL\n- **ORM**: Drizzle ORM\n- **Authentication**: NextAuth.js'},
      'Complete technical architecture overview of the PM Tool',
      'published', 'reference', 'pm-tool-org', 'arthur-admin', 'kb-cat-1',
      '["architecture", "overview", "technical"]'::json,
      NOW(), NOW(), NOW()),
      
      ('kb-art-3', 'Bug Fixes and Resolutions', 'bug-fixes',
      ${'# Bug Fixes and Resolutions\n\nThis document tracks all bug fixes and issue resolutions in the PM Tool project.\n\n## Resolved Issues\n\n### Add trustHost to NextAuth config for Railway deployment\n\n- **Date**: 2025-08-13\n- **Author**: Artur Grishkevich\n- **Commit**: `e8ac2ac`'},
      'Complete list of bug fixes and issue resolutions',
      'published', 'reference', 'pm-tool-org', 'arthur-admin', 'kb-cat-3',
      '["bug-fix", "issues", "resolutions"]'::json,
      NOW(), NOW(), NOW()),
      
      ('kb-art-4', 'Deployment Guide and History', 'deployment-guide',
      ${'# Deployment Guide\n\n## Railway Deployment\n\nThis project is deployed on Railway. Here is the deployment history and important fixes:\n\n### Key Configuration\n\n- **Trust Host**: Enabled in NextAuth configuration\n- **Environment Variables**: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL\n- **Build Command**: npm run build\n- **Start Command**: npm run start'},
      'Complete deployment guide and configuration for Railway',
      'published', 'tutorial', 'pm-tool-org', 'arthur-admin', 'kb-cat-4',
      '["deployment", "railway", "configuration"]'::json,
      NOW(), NOW(), NOW()),
      
      ('kb-art-5', 'Feature: User Management System', 'feature-user-management',
      ${'# User Management System\n\n## Overview\n\nThe PM Tool includes a comprehensive user management system that allows administrators to manage team members, roles, and permissions.\n\n## Features\n\n### User Management\n- View all users in a table format\n- Invite new users to the organization\n- Edit user roles\n- Activate/deactivate user accounts'},
      'Comprehensive user and role management system implementation',
      'published', 'guide', 'pm-tool-org', 'arthur-admin', 'kb-cat-2',
      '["feature", "user-management", "permissions", "roles"]'::json,
      NOW(), NOW(), NOW()),
      
      ('kb-art-6', 'Feature: Kanban Board Implementation', 'feature-kanban-boards',
      ${'# Kanban Board Implementation\n\n## Overview\n\nVisual task management with drag-and-drop functionality for improved project workflow.\n\n## Features\n\n### Board Functionality\n- Drag and drop tasks between columns\n- Visual status indicators\n- Priority badges\n- Assignee avatars\n- Due date tracking'},
      'Complete Kanban board implementation with drag-and-drop functionality',
      'published', 'guide', 'pm-tool-org', 'arthur-admin', 'kb-cat-2',
      '["feature", "kanban", "task-management", "drag-and-drop"]'::json,
      NOW(), NOW(), NOW()),
      
      ('kb-art-7', 'Getting Started with PM Tool', 'getting-started',
      ${'# Getting Started with PM Tool\n\n## Quick Start Guide\n\nWelcome to PM Tool! This guide will help you get started with managing your projects and tasks.\n\n## Initial Setup\n\n### 1. Create Your Organization\n- Sign up for an account\n- Set up your organization profile\n- Configure basic settings'},
      'Complete getting started guide for new users',
      'published', 'tutorial', 'pm-tool-org', 'arthur-admin', 'kb-cat-1',
      '["getting-started", "tutorial", "onboarding"]'::json,
      NOW(), NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('✅ Knowledge base articles created successfully!');
    console.log('📚 7 articles added to the knowledge base');
    
  } catch (error) {
    console.error('❌ Error seeding knowledge base:', error);
    throw error;
  }
}

// Run if this is the main module
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedKnowledgeBase()
    .then(() => {
      console.log('✨ Knowledge base seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed knowledge base:', error);
      process.exit(1);
    });
}

export { seedKnowledgeBase };