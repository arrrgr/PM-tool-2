-- Knowledge Base Categories
INSERT INTO pmtool_kb_category (id, name, slug, organization_id) VALUES
('kb-cat-1', 'Documentation', 'documentation', 'pm-tool-org'),
('kb-cat-2', 'Features', 'features', 'pm-tool-org'),
('kb-cat-3', 'Bug Fixes', 'bug-fixes', 'pm-tool-org'),
('kb-cat-4', 'Deployment', 'deployment', 'pm-tool-org')
ON CONFLICT (id) DO NOTHING;

-- Knowledge Base Articles
INSERT INTO pmtool_kb_article (id, title, slug, content, summary, status, type, organization_id, author_id, category_id, tags, published_at, created_at, updated_at) VALUES
-- Release Notes
('kb-art-1', 'Release Notes - Development History', 'release-notes', 
'# Release Notes

This document contains the development history and release notes for the PM Tool project.

## Recent Changes

### Aug 13, 2025 - Reorganize user management based on feedback
Commit: `cf423e9` by Artur Grishkevich

---

### Aug 13, 2025 - Add comprehensive role and permission management
Commit: `02e1d9a` by Artur Grishkevich

---

### Aug 13, 2025 - Consolidate user and permissions management
Commit: `08d34d7` by Artur Grishkevich

---

### Aug 13, 2025 - Simplify permissions system to use user roles directly
Commit: `81e7516` by Artur Grishkevich

---

### Aug 13, 2025 - Add trustHost to NextAuth config for Railway deployment
Commit: `e8ac2ac` by Artur Grishkevich

---

### Aug 13, 2025 - Update schema to match production database column name
Commit: `8fd39ab` by Artur Grishkevich

---

### Aug 13, 2025 - Fix Railway deployment build errors
Commit: `ae1cd88` by Artur Grishkevich

---

### Aug 13, 2025 - Implement Phase 2 - Complete all 8 unfinished features
Commit: `dcacb4a` by Artur Grishkevich

---

### Aug 11, 2025 - Update SRS with Phase 1 implementation status
Commit: `83d1fad` by Artur Grishkevich

---

### Aug 11, 2025 - Implement Phase 1 core features - Edit/Delete tasks and Comments
Commit: `6b5db2d` by Artur Grishkevich',
'Complete development history and release notes for the PM Tool project',
'published', 'documentation', 'pm-tool-org', 'arthur-admin', 'kb-cat-1',
'["release-notes", "changelog", "development"]'::json,
NOW(), NOW(), NOW()),

-- Architecture Overview
('kb-art-2', 'Project Architecture Overview', 'architecture',
'# PM Tool Architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React hooks and context

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js

### Deployment
- **Platform**: Railway
- **Database**: Railway PostgreSQL
- **CI/CD**: GitHub integration with Railway

## Key Features

1. **User Management**: Comprehensive user and role management system
2. **Task Management**: Create, edit, delete, and track tasks
3. **Kanban Boards**: Visual task management with drag-and-drop
4. **Permissions System**: Role-based access control
5. **Knowledge Base**: Documentation and article management
6. **Real-time Updates**: Live updates for collaborative work

## Recent Development Phases

- **Phase 1**: Core task management features
- **Phase 2**: Advanced features including Kanban boards
- **Phase 3**: User management and permissions refactoring',
'Complete technical architecture overview of the PM Tool',
'published', 'reference', 'pm-tool-org', 'arthur-admin', 'kb-cat-1',
'["architecture", "overview", "technical"]'::json,
NOW(), NOW(), NOW()),

-- Bug Fixes
('kb-art-3', 'Bug Fixes and Resolutions', 'bug-fixes',
'# Bug Fixes and Resolutions

This document tracks all bug fixes and issue resolutions in the PM Tool project.

## Resolved Issues

### Add trustHost to NextAuth config for Railway deployment

- **Date**: 2025-08-13
- **Author**: Artur Grishkevich
- **Commit**: `e8ac2ac`

### Update schema to match production database column name

- **Date**: 2025-08-13
- **Author**: Artur Grishkevich
- **Commit**: `8fd39ab`

### Fix Railway deployment build errors

- **Date**: 2025-08-13
- **Author**: Artur Grishkevich
- **Commit**: `ae1cd88`

### Add test users to production seed script

- **Date**: 2025-08-11
- **Author**: Artur Grishkevich
- **Commit**: `4161f6b`

### Skip env validation during Railway build

- **Date**: 2025-08-11
- **Author**: Artur Grishkevich
- **Commit**: `c6ad11a`

### Wrap useSearchParams in Suspense boundary

- **Date**: 2025-08-09
- **Author**: Artur Grishkevich
- **Commit**: `f4246e8`

### Add missing NextAuth error page

- **Date**: 2025-08-09
- **Author**: Artur Grishkevich
- **Commit**: `a988401`',
'Complete list of bug fixes and issue resolutions',
'published', 'reference', 'pm-tool-org', 'arthur-admin', 'kb-cat-3',
'["bug-fix", "issues", "resolutions"]'::json,
NOW(), NOW(), NOW()),

