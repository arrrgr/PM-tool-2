const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const postgres = require('postgres');

// Direct database connection
const sql = postgres('postgresql://localhost:5432/pmtool');

async function seedTestUsers() {
  try {
    console.log('🌱 Creating test users...');
    
    // First check if organization exists
    let orgResult = await sql`
      SELECT id FROM pmtool_organization WHERE slug = 'test-org'
    `;
    
    let finalOrgId;
    
    if (orgResult.length === 0) {
      // Create new organization
      const orgId = randomUUID();
      await sql`
        INSERT INTO pmtool_organization (id, name, slug, description, settings)
        VALUES (
          ${orgId},
          'Test Organization',
          'test-org',
          'Test organization for development',
          ${JSON.stringify({
            defaultTaskStatuses: ['To Do', 'In Progress', 'In Review', 'Done'],
            defaultPriorities: ['Low', 'Medium', 'High'],
            features: {
              knowledgeBase: true,
              timeTracking: true,
              reporting: true,
            },
          })}
        )
      `;
      finalOrgId = orgId;
      console.log('✅ Created organization: Test Organization');
    } else {
      finalOrgId = orgResult[0].id;
      console.log('✅ Using existing organization');
    }
    
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testUsers = [
      {
        id: randomUUID(),
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        hashed_password: hashedPassword,
        organization_id: finalOrgId,
        role: 'admin',
      },
      {
        id: randomUUID(),
        name: 'Sarah Williams',
        email: 'sarah.williams@example.com',
        hashed_password: hashedPassword,
        organization_id: finalOrgId,
        role: 'member',
      },
      {
        id: randomUUID(),
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        hashed_password: hashedPassword,
        organization_id: finalOrgId,
        role: 'member',
      },
      {
        id: randomUUID(),
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        hashed_password: hashedPassword,
        organization_id: finalOrgId,
        role: 'member',
      },
    ];
    
    for (const user of testUsers) {
      // Check if user exists
      const existing = await sql`
        SELECT id FROM pmtool_user WHERE email = ${user.email}
      `;
      
      if (existing.length > 0) {
        // Update existing user
        await sql`
          UPDATE pmtool_user 
          SET 
            hashed_password = ${user.hashed_password},
            organization_id = ${user.organization_id},
            name = ${user.name},
            role = ${user.role}
          WHERE email = ${user.email}
        `;
        console.log(`✅ Updated user: ${user.email}`);
      } else {
        // Create new user
        await sql`
          INSERT INTO pmtool_user (id, name, email, hashed_password, organization_id, role)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${user.hashed_password}, ${user.organization_id}, ${user.role})
        `;
        console.log(`✅ Created user: ${user.email}`);
      }
    }
    
    // Create some sample projects
    const projectId1 = randomUUID();
    const projectId2 = randomUUID();
    
    const projects = [
      {
        id: projectId1,
        name: 'Website Redesign',
        key: 'WEB',
        description: 'Complete redesign of company website',
        organization_id: finalOrgId,
        settings: JSON.stringify({
          taskStatuses: ['To Do', 'In Progress', 'In Review', 'Done'],
        }),
      },
      {
        id: projectId2,
        name: 'Mobile App Development',
        key: 'APP',
        description: 'Native mobile app for iOS and Android',
        organization_id: finalOrgId,
        settings: JSON.stringify({
          taskStatuses: ['To Do', 'In Progress', 'In Review', 'Done'],
        }),
      },
    ];
    
    for (const project of projects) {
      const existing = await sql`
        SELECT id FROM pmtool_project WHERE key = ${project.key} AND organization_id = ${finalOrgId}
      `;
      
      if (existing.length === 0) {
        await sql`
          INSERT INTO pmtool_project (id, name, key, description, organization_id, settings)
          VALUES (${project.id}, ${project.name}, ${project.key}, ${project.description}, ${project.organization_id}, ${project.settings})
        `;
        console.log(`✅ Created project: ${project.name}`);
      }
    }
    
    console.log('\n✅ Test data created successfully!');
    console.log('\n🔑 Test Accounts:');
    console.log('• alex.johnson@example.com / password123 (Admin)');
    console.log('• sarah.williams@example.com / password123');
    console.log('• michael.chen@example.com / password123');
    console.log('• emily.davis@example.com / password123');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    await sql.end();
    process.exit(1);
  }
}

seedTestUsers();