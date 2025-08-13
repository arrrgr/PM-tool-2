const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Load env file manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value.replace(/^["']|["']$/g, '');
  }
});

const postgres = require('postgres');

// Helper to generate IDs
function nanoid() {
  return crypto.randomUUID();
}

async function seedDemoData() {
  const sql = postgres(process.env.DATABASE_URL);
  
  console.log('🚀 Starting demo data seed...');

  try {
    // 1. Create Organization
    console.log('📦 Creating PM Tool Org...');
    const orgId = nanoid();
    await sql`
      INSERT INTO pmtool_organization (id, name, slug, description, settings, subscription_tier)
      VALUES (
        ${orgId},
        'PM Tool Org',
        'pm-tool-org',
        'Demo organization showcasing the PM Tool development process',
        ${JSON.stringify({
          features: {
            knowledgeBase: true,
            timeTracking: true,
            reporting: true,
          },
        })},
        'enterprise'
      )
    `;

    // 2. Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('Demo123!', 10);
    
    const adminId = nanoid();
    const vladId = nanoid();
    const antonId = nanoid();

    await sql`
      INSERT INTO pmtool_user (id, email, name, hashed_password, role, organization_id)
      VALUES 
        (${adminId}, 'arthur@pmtool.demo', 'Arthur', ${hashedPassword}, 'admin', ${orgId}),
        (${vladId}, 'vlad@pmtool.demo', 'Vlad', ${hashedPassword}, 'member', ${orgId}),
        (${antonId}, 'anton@pmtool.demo', 'Anton', ${hashedPassword}, 'member', ${orgId})
    `;

    // 3. Create Projects
    console.log('📁 Creating projects...');
    const projectPhase1Id = nanoid();
    const projectPhase2Id = nanoid();
    const projectPhase3Id = nanoid();

    await sql`
      INSERT INTO pmtool_project (id, name, key, description, organization_id, leader_id, status, priority)
      VALUES 
        (${projectPhase1Id}, 'Phase 1 - Core Features', 'PHASE1', 'Initial implementation of core PM features', ${orgId}, ${adminId}, 'completed', 'high'),
        (${projectPhase2Id}, 'Phase 2 - Advanced Features', 'PHASE2', 'Implementation of advanced features including Kanban', ${orgId}, ${adminId}, 'completed', 'high'),
        (${projectPhase3Id}, 'Phase 3 - Enterprise Features', 'PHASE3', 'Implementation of enterprise features including AI', ${orgId}, ${adminId}, 'active', 'high')
    `;

    // 4. Create Epic Tasks and Subtasks
    console.log('📝 Creating epics and tasks based on development history...');
    
    // Phase 1 Epic
    const phase1EpicId = nanoid();
    await sql`
      INSERT INTO pmtool_task (id, key, title, description, project_id, assignee_id, reporter_id, status, priority, type, is_epic, progress)
      VALUES (${phase1EpicId}, 'PHASE1-1', 'Core PM Tool Implementation', 'Build the foundational features', ${projectPhase1Id}, ${adminId}, ${adminId}, 'Done', 'high', 'epic', true, 100)
    `;

    // Phase 1 Subtasks
    const phase1Tasks = [
      { title: 'Set up Next.js project with TypeScript', assignee: adminId },
      { title: 'Configure Tailwind CSS and UI components', assignee: antonId },
      { title: 'Implement authentication with NextAuth', assignee: adminId },
      { title: 'Create database schema with Drizzle ORM', assignee: vladId },
      { title: 'Build task CRUD operations', assignee: vladId },
      { title: 'Implement project management', assignee: antonId },
      { title: 'Create dashboard with statistics', assignee: adminId },
      { title: 'Add task filtering and search', assignee: vladId },
      { title: 'Implement comments system', assignee: antonId },
      { title: 'Fix authentication issues', assignee: adminId },
    ];

    const phase1TaskIds = [];
    for (let i = 0; i < phase1Tasks.length; i++) {
      const task = phase1Tasks[i];
      const taskId = nanoid();
      phase1TaskIds.push(taskId);
      await sql`
        INSERT INTO pmtool_task (id, key, title, project_id, parent_task_id, assignee_id, reporter_id, status, priority, type, story_points)
        VALUES (${taskId}, ${`PHASE1-${i + 2}`}, ${task.title}, ${projectPhase1Id}, ${phase1EpicId}, ${task.assignee}, ${adminId}, 'Done', 'medium', 'sub-task', ${Math.floor(Math.random() * 5) + 1})
      `;
    }

    // Phase 2 Epic
    const phase2EpicId = nanoid();
    await sql`
      INSERT INTO pmtool_task (id, key, title, description, project_id, assignee_id, reporter_id, status, priority, type, is_epic, progress)
      VALUES (${phase2EpicId}, 'PHASE2-1', 'Advanced Features Implementation', 'Implement advanced PM features', ${projectPhase2Id}, ${adminId}, ${adminId}, 'Done', 'high', 'epic', true, 100)
    `;

    // Phase 2 Subtasks
    const phase2Tasks = [
      { title: 'Build Kanban board with drag-and-drop', assignee: vladId },
      { title: 'Implement time tracking feature', assignee: antonId },
      { title: 'Create reporting dashboard', assignee: adminId },
      { title: 'Add team management features', assignee: vladId },
      { title: 'Build knowledge base system', assignee: antonId },
      { title: 'Implement activity logs', assignee: adminId },
      { title: 'Add email notifications', assignee: vladId },
      { title: 'Create project templates', assignee: antonId },
    ];

    const phase2TaskIds = [];
    for (let i = 0; i < phase2Tasks.length; i++) {
      const task = phase2Tasks[i];
      const taskId = nanoid();
      phase2TaskIds.push(taskId);
      await sql`
        INSERT INTO pmtool_task (id, key, title, project_id, parent_task_id, assignee_id, reporter_id, status, priority, type, story_points)
        VALUES (${taskId}, ${`PHASE2-${i + 2}`}, ${task.title}, ${projectPhase2Id}, ${phase2EpicId}, ${task.assignee}, ${adminId}, 'Done', 'medium', 'sub-task', ${Math.floor(Math.random() * 8) + 3})
      `;
    }

    // Phase 3 Epic (Current/Active)
    const phase3EpicId = nanoid();
    await sql`
      INSERT INTO pmtool_task (id, key, title, description, project_id, assignee_id, reporter_id, status, priority, type, is_epic, progress)
      VALUES (${phase3EpicId}, 'PHASE3-1', 'Enterprise Features & Fixes', 'Implementation of 8 unfinished features', ${projectPhase3Id}, ${adminId}, ${adminId}, 'Done', 'urgent', 'epic', true, 100)
    `;

    // Phase 3 Subtasks (The 8 features we just implemented)
    const phase3Tasks = [
      { title: 'Fix Create Team Dialog hydration issue', assignee: adminId, desc: 'Fixed hydration issue by using DialogTrigger pattern' },
      { title: 'Fix Permissions Page runtime error', assignee: vladId, desc: 'Simplified queries to avoid null object conversion' },
      { title: 'Implement Settings API Endpoints', assignee: antonId, desc: 'Created profile and organization settings endpoints' },
      { title: 'Implement File Attachments with S3', assignee: adminId, desc: 'Full S3 integration with upload/download/delete' },
      { title: 'Implement Bulk Operations functionality', assignee: vladId, desc: 'Enhanced bulk operations with multiple actions' },
      { title: 'Implement Export Features', assignee: antonId, desc: 'CSV export for tasks and reports' },
      { title: 'Implement AI Knowledge Base Search', assignee: adminId, desc: 'AI-powered search with multiple modes' },
      { title: 'Implement Epic/Sub-task Hierarchy', assignee: vladId, desc: 'Full epic support with progress tracking' },
    ];

    const phase3TaskIds = [];
    for (let i = 0; i < phase3Tasks.length; i++) {
      const task = phase3Tasks[i];
      const taskId = nanoid();
      phase3TaskIds.push(taskId);
      await sql`
        INSERT INTO pmtool_task (id, key, title, description, project_id, parent_task_id, assignee_id, reporter_id, status, priority, type, story_points)
        VALUES (${taskId}, ${`PHASE3-${i + 2}`}, ${task.title}, ${task.desc}, ${projectPhase3Id}, ${phase3EpicId}, ${task.assignee}, ${adminId}, 'Done', 'high', 'sub-task', ${Math.floor(Math.random() * 13) + 5})
      `;

      // Add a comment
      await sql`
        INSERT INTO pmtool_comment (id, task_id, author_id, content)
        VALUES (${nanoid()}, ${taskId}, ${adminId}, ${`Completed: ${task.desc}`})
      `;
    }

    // 5. Add Time Tracking Data
    console.log('⏱️ Adding time tracking data...');
    
    // Add time entries for Phase 1 tasks
    for (let i = 0; i < Math.min(5, phase1TaskIds.length); i++) {
      const taskId = phase1TaskIds[i];
      const hours = Math.floor(Math.random() * 6) + 2; // 2-8 hours
      await sql`
        INSERT INTO pmtool_time_entry (id, task_id, user_id, start_time, end_time, duration, description)
        VALUES (
          ${nanoid()}, 
          ${taskId}, 
          ${phase1Tasks[i].assignee},
          ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000).toISOString()},
          ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()},
          ${hours * 3600},
          'Development work'
        )
      `;
    }

    // Add time entries for Phase 2 tasks
    for (let i = 0; i < Math.min(5, phase2TaskIds.length); i++) {
      const taskId = phase2TaskIds[i];
      const hours = Math.floor(Math.random() * 8) + 3; // 3-11 hours
      await sql`
        INSERT INTO pmtool_time_entry (id, task_id, user_id, start_time, end_time, duration, description)
        VALUES (
          ${nanoid()}, 
          ${taskId}, 
          ${phase2Tasks[i].assignee},
          ${new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000).toISOString()},
          ${new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()},
          ${hours * 3600},
          'Feature implementation'
        )
      `;
    }

    // Add time entries for Phase 3 tasks (more recent)
    for (let i = 0; i < phase3TaskIds.length; i++) {
      const taskId = phase3TaskIds[i];
      const hours = Math.floor(Math.random() * 10) + 4; // 4-14 hours
      await sql`
        INSERT INTO pmtool_time_entry (id, task_id, user_id, start_time, end_time, duration, description)
        VALUES (
          ${nanoid()}, 
          ${taskId}, 
          ${phase3Tasks[i].assignee},
          ${new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000).toISOString()},
          ${new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000).toISOString()},
          ${hours * 3600},
          'Bug fixes and enhancements'
        )
      `;
    }

    // 6. Create Knowledge Base (if tables exist)
    console.log('📚 Creating knowledge base content...');
    try {
      // Check if KB tables exist
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'pmtool_kb_category'
        )
      `;
      
      if (result[0].exists) {
        // Create categories
        const devCategoryId = nanoid();
        const docsCategoryId = nanoid();
        const releaseCategoryId = nanoid();

        await sql`
          INSERT INTO pmtool_kb_category (id, name, slug, description, icon, organization_id)
          VALUES 
            (${devCategoryId}, 'Development', 'development', 'Development guides and technical documentation', '🛠️', ${orgId}),
            (${docsCategoryId}, 'Documentation', 'documentation', 'Project documentation and specifications', '📖', ${orgId}),
            (${releaseCategoryId}, 'Release Notes', 'release-notes', 'Version history and release notes', '🚀', ${orgId})
        `;

        // Create articles from git history
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

            await sql`
              INSERT INTO pmtool_kb_article (id, title, slug, content, summary, status, type, organization_id, author_id, category_id, tags, metadata, published_at)
              VALUES (
                ${nanoid()},
                ${subject},
                ${`commit-${hash.substring(0, 8)}`},
                ${`## ${subject}\n\n**Author:** ${author}\n**Date:** ${date}\n\n### Commit: \`${hash.substring(0, 8)}\``},
                ${subject},
                'published',
                'reference',
                ${orgId},
                ${adminId},
                ${categoryId},
                ${JSON.stringify(['development', 'commit'])},
                ${JSON.stringify({ views: Math.floor(Math.random() * 100), readTime: 3 })},
                ${new Date(date).toISOString()}
              )
            `;
          }
        } catch (gitError) {
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
          await sql`
            INSERT INTO pmtool_kb_article (id, title, slug, content, summary, status, type, organization_id, author_id, category_id, tags, metadata, published_at)
            VALUES (
              ${nanoid()},
              ${article.title},
              ${article.slug},
              ${article.content},
              ${article.content.split('\n')[2]},
              'published',
              'guide',
              ${orgId},
              ${adminId},
              ${article.category},
              ${JSON.stringify(['guide', 'documentation'])},
              ${JSON.stringify({ views: Math.floor(Math.random() * 500) + 100, readTime: 5, likes: Math.floor(Math.random() * 50) })},
              ${new Date().toISOString()}
            )
          `;
        }
        console.log('✅ Knowledge base articles created');
      } else {
        console.log('⚠️ KB tables not found, skipping knowledge base creation');
      }
    } catch (kbError) {
      console.log('⚠️ Could not create KB content:', kbError.message);
    }

    // 7. Add activity logs
    console.log('📊 Adding activity logs...');
    await sql`
      INSERT INTO pmtool_activity_log (entity_type, entity_id, action, user_id, organization_id, metadata)
      VALUES 
        ('organization', ${orgId}, 'created', ${adminId}, ${orgId}, ${JSON.stringify({ name: 'PM Tool Org' })}),
        ('project', ${projectPhase3Id}, 'completed', ${adminId}, ${orgId}, ${JSON.stringify({ name: 'Phase 3 - Enterprise Features' })})
    `;

    console.log('✅ Demo data seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin: arthur@pmtool.demo / Demo123!');
    console.log('  User: vlad@pmtool.demo / Demo123!');
    console.log('  User: anton@pmtool.demo / Demo123!');
    console.log('\n🎯 Organization: PM Tool Org');
    console.log('📊 Created:');
    console.log('  - 3 projects (Phase 1, 2, 3)');
    console.log('  - 3 epics with 26 sub-tasks total');
    console.log('  - Time tracking data for all tasks');
    console.log('  - Comments on Phase 3 tasks');
    console.log('  - Knowledge base articles (if tables exist)');
    console.log('  - Activity logs');

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