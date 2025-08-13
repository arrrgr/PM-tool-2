import { db } from '@/server/db';
import { 
  organizations, 
  users, 
  projects, 
  tasks, 
  comments,
  activityLogs,
  timeEntries
} from '@/server/db/schema';
// KB tables will be added later
// import { 
//   kbArticles, 
//   kbCategories,
//   kbQuestions 
// } from '@/server/db/schema-knowledge-base';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function seedDemoData() {
  console.log('🚀 Starting demo data seed...');

  try {
    // 1. Create Organization
    console.log('📦 Creating PM Tool Org...');
    const orgId = nanoid();
    await db.insert(organizations).values({
      id: orgId,
      name: 'PM Tool Org',
      slug: 'pm-tool-org',
      description: 'Demo organization showcasing the PM Tool development process',
      settings: {
        features: {
          knowledgeBase: true,
          timeTracking: true,
          reporting: true,
        },
      },
      subscriptionTier: 'enterprise',
    });

    // 2. Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('Demo123!', 10);
    
    const adminId = nanoid();
    const vladId = nanoid();
    const antonId = nanoid();

    await db.insert(users).values([
      {
        id: adminId,
        email: 'arthur@pmtool.demo',
        name: 'Arthur',
        password: hashedPassword,
        role: 'admin',
      },
      {
        id: vladId,
        email: 'vlad@pmtool.demo',
        name: 'Vlad',
        password: hashedPassword,
        role: 'member',
      },
      {
        id: antonId,
        email: 'anton@pmtool.demo',
        name: 'Anton',
        password: hashedPassword,
        role: 'member',
      },
    ]);

    // 3. Create Projects
    console.log('📁 Creating projects...');
    const projectPhase1Id = nanoid();
    const projectPhase2Id = nanoid();
    const projectPhase3Id = nanoid();

    await db.insert(projects).values([
      {
        id: projectPhase1Id,
        name: 'Phase 1 - Core Features',
        key: 'PHASE1',
        description: 'Initial implementation of core PM features including tasks, projects, and basic UI',
        organizationId: orgId,
        leaderId: adminId,
        status: 'completed',
        priority: 'high',
      },
      {
        id: projectPhase2Id,
        name: 'Phase 2 - Advanced Features',
        key: 'PHASE2',
        description: 'Implementation of advanced features including Kanban, time tracking, and reporting',
        organizationId: orgId,
        leaderId: adminId,
        status: 'completed',
        priority: 'high',
      },
      {
        id: projectPhase3Id,
        name: 'Phase 3 - Enterprise Features',
        key: 'PHASE3',
        description: 'Implementation of enterprise features including AI, bulk operations, and integrations',
        organizationId: orgId,
        leaderId: adminId,
        status: 'active',
        priority: 'high',
      },
    ]);

    // 4. Create Epic Tasks and Subtasks based on actual development
    console.log('📝 Creating epics and tasks based on development history...');
    
    // Phase 1 Epic
    const phase1EpicId = nanoid();
    await db.insert(tasks).values({
      id: phase1EpicId,
      key: 'PHASE1-1',
      title: 'Core PM Tool Implementation',
      description: 'Build the foundational features of the project management tool',
      projectId: projectPhase1Id,
      assigneeId: adminId,
      reporterId: adminId,
      status: 'Done',
      priority: 'high',
      type: 'epic',
      isEpic: true,
      progress: 100,
    });

    // Phase 1 Subtasks
    const phase1Tasks = [
      { title: 'Set up Next.js project with TypeScript', assignee: adminId, status: 'Done' },
      { title: 'Configure Tailwind CSS and UI components', assignee: antonId, status: 'Done' },
      { title: 'Implement authentication with NextAuth', assignee: adminId, status: 'Done' },
      { title: 'Create database schema with Drizzle ORM', assignee: vladId, status: 'Done' },
      { title: 'Build task CRUD operations', assignee: vladId, status: 'Done' },
      { title: 'Implement project management', assignee: antonId, status: 'Done' },
      { title: 'Create dashboard with statistics', assignee: adminId, status: 'Done' },
      { title: 'Add task filtering and search', assignee: vladId, status: 'Done' },
      { title: 'Implement comments system', assignee: antonId, status: 'Done' },
      { title: 'Fix authentication issues', assignee: adminId, status: 'Done' },
    ];

    for (let i = 0; i < phase1Tasks.length; i++) {
      const task = phase1Tasks[i];
      await db.insert(tasks).values({
        id: nanoid(),
        key: `PHASE1-${i + 2}`,
        title: task.title,
        projectId: projectPhase1Id,
        parentTaskId: phase1EpicId,
        assigneeId: task.assignee,
        reporterId: adminId,
        status: task.status,
        priority: 'medium',
        type: 'sub-task',
        storyPoints: Math.floor(Math.random() * 5) + 1,
      });
    }

    // Phase 2 Epic
    const phase2EpicId = nanoid();
    await db.insert(tasks).values({
      id: phase2EpicId,
      key: 'PHASE2-1',
      title: 'Advanced Features Implementation',
      description: 'Implement advanced project management features including Kanban boards and reporting',
      projectId: projectPhase2Id,
      assigneeId: adminId,
      reporterId: adminId,
      status: 'Done',
      priority: 'high',
      type: 'epic',
      isEpic: true,
      progress: 100,
    });

    // Phase 2 Subtasks
    const phase2Tasks = [
      { title: 'Build Kanban board with drag-and-drop', assignee: vladId, status: 'Done' },
      { title: 'Implement time tracking feature', assignee: antonId, status: 'Done' },
      { title: 'Create reporting dashboard', assignee: adminId, status: 'Done' },
      { title: 'Add team management features', assignee: vladId, status: 'Done' },
      { title: 'Build knowledge base system', assignee: antonId, status: 'Done' },
      { title: 'Implement activity logs', assignee: adminId, status: 'Done' },
      { title: 'Add email notifications', assignee: vladId, status: 'Done' },
      { title: 'Create project templates', assignee: antonId, status: 'Done' },
    ];

    for (let i = 0; i < phase2Tasks.length; i++) {
      const task = phase2Tasks[i];
      await db.insert(tasks).values({
        id: nanoid(),
        key: `PHASE2-${i + 2}`,
        title: task.title,
        projectId: projectPhase2Id,
        parentTaskId: phase2EpicId,
        assigneeId: task.assignee,
        reporterId: adminId,
        status: task.status,
        priority: 'medium',
        type: 'sub-task',
        storyPoints: Math.floor(Math.random() * 8) + 3,
      });
    }

    // Phase 3 Epic (Current/Active)
    const phase3EpicId = nanoid();
    await db.insert(tasks).values({
      id: phase3EpicId,
      key: 'PHASE3-1',
      title: 'Enterprise Features & Fixes',
      description: 'Implementation of the 8 unfinished features identified during testing',
      projectId: projectPhase3Id,
      assigneeId: adminId,
      reporterId: adminId,
      status: 'Done',
      priority: 'urgent',
      type: 'epic',
      isEpic: true,
      progress: 100,
    });

    // Phase 3 Subtasks (The 8 features we just implemented)
    const phase3Tasks = [
      { title: 'Fix Create Team Dialog hydration issue', assignee: adminId, status: 'Done', description: 'Fixed hydration issue by using DialogTrigger pattern instead of onClick state management' },
      { title: 'Fix Permissions Page runtime error', assignee: vladId, status: 'Done', description: 'Simplified queries to avoid null object conversion errors' },
      { title: 'Implement Settings API Endpoints', assignee: antonId, status: 'Done', description: 'Created /api/user/profile and /api/organizations/settings endpoints' },
      { title: 'Implement File Attachments with S3', assignee: adminId, status: 'Done', description: 'Full S3 integration with upload, download, and delete functionality' },
      { title: 'Implement Bulk Operations functionality', assignee: vladId, status: 'Done', description: 'Enhanced bulk operations with Assign, Labels, and Move functionality' },
      { title: 'Implement Export Features', assignee: antonId, status: 'Done', description: 'Created comprehensive export functionality for tasks and reports (CSV format)' },
      { title: 'Implement AI Knowledge Base Search', assignee: adminId, status: 'Done', description: 'Built AI-powered search with text, semantic, and hybrid search modes' },
      { title: 'Implement Epic/Sub-task Hierarchy', assignee: vladId, status: 'Done', description: 'Full epic/sub-task support with progress tracking' },
    ];

    for (let i = 0; i < phase3Tasks.length; i++) {
      const task = phase3Tasks[i];
      const taskId = nanoid();
      await db.insert(tasks).values({
        id: taskId,
        key: `PHASE3-${i + 2}`,
        title: task.title,
        description: task.description,
        projectId: projectPhase3Id,
        parentTaskId: phase3EpicId,
        assigneeId: task.assignee,
        reporterId: adminId,
        status: task.status,
        priority: 'high',
        type: 'sub-task',
        storyPoints: Math.floor(Math.random() * 13) + 5,
      });

      // Add some comments
      await db.insert(comments).values({
        id: nanoid(),
        taskId,
        authorId: adminId,
        content: `Completed implementation. ${task.description}`,
      });
    }

    // 5. Add some time tracking entries
    console.log('⏱️ Adding time tracking data...');
    const timeEntryTasks = await db.select().from(tasks).limit(10);
    for (const task of timeEntryTasks) {
      if (task.assigneeId) {
        await db.insert(timeEntries).values({
          id: nanoid(),
          taskId: task.id,
          userId: task.assigneeId,
          startTime: new Date(Date.now() - 7200000), // 2 hours ago
          endTime: new Date(Date.now() - 3600000), // 1 hour ago
          duration: 3600, // 1 hour in seconds
          description: 'Working on implementation',
        });
      }
    }

    // 6. Create Knowledge Base from Git History (Skip for now - tables not created yet)
    console.log('📚 Skipping knowledge base creation (tables not ready)...');
    /*
    
    // Create categories
    const devCategoryId = nanoid();
    const docsCategoryId = nanoid();
    const releaseCategoryId = nanoid();

    await db.insert(kbCategories).values([
      {
        id: devCategoryId,
        name: 'Development',
        slug: 'development',
        description: 'Development guides and technical documentation',
        icon: '🛠️',
      },
      {
        id: docsCategoryId,
        name: 'Documentation',
        slug: 'documentation',
        description: 'Project documentation and specifications',
        icon: '📖',
      },
      {
        id: releaseCategoryId,
        name: 'Release Notes',
        slug: 'release-notes',
        description: 'Version history and release notes',
        icon: '🚀',
      },
    ]);

    // Get git log and create articles
    const { stdout: gitLog } = await execAsync('cd "/Users/arturgrishkevich/Documents/Code /Vlad PM Tool Claude Code" && git log --pretty=format:"%H|%an|%ae|%ad|%s|%b" --date=iso -10');
    const commits = gitLog.split('\n').filter(Boolean);

    for (const commit of commits) {
      const [hash, author, email, date, subject, body] = commit.split('|');
      
      // Determine category based on commit message
      let categoryId = devCategoryId;
      let articleType: 'guide' | 'reference' | 'tutorial' = 'reference';
      
      if (subject.toLowerCase().includes('doc')) {
        categoryId = docsCategoryId;
        articleType = 'guide';
      } else if (subject.toLowerCase().includes('feat')) {
        categoryId = releaseCategoryId;
        articleType = 'tutorial';
      }

      await db.insert(kbArticles).values({
        id: nanoid(),
        title: subject,
        slug: `commit-${hash.substring(0, 8)}`,
        content: `## Commit Details\n\n**Author:** ${author}\n**Date:** ${date}\n\n### Changes\n\n${body || 'No detailed description provided.'}\n\n### Commit Hash\n\`${hash}\``,
        summary: subject,
        status: 'published',
        type: articleType,
        authorId: adminId,
        categoryId,
        tags: subject.match(/feat|fix|docs|chore|refactor/gi) || ['development'],
        metadata: {
          views: Math.floor(Math.random() * 100),
          readTime: 3,
          aiGenerated: false,
        },
        publishedAt: new Date(date),
      });
    }

    // Create some KB articles about the features
    const featureArticles = [
      {
        title: 'Getting Started with PM Tool',
        content: `# Getting Started with PM Tool\n\nWelcome to PM Tool! This guide will help you get started with managing your projects effectively.\n\n## Key Features\n\n1. **Task Management** - Create, edit, and track tasks\n2. **Kanban Boards** - Visual project management\n3. **Time Tracking** - Track time spent on tasks\n4. **Reporting** - Generate insights and reports\n5. **AI Knowledge Base** - Smart search and documentation\n\n## First Steps\n\n1. Create your organization\n2. Invite team members\n3. Create your first project\n4. Start adding tasks\n\n## Best Practices\n\n- Use epics for large features\n- Break down work into subtasks\n- Track time for accurate reporting\n- Keep documentation updated`,
        category: docsCategoryId,
      },
      {
        title: 'Using Epic and Sub-task Hierarchy',
        content: `# Epic and Sub-task Hierarchy\n\n## What are Epics?\n\nEpics are large bodies of work that can be broken down into smaller tasks (sub-tasks). They help you organize and track progress on major features or initiatives.\n\n## Creating an Epic\n\n1. Create a new task\n2. Set the type to "Epic"\n3. Add sub-tasks to break down the work\n\n## Benefits\n\n- Better organization of complex work\n- Automatic progress tracking\n- Clear hierarchy and dependencies\n- Improved team coordination`,
        category: devCategoryId,
      },
      {
        title: 'AI-Powered Knowledge Base Search',
        content: `# AI Knowledge Base Search\n\n## Features\n\n### Search Modes\n- **Text Search** - Traditional keyword matching\n- **Semantic Search** - Understanding context and meaning\n- **Hybrid Search** - Combines both approaches\n\n### AI Answers\nGet AI-generated answers based on your documentation, with source citations and confidence scores.\n\n## How to Use\n\n1. Navigate to Knowledge Base\n2. Enter your query\n3. Choose search mode\n4. Enable AI answers for comprehensive responses`,
        category: docsCategoryId,
      },
    ];

    for (const article of featureArticles) {
      await db.insert(kbArticles).values({
        id: nanoid(),
        title: article.title,
        slug: article.title.toLowerCase().replace(/\s+/g, '-'),
        content: article.content,
        summary: article.content.split('\n')[2],
        status: 'published',
        type: 'guide',
        authorId: adminId,
        categoryId: article.category,
        tags: ['guide', 'documentation', 'tutorial'],
        metadata: {
          views: Math.floor(Math.random() * 500) + 100,
          readTime: 5,
          likes: Math.floor(Math.random() * 50),
        },
        publishedAt: new Date(),
      });
    }
    */

    // 7. Add some activity logs
    console.log('📊 Adding activity logs...');
    await db.insert(activityLogs).values([
      {
        id: nanoid(),
        entityType: 'organization',
        entityId: orgId,
        action: 'created',
        userId: adminId,
        metadata: { name: 'PM Tool Org' },
      },
      {
        id: nanoid(),
        entityType: 'project',
        entityId: projectPhase3Id,
        action: 'completed',
        userId: adminId,
        metadata: { name: 'Phase 3 - Enterprise Features' },
      },
    ]);

    console.log('✅ Demo data seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin: arthur@pmtool.demo / Demo123!');
    console.log('  User: vlad@pmtool.demo / Demo123!');
    console.log('  User: anton@pmtool.demo / Demo123!');
    console.log('\n🎯 Organization: PM Tool Org');
    console.log('📊 Created: 3 projects, 26 tasks, knowledge base articles from git history');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

// Run the seed function
seedDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });