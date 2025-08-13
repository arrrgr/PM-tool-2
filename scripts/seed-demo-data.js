const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load env file manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value.replace(/^["']|["']$/g, '');
  }
});

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Helper to generate IDs
function nanoid() {
  return crypto.randomUUID();
}

// Import schemas
const { 
  organizations, 
  users, 
  projects, 
  tasks, 
  comments,
  activityLogs,
  timeEntries
} = require('../src/server/db/schema');

const { 
  kbArticles, 
  kbCategories 
} = require('../src/server/db/schema-knowledge-base');

// Create database connection
const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

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
        organizationId: orgId,
      },
      {
        id: vladId,
        email: 'vlad@pmtool.demo',
        name: 'Vlad',
        password: hashedPassword,
        role: 'member',
        organizationId: orgId,
      },
      {
        id: antonId,
        email: 'anton@pmtool.demo',
        name: 'Anton',
        password: hashedPassword,
        role: 'member',
        organizationId: orgId,
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

    // 4. Create Epic Tasks and Subtasks
    console.log('📝 Creating epics and tasks based on development history...');
    
    // Phase 1 Epic
    const phase1EpicId = nanoid();
    await db.insert(tasks).values({
      id: phase1EpicId,
      key: 'PHASE1-1',
      title: 'Core PM Tool Implementation',
      description: 'Build the foundational features of the project management tool',
      projectId: projectPhase1Id,
      organizationId: orgId,
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
        organizationId: orgId,
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
      organizationId: orgId,
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
        organizationId: orgId,
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
      organizationId: orgId,
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
      { title: 'Fix Create Team Dialog hydration issue', assignee: adminId, status: 'Done', description: 'Fixed hydration issue by using DialogTrigger pattern' },
      { title: 'Fix Permissions Page runtime error', assignee: vladId, status: 'Done', description: 'Simplified queries to avoid null object conversion' },
      { title: 'Implement Settings API Endpoints', assignee: antonId, status: 'Done', description: 'Created profile and organization settings endpoints' },
      { title: 'Implement File Attachments with S3', assignee: adminId, status: 'Done', description: 'Full S3 integration with upload/download/delete' },
      { title: 'Implement Bulk Operations functionality', assignee: vladId, status: 'Done', description: 'Enhanced bulk operations with multiple actions' },
      { title: 'Implement Export Features', assignee: antonId, status: 'Done', description: 'CSV export for tasks and reports' },
      { title: 'Implement AI Knowledge Base Search', assignee: adminId, status: 'Done', description: 'AI-powered search with multiple modes' },
      { title: 'Implement Epic/Sub-task Hierarchy', assignee: vladId, status: 'Done', description: 'Full epic support with progress tracking' },
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
        organizationId: orgId,
        assigneeId: task.assignee,
        reporterId: adminId,
        status: task.status,
        priority: 'high',
        type: 'sub-task',
        storyPoints: Math.floor(Math.random() * 13) + 5,
      });

      // Add a comment
      await db.insert(comments).values({
        id: nanoid(),
        taskId,
        authorId: adminId,
        content: `Completed: ${task.description}`,
      });
    }

    // 5. Create Knowledge Base from Git History
    console.log('📚 Creating knowledge base from git history...');
    
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

    // Get git commits and create articles
    try {
      const gitLog = execSync('git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso -5', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const commits = gitLog.split('\n').filter(Boolean);
      
      for (const commit of commits) {
        const [hash, author, email, date, subject] = commit.split('|');
        
        let categoryId = devCategoryId;
        if (subject.toLowerCase().includes('doc')) categoryId = docsCategoryId;
        if (subject.toLowerCase().includes('feat')) categoryId = releaseCategoryId;

        await db.insert(kbArticles).values({
          id: nanoid(),
          title: subject,
          slug: `commit-${hash.substring(0, 8)}`,
          content: `## ${subject}\n\n**Author:** ${author}\n**Date:** ${date}\n\n### Commit: \`${hash.substring(0, 8)}\``,
          summary: subject,
          status: 'published',
          type: 'reference',
          authorId: adminId,
          categoryId,
          tags: ['development', 'commit'],
          metadata: {
            views: Math.floor(Math.random() * 100),
            readTime: 3,
          },
          publishedAt: new Date(date),
        });
      }
    } catch (error) {
      console.log('Note: Could not read git history, skipping commit articles');
    }

    // Create feature documentation articles
    const featureArticles = [
      {
        title: 'Getting Started with PM Tool',
        slug: 'getting-started',
        content: `# Getting Started\n\nWelcome to PM Tool! This comprehensive project management solution helps teams collaborate effectively.\n\n## Key Features\n- Task Management\n- Kanban Boards\n- Time Tracking\n- AI-powered Knowledge Base\n- Reporting & Analytics`,
        category: docsCategoryId,
      },
      {
        title: 'Using Epics and Sub-tasks',
        slug: 'epics-subtasks',
        content: `# Epic and Sub-task Management\n\nEpics help you organize large features into manageable pieces.\n\n## Creating Epics\n1. Create a task and set type to "Epic"\n2. Add sub-tasks to break down the work\n3. Track progress automatically`,
        category: devCategoryId,
      },
      {
        title: 'AI Knowledge Base Search Guide',
        slug: 'ai-search-guide',
        content: `# AI-Powered Search\n\nOur knowledge base uses AI to provide intelligent search results.\n\n## Search Modes\n- Text Search: Traditional keyword matching\n- Semantic Search: Context-aware results\n- Hybrid Search: Best of both approaches`,
        category: docsCategoryId,
      },
    ];

    for (const article of featureArticles) {
      await db.insert(kbArticles).values({
        id: nanoid(),
        title: article.title,
        slug: article.slug,
        content: article.content,
        summary: article.content.split('\n')[2],
        status: 'published',
        type: 'guide',
        authorId: adminId,
        categoryId: article.category,
        tags: ['guide', 'documentation'],
        metadata: {
          views: Math.floor(Math.random() * 500) + 100,
          readTime: 5,
          likes: Math.floor(Math.random() * 50),
        },
        publishedAt: new Date(),
      });
    }

    // 6. Add activity logs
    console.log('📊 Adding activity logs...');
    await db.insert(activityLogs).values([
      {
        id: nanoid(),
        entityType: 'organization',
        entityId: orgId,
        action: 'created',
        userId: adminId,
        organizationId: orgId,
        metadata: { name: 'PM Tool Org' },
      },
      {
        id: nanoid(),
        entityType: 'project',
        entityId: projectPhase3Id,
        action: 'completed',
        userId: adminId,
        organizationId: orgId,
        metadata: { name: 'Phase 3 - Enterprise Features' },
      },
    ]);

    console.log('✅ Demo data seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin: arthur@pmtool.demo / Demo123!');
    console.log('  User: vlad@pmtool.demo / Demo123!');
    console.log('  User: anton@pmtool.demo / Demo123!');
    console.log('\n🎯 Organization: PM Tool Org');
    console.log('📊 Created: 3 projects, 26+ tasks, knowledge base articles');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    await sql.end();
    process.exit(1);
  }
}

// Run the seed
seedDemoData();