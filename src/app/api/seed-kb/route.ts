import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { kbArticles, kbCategories } from '@/server/db/schema';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  // Simple auth check - only allow in development or with secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (process.env.NODE_ENV === 'production' && secret !== 'seed-kb-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting knowledge base seed...');
    
    // Create categories
    const categories = [
      { id: 'kb-cat-doc', name: 'Documentation', slug: 'documentation', organizationId: 'pm-tool-org' },
      { id: 'kb-cat-feat', name: 'Features', slug: 'features', organizationId: 'pm-tool-org' },
      { id: 'kb-cat-bug', name: 'Bug Fixes', slug: 'bug-fixes', organizationId: 'pm-tool-org' },
      { id: 'kb-cat-deploy', name: 'Deployment', slug: 'deployment', organizationId: 'pm-tool-org' },
    ];

    for (const cat of categories) {
      await db.insert(kbCategories)
        .values(cat)
        .onConflictDoNothing();
    }

    // Create articles
    const articles = [
      {
        id: nanoid(),
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
        status: 'published',
        type: 'documentation',
        organizationId: 'pm-tool-org',
        authorId: 'arthur-admin',
        categoryId: 'kb-cat-doc',
        tags: ['release-notes', 'changelog', 'development'],
        publishedAt: new Date(),
      },
      {
        id: nanoid(),
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
        status: 'published',
        type: 'tutorial',
        organizationId: 'pm-tool-org',
        authorId: 'arthur-admin',
        categoryId: 'kb-cat-doc',
        tags: ['getting-started', 'tutorial', 'onboarding'],
        publishedAt: new Date(),
      },
      {
        id: nanoid(),
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
        status: 'published',
        type: 'guide',
        organizationId: 'pm-tool-org',
        authorId: 'arthur-admin',
        categoryId: 'kb-cat-feat',
        tags: ['feature', 'user-management', 'permissions'],
        publishedAt: new Date(),
      },
      {
        id: nanoid(),
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
        status: 'published',
        type: 'guide',
        organizationId: 'pm-tool-org',
        authorId: 'arthur-admin',
        categoryId: 'kb-cat-feat',
        tags: ['feature', 'kanban', 'task-management'],
        publishedAt: new Date(),
      },
      {
        id: nanoid(),
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
        status: 'published',
        type: 'tutorial',
        organizationId: 'pm-tool-org',
        authorId: 'arthur-admin',
        categoryId: 'kb-cat-deploy',
        tags: ['deployment', 'railway', 'configuration'],
        publishedAt: new Date(),
      },
    ];

    let articlesCreated = 0;
    for (const article of articles) {
      await db.insert(kbArticles)
        .values(article)
        .onConflictDoNothing();
      articlesCreated++;
    }

    return NextResponse.json({
      success: true,
      message: `Knowledge base seeded successfully!`,
      categoriesCreated: categories.length,
      articlesCreated,
    });
    
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to seed knowledge base', details: error },
      { status: 500 }
    );
  }
}