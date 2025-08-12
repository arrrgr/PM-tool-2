const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const sql = postgres('postgresql://localhost:5432/pmtool');

async function fixAuth() {
  try {
    // Get or create organization
    let org = await sql`SELECT id FROM pmtool_organization LIMIT 1`;
    let orgId;
    
    if (org.length === 0) {
      orgId = randomUUID();
      await sql`
        INSERT INTO pmtool_organization (id, name, slug)
        VALUES (${orgId}, 'Test Org', 'test-org')
      `;
      console.log('Created organization');
    } else {
      orgId = org[0].id;
    }
    
    // Create ONE user with a KNOWN working password
    const email = 'admin@test.com';
    const password = 'admin123';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Creating user:', email);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Verify the hash works
    const verifyHash = await bcrypt.compare(password, hash);
    console.log('Hash verification:', verifyHash ? '✅' : '❌');
    
    // Delete existing user if exists
    await sql`DELETE FROM pmtool_user WHERE email = ${email}`;
    
    // Create fresh user
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
        ${email},
        'Admin User',
        ${hash},
        ${orgId},
        'admin'
      )
    `;
    
    // Verify it was created
    const check = await sql`
      SELECT id, email, hashed_password 
      FROM pmtool_user 
      WHERE email = ${email}
    `;
    
    if (check.length > 0) {
      const finalVerify = await bcrypt.compare(password, check[0].hashed_password);
      console.log('\n✅ USER CREATED SUCCESSFULLY');
      console.log('================================');
      console.log('Email: admin@test.com');
      console.log('Password: admin123');
      console.log('================================');
      console.log('Final verification:', finalVerify ? '✅ WORKING' : '❌ FAILED');
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

fixAuth();