const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const crypto = require('crypto');

// UUID v4 generator
const uuidv4 = () => crypto.randomUUID();

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/pmtool';
const sql = postgres(connectionString);
const db = drizzle(sql);

async function seedAdvancedFeatures() {
  console.log('🌱 Seeding advanced features...');

  try {
    // Get the first organization
    const [organization] = await sql`
      SELECT id, name FROM pmtool_organization LIMIT 1
    `;

    if (!organization) {
      console.error('❌ No organization found. Please run the main seed script first.');
      return;
    }

    console.log(`📋 Using organization: ${organization.name}`);

    // Get the first user (admin)
    const [adminUser] = await sql`
      SELECT id, name, email FROM pmtool_user 
      WHERE organization_id = ${organization.id} 
      LIMIT 1
    `;

    if (!adminUser) {
      console.error('❌ No users found in organization.');
      return;
    }

    console.log(`👤 Using admin user: ${adminUser.name}`);

    // 1. Create default roles
    console.log('\n📋 Creating default roles...');
    
    const roles = [
      {
        id: uuidv4(),
        name: 'Admin',
        description: 'Full access to all resources',
        organization_id: organization.id,
        permissions: JSON.stringify([
          'project:view', 'project:create', 'project:edit', 'project:delete', 'project:manage_members',
          'task:view', 'task:create', 'task:edit', 'task:delete', 'task:assign', 'task:comment',
          'team:view', 'team:create', 'team:edit', 'team:delete', 'team:manage_members',
          'org:view', 'org:edit', 'org:manage_members', 'org:manage_billing', 'org:manage_settings',
          'kb:view', 'kb:create', 'kb:edit', 'kb:delete',
          'template:view', 'template:create', 'template:edit', 'template:delete', 'template:use'
        ]),
        type: 'system',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Manager',
        description: 'Can manage projects and teams',
        organization_id: organization.id,
        permissions: JSON.stringify([
          'project:view', 'project:create', 'project:edit', 'project:manage_members',
          'task:view', 'task:create', 'task:edit', 'task:assign', 'task:comment',
          'team:view', 'team:create', 'team:edit', 'team:manage_members',
          'kb:view', 'kb:create', 'kb:edit',
          'template:view', 'template:create', 'template:use'
        ]),
        type: 'system',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Member',
        description: 'Standard team member access',
        organization_id: organization.id,
        permissions: JSON.stringify([
          'project:view',
          'task:view', 'task:create', 'task:edit', 'task:comment',
          'team:view',
          'kb:view',
          'template:view', 'template:use'
        ]),
        type: 'system',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Viewer',
        description: 'Read-only access',
        organization_id: organization.id,
        permissions: JSON.stringify([
          'project:view',
          'task:view',
          'team:view',
          'kb:view',
          'template:view'
        ]),
        type: 'system',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const role of roles) {
      await sql`
        INSERT INTO pmtool_role (id, name, description, organization_id, permissions, type, is_default, created_at, updated_at)
        VALUES (${role.id}, ${role.name}, ${role.description}, ${role.organization_id}, ${role.permissions}, ${role.type}, ${role.is_default}, ${role.created_at}, ${role.updated_at})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log(`✅ Created ${roles.length} roles`);

    // Assign admin role to the first user
    const adminRole = roles.find(r => r.name === 'Admin');
    await sql`
      INSERT INTO pmtool_user_role (user_id, role_id, scope, scope_id, granted_at)
      VALUES (${adminUser.id}, ${adminRole.id}, 'organization', ${organization.id}, ${new Date().toISOString()})
      ON CONFLICT DO NOTHING
    `;
    console.log(`✅ Assigned Admin role to ${adminUser.name}`);

    // 2. Create project templates
    console.log('\n📋 Creating project templates...');
    
    const templates = [
      {
        id: uuidv4(),
        name: 'Software Development Project',
        description: 'Standard template for software development projects with agile workflow',
        key: 'SDP',
        color: '#6366f1',
        is_public: false,
        category: 'development',
        tags: JSON.stringify(['agile', 'scrum', 'software']),
        task_templates: JSON.stringify([
          { title: 'Setup development environment', type: 'task', priority: 'high', estimatedHours: 4 },
          { title: 'Create project repository', type: 'task', priority: 'high', estimatedHours: 2 },
          { title: 'Design system architecture', type: 'task', priority: 'high', estimatedHours: 8 },
          { title: 'Implement authentication', type: 'feature', priority: 'high', estimatedHours: 16 },
          { title: 'Build core features', type: 'feature', priority: 'medium', estimatedHours: 40 },
          { title: 'Write unit tests', type: 'task', priority: 'medium', estimatedHours: 20 },
          { title: 'Perform integration testing', type: 'task', priority: 'medium', estimatedHours: 16 },
          { title: 'Deploy to staging', type: 'task', priority: 'medium', estimatedHours: 4 },
          { title: 'User acceptance testing', type: 'task', priority: 'high', estimatedHours: 8 },
          { title: 'Deploy to production', type: 'task', priority: 'high', estimatedHours: 4 }
        ]),
        workflow_states: JSON.stringify(['To Do', 'In Progress', 'Code Review', 'Testing', 'Done']),
        organization_id: organization.id,
        created_by: adminUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Marketing Campaign',
        description: 'Template for planning and executing marketing campaigns',
        key: 'MKT',
        color: '#ec4899',
        is_public: false,
        category: 'marketing',
        tags: JSON.stringify(['marketing', 'campaign', 'promotion']),
        task_templates: JSON.stringify([
          { title: 'Define campaign objectives', type: 'task', priority: 'high', estimatedHours: 4 },
          { title: 'Identify target audience', type: 'task', priority: 'high', estimatedHours: 6 },
          { title: 'Create campaign messaging', type: 'task', priority: 'high', estimatedHours: 8 },
          { title: 'Design creative assets', type: 'task', priority: 'medium', estimatedHours: 16 },
          { title: 'Setup tracking and analytics', type: 'task', priority: 'medium', estimatedHours: 4 },
          { title: 'Launch campaign', type: 'task', priority: 'high', estimatedHours: 2 },
          { title: 'Monitor performance', type: 'task', priority: 'medium', estimatedHours: 10 },
          { title: 'Optimize based on data', type: 'task', priority: 'medium', estimatedHours: 8 },
          { title: 'Create campaign report', type: 'task', priority: 'low', estimatedHours: 4 }
        ]),
        workflow_states: JSON.stringify(['Planning', 'In Progress', 'Review', 'Live', 'Complete']),
        organization_id: organization.id,
        created_by: adminUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Employee Onboarding',
        description: 'Standardized process for onboarding new employees',
        key: 'ONB',
        color: '#10b981',
        is_public: false,
        category: 'hr',
        tags: JSON.stringify(['hr', 'onboarding', 'employee']),
        task_templates: JSON.stringify([
          { title: 'Send welcome email', type: 'task', priority: 'high', estimatedHours: 0.5 },
          { title: 'Prepare workspace', type: 'task', priority: 'high', estimatedHours: 2 },
          { title: 'Setup IT equipment', type: 'task', priority: 'high', estimatedHours: 3 },
          { title: 'Create user accounts', type: 'task', priority: 'high', estimatedHours: 2 },
          { title: 'Schedule orientation meeting', type: 'task', priority: 'high', estimatedHours: 0.5 },
          { title: 'Complete paperwork', type: 'task', priority: 'medium', estimatedHours: 2 },
          { title: 'Conduct office tour', type: 'task', priority: 'low', estimatedHours: 1 },
          { title: 'Assign buddy/mentor', type: 'task', priority: 'medium', estimatedHours: 1 },
          { title: 'Schedule training sessions', type: 'task', priority: 'medium', estimatedHours: 1 },
          { title: '30-day check-in', type: 'task', priority: 'medium', estimatedHours: 1 }
        ]),
        workflow_states: JSON.stringify(['Pending', 'In Progress', 'Review', 'Completed']),
        organization_id: organization.id,
        created_by: adminUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const template of templates) {
      await sql`
        INSERT INTO pmtool_project_template (
          id, name, description, key, color, is_public, category, tags, 
          task_templates, workflow_states, organization_id, created_by, created_at, updated_at
        )
        VALUES (
          ${template.id}, ${template.name}, ${template.description}, ${template.key}, 
          ${template.color}, ${template.is_public}, ${template.category}, ${template.tags},
          ${template.task_templates}, ${template.workflow_states}, ${template.organization_id}, 
          ${template.created_by}, ${template.created_at}, ${template.updated_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log(`✅ Created ${templates.length} project templates`);

    // 3. Create knowledge base articles
    console.log('\n📋 Creating knowledge base articles...');
    
    const articles = [
      {
        id: uuidv4(),
        title: 'Getting Started with PM Tool',
        slug: 'getting-started',
        content: `# Getting Started with PM Tool

Welcome to PM Tool! This guide will help you get started with managing your projects effectively.

## Key Features

1. **Project Management**: Create and manage multiple projects
2. **Task Tracking**: Track tasks with different statuses and priorities
3. **Team Collaboration**: Work together with your team members
4. **Knowledge Base**: Store and share important information
5. **Templates**: Use templates to quickly start new projects

## First Steps

1. Create your first project
2. Add team members
3. Create tasks and assign them
4. Track progress on the dashboard

## Need Help?

Check out our other knowledge base articles or contact support.`,
        category: 'getting-started',
        tags: JSON.stringify(['guide', 'tutorial', 'basics']),
        status: 'published',
        author_id: adminUser.id,
        organization_id: organization.id,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Best Practices for Project Management',
        slug: 'best-practices',
        content: `# Best Practices for Project Management

Follow these best practices to get the most out of PM Tool.

## 1. Project Organization

- Use clear, descriptive project names
- Set realistic deadlines
- Define project goals upfront

## 2. Task Management

- Break down large tasks into smaller ones
- Use priorities to focus on what's important
- Keep task descriptions clear and actionable

## 3. Team Collaboration

- Assign tasks to the right people
- Use comments for communication
- Regular status updates

## 4. Templates

- Create templates for recurring project types
- Standardize workflows
- Save time on project setup`,
        category: 'best-practices',
        tags: JSON.stringify(['tips', 'productivity', 'workflow']),
        status: 'published',
        author_id: adminUser.id,
        organization_id: organization.id,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Using Bulk Operations',
        slug: 'bulk-operations',
        content: `# Using Bulk Operations

Save time by performing actions on multiple tasks at once.

## How to Use Bulk Operations

1. Navigate to the Tasks page
2. Select multiple tasks using checkboxes
3. Choose an action from the bulk operations toolbar

## Available Actions

- **Update Status**: Change status for multiple tasks
- **Update Priority**: Set priority in bulk
- **Assign Tasks**: Assign to team members
- **Add Labels**: Apply labels to multiple tasks
- **Archive/Delete**: Clean up completed work

## Tips

- Use filters first to find the right tasks
- Preview changes before applying
- Bulk operations can be undone within 24 hours`,
        category: 'features',
        tags: JSON.stringify(['bulk', 'productivity', 'tasks']),
        status: 'published',
        author_id: adminUser.id,
        organization_id: organization.id,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString()
      }
    ];

    for (const article of articles) {
      await sql`
        INSERT INTO pmtool_kb_article (
          id, title, slug, content, category, tags, status, 
          author_id, organization_id, is_public, created_at, updated_at, published_at
        )
        VALUES (
          ${article.id}, ${article.title}, ${article.slug}, ${article.content}, 
          ${article.category}, ${article.tags}, ${article.status},
          ${article.author_id}, ${article.organization_id}, ${article.is_public},
          ${article.created_at}, ${article.updated_at}, ${article.published_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log(`✅ Created ${articles.length} knowledge base articles`);

    // 4. Create sample departments
    console.log('\n📋 Creating departments...');
    
    const departments = [
      {
        id: uuidv4(),
        name: 'Engineering',
        description: 'Software development and technical operations',
        organization_id: organization.id,
        head_id: adminUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Marketing',
        description: 'Marketing and growth initiatives',
        organization_id: organization.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Human Resources',
        description: 'People operations and culture',
        organization_id: organization.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const dept of departments) {
      await sql`
        INSERT INTO pmtool_department (
          id, name, description, organization_id, head_id, created_at, updated_at
        )
        VALUES (
          ${dept.id}, ${dept.name}, ${dept.description}, 
          ${dept.organization_id}, ${dept.head_id || null}, 
          ${dept.created_at}, ${dept.updated_at}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log(`✅ Created ${departments.length} departments`);

    console.log('\n✅ Advanced features seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding advanced features:', error);
  } finally {
    await sql.end();
  }
}

// Run the seed function
seedAdvancedFeatures();