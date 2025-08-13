import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  // Simple auth check - only allow with secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'setup-knowledge-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Creating knowledge base tables with correct schema...');
    
    // Create categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pmtool_knowledge_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7),
        icon VARCHAR(50),
        parent_id UUID REFERENCES pmtool_knowledge_categories(id),
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create articles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pmtool_knowledge_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        category VARCHAR(100),
        tags JSONB DEFAULT '[]'::jsonb,
        embedding JSONB,
        ai_generated BOOLEAN DEFAULT false,
        author_id VARCHAR(255) NOT NULL,
        project_id UUID,
        is_published BOOLEAN DEFAULT true,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create feedback table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pmtool_article_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id UUID NOT NULL REFERENCES pmtool_knowledge_articles(id),
        user_id VARCHAR(255) NOT NULL,
        helpful BOOLEAN NOT NULL,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create AI queries table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pmtool_ai_queries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        context JSONB,
        tokens INTEGER,
        response_time INTEGER,
        helpful BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    console.log('Tables created. Adding sample articles...');

    // Insert categories
    const categories = [
      { name: 'Documentation', description: 'Technical documentation and guides' },
      { name: 'Features', description: 'Feature descriptions and tutorials' },
      { name: 'Best Practices', description: 'Recommended practices and patterns' },
      { name: 'FAQ', description: 'Frequently asked questions' },
      { name: 'Technical', description: 'Technical implementation details' },
    ];

    for (const cat of categories) {
      await db.execute(sql`
        INSERT INTO pmtool_knowledge_categories (name, description)
        VALUES (${cat.name}, ${cat.description})
        ON CONFLICT (name) DO NOTHING
      `);
    }

    // Create sample articles
    const articles = [
      {
        title: 'PM Tool Overview and Features',
        content: `# PM Tool Overview

## Introduction
The PM Tool is a comprehensive project management solution designed for modern teams. It combines task management, team collaboration, and knowledge sharing in one platform.

## Core Features

### Project Management
- Create and manage multiple projects
- Set project goals and milestones
- Track project progress with visual dashboards
- Assign team members and define roles

### Task Management
- Create tasks with detailed descriptions
- Set priorities and due dates
- Assign tasks to team members
- Track task status (To Do, In Progress, In Review, Done)
- Add comments and attachments
- Time tracking for accurate estimates

### Kanban Boards
- Visual task management with drag-and-drop
- Customizable columns for workflow stages
- Quick task updates and status changes
- Filter and search capabilities

### Team Collaboration
- Real-time updates and notifications
- @mentions in comments
- File attachments and sharing
- Activity feeds and audit logs

### Knowledge Base
- Centralized documentation
- AI-powered search
- Article categorization
- Markdown support for rich content

### User Management
- Role-based access control
- Team member invitations
- Permission management
- Organization settings

## Benefits
- Improved team productivity
- Better project visibility
- Streamlined communication
- Reduced context switching
- Data-driven decision making`,
        summary: 'Complete overview of PM Tool features and capabilities',
        category: 'Documentation',
        tags: ['overview', 'features', 'getting-started'],
      },
      {
        title: 'Getting Started with Task Management',
        content: `# Getting Started with Task Management

## Creating Your First Task

### Step 1: Navigate to Tasks
Click on "Tasks" in the sidebar to access the task management interface.

### Step 2: Create a New Task
1. Click the "New Task" button
2. Fill in the task details:
   - Title (required)
   - Description (use Markdown for formatting)
   - Project assignment
   - Priority level
   - Due date
   - Assignee

### Step 3: Task Properties

#### Priority Levels
- **High**: Critical tasks that block other work
- **Medium**: Important tasks with flexible deadlines
- **Low**: Nice-to-have or future improvements

#### Status Workflow
- **To Do**: Task is planned but not started
- **In Progress**: Active work is happening
- **In Review**: Task is complete and awaiting review
- **Done**: Task is fully complete

### Working with Tasks

#### Adding Comments
- Click on a task to open details
- Use the comment section for updates
- @mention team members for notifications

#### Time Tracking
- Log time spent on tasks
- View time estimates vs actual
- Generate time reports

#### Attachments
- Upload relevant files
- Support for images, documents, and code files
- Preview attachments inline

## Best Practices

1. **Write Clear Descriptions**: Include acceptance criteria and context
2. **Set Realistic Due Dates**: Account for dependencies and review time
3. **Regular Updates**: Keep status and progress current
4. **Use Labels**: Organize tasks with consistent labeling
5. **Link Related Tasks**: Show dependencies and relationships`,
        summary: 'Step-by-step guide for effective task management',
        category: 'Features',
        tags: ['tasks', 'tutorial', 'workflow'],
      },
      {
        title: 'Kanban Board Best Practices',
        content: `# Kanban Board Best Practices

## Understanding Kanban

Kanban is a visual system for managing work as it moves through a process. The PM Tool's Kanban board helps teams visualize their workflow and optimize efficiency.

## Setting Up Your Board

### Column Configuration
- **To Do**: New and planned tasks
- **In Progress**: Active work (limit WIP)
- **In Review**: Completed work awaiting approval
- **Done**: Fully completed and approved

### Work In Progress (WIP) Limits
- Set maximum tasks per column
- Prevents overload and bottlenecks
- Encourages task completion over starting new work

## Using the Board Effectively

### Daily Workflow
1. **Morning Stand-up**: Review board status
2. **Pull System**: Pull tasks when capacity available
3. **Update Regularly**: Move cards as work progresses
4. **Flag Blockers**: Identify and resolve impediments

### Visual Indicators
- **Priority Colors**: Red (High), Yellow (Medium), Green (Low)
- **Due Dates**: Visual warnings for approaching deadlines
- **Assignee Avatars**: Quick identification of responsibility
- **Labels**: Categorize by type, component, or team

## Advanced Features

### Filtering and Search
- Filter by assignee, priority, or label
- Search within task titles and descriptions
- Save custom views for quick access

### Swimlanes
- Group tasks by project or category
- Horizontal organization for better visibility
- Useful for multi-project teams

### Metrics and Analytics
- Cycle time tracking
- Throughput measurements
- Bottleneck identification
- Velocity trends

## Tips for Success

1. **Keep Cards Small**: Break large tasks into smaller pieces
2. **Regular Reviews**: Weekly retrospectives on board flow
3. **Continuous Improvement**: Adjust columns and limits based on data
4. **Team Agreements**: Document working agreements and policies
5. **Visual Management**: Use colors and labels consistently`,
        summary: 'Optimize your workflow with Kanban board best practices',
        category: 'Best Practices',
        tags: ['kanban', 'agile', 'workflow', 'productivity'],
      },
      {
        title: 'User Roles and Permissions Guide',
        content: `# User Roles and Permissions

## Role Overview

### Admin Role
Full system access with abilities to:
- Manage organization settings
- Create and delete projects
- Manage all users and roles
- Access all features and data
- Configure integrations
- View analytics and reports

### Member Role
Standard team member access:
- Create and manage own tasks
- Collaborate on assigned projects
- Use knowledge base
- Participate in discussions
- Track time on tasks
- View team dashboards

### Viewer Role
Read-only access for stakeholders:
- View projects and tasks
- Read knowledge base articles
- Access reports and dashboards
- Cannot create or modify content

## Managing Permissions

### Granting Access
1. Navigate to Organization settings
2. Select Users tab
3. Click "Invite User"
4. Assign appropriate role
5. Send invitation email

### Custom Permissions
- Create custom roles for specific needs
- Granular control over features
- Project-specific permissions
- Department-based access

### Permission Matrix

| Feature | Admin | Member | Viewer |
|---------|-------|--------|--------|
| Create Projects | ✓ | ✗ | ✗ |
| Create Tasks | ✓ | ✓ | ✗ |
| Edit Tasks | ✓ | ✓* | ✗ |
| Delete Tasks | ✓ | ✓* | ✗ |
| Manage Users | ✓ | ✗ | ✗ |
| View Reports | ✓ | ✓ | ✓ |
| Knowledge Base Write | ✓ | ✓ | ✗ |
| Knowledge Base Read | ✓ | ✓ | ✓ |

*Own tasks only

## Security Best Practices

1. **Principle of Least Privilege**: Grant minimum necessary access
2. **Regular Audits**: Review permissions quarterly
3. **Offboarding Process**: Remove access immediately when needed
4. **Two-Factor Authentication**: Enable for all admin accounts
5. **Activity Monitoring**: Review audit logs regularly`,
        summary: 'Understanding and managing user roles and permissions',
        category: 'Documentation',
        tags: ['security', 'permissions', 'roles', 'access-control'],
      },
      {
        title: 'Troubleshooting Common Issues',
        content: `# Troubleshooting Guide

## Common Issues and Solutions

### Login Problems

#### Can't Sign In
- **Check credentials**: Ensure email and password are correct
- **Password reset**: Use "Forgot Password" link
- **Account status**: Verify account is active with admin
- **Browser issues**: Clear cache and cookies

#### Session Timeout
- Sessions expire after 24 hours of inactivity
- Enable "Remember Me" for longer sessions
- Check organization security settings

### Task Management Issues

#### Tasks Not Saving
- Check internet connection
- Verify you have edit permissions
- Ensure required fields are filled
- Try refreshing the page

#### Kanban Board Not Loading
- Clear browser cache
- Check for JavaScript errors (F12 console)
- Verify project permissions
- Try different browser

### Performance Problems

#### Slow Loading
- Check internet speed
- Reduce number of visible tasks (use filters)
- Close unnecessary browser tabs
- Update to latest browser version

#### Search Not Working
- Rebuild search index (Admin settings)
- Check search syntax
- Verify content is published
- Wait for indexing (new content)

### Notification Issues

#### Not Receiving Emails
- Check spam/junk folder
- Verify email in profile settings
- Check notification preferences
- Contact admin for email server status

#### Missing In-App Notifications
- Enable browser notifications
- Check notification settings
- Verify you're mentioned correctly (@username)
- Refresh notification panel

## Getting Help

### Self-Service Resources
- Knowledge Base articles
- Video tutorials
- Community forum
- API documentation

### Support Channels
- In-app chat support
- Email: support@pmtool.com
- Help ticket system
- Phone support (Enterprise)

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Unauthorized | Sign in again |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify URL/resource exists |
| 500 | Server Error | Try again later |
| 503 | Service Unavailable | Maintenance in progress |`,
        summary: 'Solutions for common issues and how to get help',
        category: 'FAQ',
        tags: ['troubleshooting', 'support', 'help', 'errors'],
      },
    ];

    for (const article of articles) {
      await db.execute(sql`
        INSERT INTO pmtool_knowledge_articles (
          title, content, summary, category, tags,
          author_id, is_published, view_count
        ) VALUES (
          ${article.title}, 
          ${article.content}, 
          ${article.summary},
          ${article.category},
          ${JSON.stringify(article.tags)}::jsonb,
          'system',
          true,
          0
        )
      `);
    }

    return NextResponse.json({
      success: true,
      message: 'Knowledge base setup complete!',
      categoriesCreated: categories.length,
      articlesCreated: articles.length,
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