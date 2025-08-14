const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const sql = postgres('postgresql://localhost:5432/pmtool');

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');
  
  try {
    // 1. Create organization if not exists
    let org = await sql`SELECT id FROM pmtool_organization LIMIT 1`;
    let orgId;
    
    if (org.length === 0) {
      orgId = randomUUID();
      await sql`
        INSERT INTO pmtool_organization (id, name, slug)
        VALUES (${orgId}, 'Test Organization', 'test-org')
      `;
      console.log('✅ Created organization');
    } else {
      orgId = org[0].id;
      console.log('✅ Using existing organization:', orgId);
    }
    
    // 2. Create project if not exists
    let project = await sql`SELECT id FROM pmtool_project WHERE organization_id = ${orgId} LIMIT 1`;
    let projectId;
    
    if (project.length === 0) {
      projectId = randomUUID();
      const leadId = randomUUID(); // Will be updated after creating user
      await sql`
        INSERT INTO pmtool_project (id, name, key, organization_id, leader_id, status)
        VALUES (${projectId}, 'Test Project', 'TEST', ${orgId}, ${leadId}, 'active')
      `;
      console.log('✅ Created project');
    } else {
      projectId = project[0].id;
      console.log('✅ Using existing project:', projectId);
    }
    
    // 3. Create admin user
    const adminEmail = 'admin@test.com';
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 10);
    
    // Check if user exists
    const existingAdmin = await sql`SELECT id FROM pmtool_user WHERE email = ${adminEmail}`;
    
    let adminId;
    if (existingAdmin.length === 0) {
      adminId = randomUUID();
      await sql`
        INSERT INTO pmtool_user (
          id, 
          email, 
          name, 
          hashed_password,
          organization_id, 
          role
        ) VALUES (
          ${adminId},
          ${adminEmail},
          'Admin User',
          ${adminHash},
          ${orgId},
          'admin'
        )
      `;
      console.log('✅ Created admin user');
    } else {
      adminId = existingAdmin[0].id;
      // Update password
      await sql`
        UPDATE pmtool_user 
        SET hashed_password = ${adminHash}
        WHERE id = ${adminId}
      `;
      console.log('✅ Updated admin user password');
    }
    
    // Update project lead if needed
    await sql`
      UPDATE pmtool_project 
      SET leader_id = ${adminId}
      WHERE id = ${projectId} AND leader_id NOT IN (SELECT id FROM pmtool_user)
    `;
    
    // 4. Create regular user
    const userEmail = 'user@test.com';
    const userPassword = 'user123';
    const userHash = await bcrypt.hash(userPassword, 10);
    
    const existingUser = await sql`SELECT id FROM pmtool_user WHERE email = ${userEmail}`;
    
    if (existingUser.length === 0) {
      const userId = randomUUID();
      await sql`
        INSERT INTO pmtool_user (
          id, 
          email, 
          name, 
          hashed_password,
          organization_id, 
          role
        ) VALUES (
          ${userId},
          ${userEmail},
          'Test User',
          ${userHash},
          ${orgId},
          'member'
        )
      `;
      console.log('✅ Created regular user');
    } else {
      await sql`
        UPDATE pmtool_user 
        SET hashed_password = ${userHash}
        WHERE email = ${userEmail}
      `;
      console.log('✅ Updated regular user password');
    }
    
    // 5. Verify users
    const users = await sql`
      SELECT email, name, role, organization_id 
      FROM pmtool_user 
      WHERE email IN ('admin@test.com', 'user@test.com')
    `;
    
    console.log('\n📋 Test Users Created:');
    console.log('==================================');
    users.forEach(user => {
      console.log(`\n${user.role === 'admin' ? '👑' : '👤'} ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.email === 'admin@test.com' ? 'admin123' : 'user123'}`);
      console.log(`   Role: ${user.role}`);
    });
    console.log('==================================');
    
    console.log('\n✅ All test data created successfully!');
    console.log('\n🔐 You can now login with:');
    console.log('   admin@test.com / admin123 (Admin)');
    console.log('   user@test.com / user123 (Member)');
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
  }
}

createTestUsers();