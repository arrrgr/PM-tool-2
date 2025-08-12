const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const sql = postgres('postgresql://localhost:5432/pmtool');

async function createTestUser() {
  try {
    // Get an organization
    const orgs = await sql`SELECT id FROM pmtool_organization LIMIT 1`;
    
    if (orgs.length === 0) {
      console.log('Creating organization first...');
      const orgId = randomUUID();
      await sql`
        INSERT INTO pmtool_organization (id, name, slug)
        VALUES (${orgId}, 'Test Org', ${`test-org-${Date.now()}`})
      `;
      orgId = orgId;
    }
    
    const orgId = orgs[0]?.id || randomUUID();
    
    // Create a simple test user
    const email = 'test@test.com';
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    
    // Delete if exists
    await sql`DELETE FROM pmtool_user WHERE email = ${email}`;
    
    // Create new user
    await sql`
      INSERT INTO pmtool_user (id, email, name, hashed_password, organization_id, role)
      VALUES (${userId}, ${email}, 'Test User', ${hashedPassword}, ${orgId}, 'admin')
    `;
    
    // Verify it worked
    const check = await sql`
      SELECT email, hashed_password FROM pmtool_user WHERE email = ${email}
    `;
    
    if (check.length > 0) {
      const verified = await bcrypt.compare(password, check[0].hashed_password);
      console.log('\n✅ USER CREATED SUCCESSFULLY!\n');
      console.log('=====================================');
      console.log('Email: test@test.com');
      console.log('Password: test123');
      console.log('=====================================');
      console.log('Verification:', verified ? '✅ WORKING' : '❌ FAILED');
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error.message);
    await sql.end();
  }
}

createTestUser();