-- Deployment Guide
('kb-art-4', 'Deployment Guide and History', 'deployment-guide',
'# Deployment Guide

## Railway Deployment

This project is deployed on Railway. Here is the deployment history and important fixes:

### Add trustHost to NextAuth config for Railway deployment

2025-08-13 - This change addressed deployment-related issues.

### Fix Railway deployment build errors

2025-08-13 - This change addressed deployment-related issues.

### Skip env validation during Railway build

2025-08-11 - This change addressed deployment-related issues.

### Skip env validation during Railway build

2025-08-09 - This change addressed deployment-related issues.

## Key Configuration

- **Trust Host**: Enabled in NextAuth configuration
- **Environment Variables**: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- **Build Command**: npm run build
- **Start Command**: npm run start

## Environment Variables

Make sure the following environment variables are configured in Railway:

```
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.railway.app
```

## Troubleshooting

### UntrustedHost Error
If you encounter an UntrustedHost error, ensure that `trustHost: true` is set in your NextAuth configuration.

### Database Connection Issues
Verify that the DATABASE_URL is correctly formatted and points to your Railway PostgreSQL instance.',
'Complete deployment guide and configuration for Railway',
'published', 'tutorial', 'pm-tool-org', 'arthur-admin', 'kb-cat-4',
'["deployment", "railway", "configuration"]'::json,
NOW(), NOW(), NOW()),

-- Feature: User Management
('kb-art-5', 'Feature: User Management System', 'feature-user-management',
'# User Management System

## Overview

The PM Tool includes a comprehensive user management system that allows administrators to manage team members, roles, and permissions.

## Features

### User Management
- View all users in a table format
- Invite new users to the organization
- Edit user roles
- Activate/deactivate user accounts
- Search and filter users

### Role Management
- Create custom roles
- Define granular permissions
- System roles: Admin, Member, Viewer
- Assign roles to users

### Permission Categories
- Projects: Create, view, edit, delete
- Tasks: Create, view, edit, delete, assign
- Users: View, invite, edit, delete, manage roles
- Time Tracking: Track time, view all, edit all, approve
- Reports: View, create, export
- Knowledge Base: View, create, edit, delete
- Organization: View, edit, billing, settings

## Implementation

The user management system is built using:
- Next.js API routes for backend
- React components with TypeScript
- Role-based access control (RBAC)
- PostgreSQL for data storage',
'Comprehensive user and role management system implementation',
'published', 'guide', 'pm-tool-org', 'arthur-admin', 'kb-cat-2',
'["feature", "user-management", "permissions", "roles"]'::json,
NOW(), NOW(), NOW()),

-- Feature: Kanban Boards
('kb-art-6', 'Feature: Kanban Board Implementation', 'feature-kanban-boards',
'# Kanban Board Implementation

## Overview

Visual task management with drag-and-drop functionality for improved project workflow.

## Features

### Board Functionality
- Drag and drop tasks between columns
- Visual status indicators
- Priority badges
- Assignee avatars
- Due date tracking

### Column States
- To Do
- In Progress
- In Review
- Done
- Custom columns

### Task Cards Display
- Task title and description
- Priority level
- Assignee information
- Due dates
- Comments count
- Attachments indicator

## Technical Implementation

### Technologies Used
- React DnD for drag-and-drop
- TypeScript for type safety
- Tailwind CSS for styling
- Real-time updates via API

### Performance Optimizations
- Virtual scrolling for large boards
- Optimistic UI updates
- Efficient re-rendering',
'Complete Kanban board implementation with drag-and-drop functionality',
'published', 'guide', 'pm-tool-org', 'arthur-admin', 'kb-cat-2',
'["feature", "kanban", "task-management", "drag-and-drop"]'::json,
NOW(), NOW(), NOW()),

-- Getting Started Guide
('kb-art-7', 'Getting Started with PM Tool', 'getting-started',
'# Getting Started with PM Tool

## Quick Start Guide

Welcome to PM Tool! This guide will help you get started with managing your projects and tasks.

## Initial Setup

### 1. Create Your Organization
- Sign up for an account
- Set up your organization profile
- Configure basic settings

### 2. Invite Team Members
- Navigate to Organization > Users
- Click "Invite User"
- Enter email and assign role
- Team member receives invitation email

### 3. Create Your First Project
- Go to Projects page
- Click "New Project"
- Fill in project details
- Set project visibility and team

### 4. Add Tasks
- Open your project
- Click "Add Task"
- Enter task details
- Assign to team members
- Set priority and due date

## Key Features to Explore

### Task Management
- Create, edit, and delete tasks
- Use Kanban boards for visual management
- Track time on tasks
- Add comments and attachments

### Team Collaboration
- Mention team members in comments
- Real-time updates
- Activity tracking
- File sharing

### Reporting
- View project progress
- Time tracking reports
- Export data for analysis',
'Complete getting started guide for new users',
'published', 'tutorial', 'pm-tool-org', 'arthur-admin', 'kb-cat-1',
'["getting-started", "tutorial", "onboarding"]'::json,
NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;