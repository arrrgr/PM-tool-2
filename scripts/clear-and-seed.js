const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

function nanoid() {
  return crypto.randomUUID();
}

async function clearAndSeed() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🧹 Clearing existing data...');
    
    // Clear existing data in correct order
    await sql`DELETE FROM pmtool_comment`;
    await sql`DELETE FROM pmtool_task`;
    await sql`DELETE FROM pmtool_project`;
    await sql`DELETE FROM pmtool_activity_log`;
    
    console.log('✅ Cleared existing data');
    
    console.log('🔍 Finding PM Tool Org and users...');
    
    // Get organization
    const org = await sql`
      SELECT id FROM pmtool_organization WHERE slug = 'pm-tool-org' LIMIT 1
    `;
    
    if (org.length === 0) {
      throw new Error('PM Tool Org not found');
    }
    
    const orgId = org[0].id;
    console.log('✅ Found organization:', orgId);
    
    // Get users
    const users = await sql`
      SELECT id, email, name FROM pmtool_user WHERE organization_id = ${orgId}
    `;
    
    const adminId = users.find(u => u.email === 'arthur@pmtool.demo')?.id;
    const vladId = users.find(u => u.email === 'vlad@pmtool.demo')?.id;
    const antonId = users.find(u => u.email === 'anton@pmtool.demo')?.id;
    
    if (!adminId || !vladId || !antonId) {
      throw new Error('Demo users not found');
    }
    
    console.log('✅ Found users');
    
    // Create Projects
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

    // Create Tasks
    console.log('📝 Creating tasks...');
    
    // Phase 1 Tasks
    const phase1Tasks = [
      { title: 'Set up Next.js project with TypeScript', assignee: adminId },
      { title: 'Configure Tailwind CSS and UI components', assignee: antonId },
      { title: 'Implement authentication with NextAuth', assignee: adminId },
      { title: 'Create database schema with Drizzle ORM', assignee: vladId },
      { title: 'Build task CRUD operations', assignee: vladId },
    ];

    for (let i = 0; i < phase1Tasks.length; i++) {
      const task = phase1Tasks[i];
      const taskId = nanoid();
      await sql`
        INSERT INTO pmtool_task (id, key, title, project_id, assignee_id, reporter_id, status, priority, type, story_points)
        VALUES (${taskId}, ${`PHASE1-${i + 1}`}, ${task.title}, ${projectPhase1Id}, ${task.assignee}, ${adminId}, 'Done', 'medium', 'task', ${Math.floor(Math.random() * 5) + 1})
      `;
    }

    // Phase 2 Tasks
    const phase2Tasks = [
      { title: 'Build Kanban board with drag-and-drop', assignee: vladId },
      { title: 'Implement time tracking feature', assignee: antonId },
      { title: 'Create reporting dashboard', assignee: adminId },
      { title: 'Add team management features', assignee: vladId },
      { title: 'Build knowledge base system', assignee: antonId },
    ];

    for (let i = 0; i < phase2Tasks.length; i++) {
      const task = phase2Tasks[i];
      const taskId = nanoid();
      await sql`
        INSERT INTO pmtool_task (id, key, title, project_id, assignee_id, reporter_id, status, priority, type, story_points)
        VALUES (${taskId}, ${`PHASE2-${i + 1}`}, ${task.title}, ${projectPhase2Id}, ${task.assignee}, ${adminId}, 'Done', 'medium', 'task', ${Math.floor(Math.random() * 8) + 3})
      `;
    }

    // Phase 3 Tasks (The 8 features we just implemented)
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

    for (let i = 0; i < phase3Tasks.length; i++) {
      const task = phase3Tasks[i];
      const taskId = nanoid();
      await sql`
        INSERT INTO pmtool_task (id, key, title, description, project_id, assignee_id, reporter_id, status, priority, type, story_points)
        VALUES (${taskId}, ${`PHASE3-${i + 1}`}, ${task.title}, ${task.desc}, ${projectPhase3Id}, ${task.assignee}, ${adminId}, 'Done', 'high', 'task', ${Math.floor(Math.random() * 13) + 5})
      `;

      // Add a comment
      await sql`
        INSERT INTO pmtool_comment (id, task_id, author_id, content)
        VALUES (${nanoid()}, ${taskId}, ${adminId}, ${`Completed: ${task.desc}`})
      `;
    }

    // Add activity logs
    console.log('📊 Adding activity logs...');
    await sql`
      INSERT INTO pmtool_activity_log (entity_type, entity_id, action, user_id, organization_id, metadata)
      VALUES 
        ('organization', ${orgId}, 'created', ${adminId}, ${orgId}, ${JSON.stringify({ name: 'PM Tool Org' })}),
        ('project', ${projectPhase3Id}, 'completed', ${adminId}, ${orgId}, ${JSON.stringify({ name: 'Phase 3 - Enterprise Features' })})
    `;

    console.log('✅ Demo data added successfully!');
    console.log('\n📊 Created:');
    console.log('  - 3 projects (Phase 1, 2, 3)');
    console.log('  - 18 tasks across all phases');
    console.log('  - Comments on Phase 3 tasks');
    console.log('  - Activity logs');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin: arthur@pmtool.demo / Demo123!');
    console.log('  User: vlad@pmtool.demo / Demo123!');
    console.log('  User: anton@pmtool.demo / Demo123!');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

clearAndSeed();