const { Client } = require('pg');

async function addKnowledgeBase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create categories
    console.log('Creating knowledge base categories...');
    await client.query(`
      INSERT INTO pmtool_kb_category (id, name, slug, organization_id) VALUES
      ('kb-cat-doc', 'Documentation', 'documentation', 'pm-tool-org'),
      ('kb-cat-feat', 'Features', 'features', 'pm-tool-org'),
      ('kb-cat-bug', 'Bug Fixes', 'bug-fixes', 'pm-tool-org'),
      ('kb-cat-deploy', 'Deployment', 'deployment', 'pm-tool-org')
      ON CONFLICT (id) DO NOTHING
    `);

    // Add articles
    const articles = [
      {
        id: 'kb-001',
        title: 'Release Notes - PM Tool Development',
        slug: 'release-notes-v1',
        content: `# Release Notes

## Version 1.0 - Production Release

### Recent Updates
- **User Management Reorganization**: Improved UI/UX for managing users and permissions
- **Role-Based Access Control**: Comprehensive permission system with custom roles
- **Railway Deployment**: Successfully deployed to production with PostgreSQL
- **Knowledge Base**: Documentation system with categories and search
- **Kanban Boards**: Visual task management with drag-and-drop

### Bug Fixes
- Fixed authentication issues with trustHost configuration
- Resolved database column mapping for production
- Fixed template page errors
- Corrected useSearchParams Suspense boundary issues`,
        summary: 'Complete development history and release notes',
        categoryId: 'kb-cat-doc'
      },
      {
        id: 'kb-002',
        title: 'Getting Started Guide',
        slug: 'getting-started-guide',
        content: `# Getting Started with PM Tool

## Welcome!
This guide will help you get started with the PM Tool.

## First Steps

### 1. Organization Setup
After logging in, you'll be part of an organization. Admins can manage organization settings.

### 2. Creating Projects
- Navigate to Projects page
- Click "New Project"
- Fill in project details
- Assign team members

### 3. Managing Tasks
- Create tasks within projects
- Use Kanban board for visual management
- Assign tasks to team members
- Track time and progress

### 4. Team Collaboration
- Use comments for discussion
- Mention team members with @
- Attach files to tasks
- Track activity in real-time`,
        summary: 'Quick start guide for new users',
        categoryId: 'kb-cat-doc'
      },
      {
        id: 'kb-003',
        title: 'User Management Features',
        slug: 'user-management-features',
        content: `# User Management System

## Overview
Comprehensive system for managing users, roles, and permissions.

## Key Features

### User Management
- **User Table View**: See all organization members at a glance
- **Invite System**: Send email invitations to new team members
- **Role Assignment**: Assign roles to control access levels
- **Status Control**: Activate or deactivate user accounts

### Role System
- **Default Roles**: Admin, Member, Viewer
- **Custom Roles**: Create roles with specific permissions
- **Granular Permissions**: Control access to projects, tasks, reports, etc.

### Access Levels
- **Admin**: Full system access
- **Member**: Standard team member access
- **Viewer**: Read-only access
- **Custom**: Define your own permission sets`,
        summary: 'Complete user and role management documentation',
        categoryId: 'kb-cat-feat'
      },
      {
        id: 'kb-004',
        title: 'Kanban Board Guide',
        slug: 'kanban-board-guide',
        content: `# Kanban Board

## Visual Task Management

### Features
- **Drag & Drop**: Move tasks between columns easily
- **Status Columns**: To Do, In Progress, In Review, Done
- **Task Cards**: Show priority, assignee, due date
- **Quick Actions**: Edit, delete, or view task details

### Using the Board
1. View all project tasks in column format
2. Drag tasks to change their status
3. Click on a task to view details
4. Use filters to find specific tasks

### Best Practices
- Keep tasks in appropriate columns
- Update task status regularly
- Use priority levels effectively
- Add clear descriptions to tasks`,
        summary: 'How to use the Kanban board effectively',
        categoryId: 'kb-cat-feat'
      },
      {
        id: 'kb-005',
        title: 'Deployment Configuration',
        slug: 'deployment-config',
        content: `# Railway Deployment Guide

## Environment Setup

### Required Variables
- DATABASE_URL: PostgreSQL connection string
- NEXTAUTH_SECRET: Secret for authentication
- NEXTAUTH_URL: Your app URL

### Configuration Steps
1. Create Railway project
2. Add PostgreSQL database
3. Set environment variables
4. Deploy from GitHub

### Troubleshooting
- **Auth Errors**: Check NEXTAUTH_URL matches your domain
- **Database Issues**: Verify DATABASE_URL is correct
- **Build Failures**: Check Node version and dependencies`,
        summary: 'Railway deployment configuration guide',
        categoryId: 'kb-cat-deploy'
      }
    ];

    for (const article of articles) {
      console.log(`Adding article: ${article.title}`);
      await client.query(`
        INSERT INTO pmtool_kb_article (
          id, title, slug, content, summary, status, type,
          organization_id, author_id, category_id, tags,
          published_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, 'published', 'documentation',
          'pm-tool-org', 'arthur-admin', $6, '["documentation"]'::json,
          NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = NOW()
      `, [article.id, article.title, article.slug, article.content, article.summary, article.categoryId]);
    }

    console.log('✅ Knowledge base articles added successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

addKnowledgeBase()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });