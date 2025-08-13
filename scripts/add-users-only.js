const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

function nanoid() {
  return crypto.randomUUID();
}

async function addUsers() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔍 Finding PM Tool Org...');
    
    const org = await sql`
      SELECT id FROM pmtool_organization WHERE slug = 'pm-tool-org' LIMIT 1
    `;
    
    if (org.length === 0) {
      console.error('❌ PM Tool Org not found');
      await sql.end();
      process.exit(1);
    }
    
    const orgId = org[0].id;
    console.log('✅ Found organization:', orgId);
    
    // Check if users already exist
    const existingUsers = await sql`
      SELECT email FROM pmtool_user WHERE email IN ('arthur@pmtool.demo', 'vlad@pmtool.demo', 'anton@pmtool.demo')
    `;
    
    if (existingUsers.length > 0) {
      console.log('⚠️ Demo users already exist, deleting them first...');
      await sql`
        DELETE FROM pmtool_user WHERE email IN ('arthur@pmtool.demo', 'vlad@pmtool.demo', 'anton@pmtool.demo')
      `;
    }
    
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('Demo123!', 10);
    
    const adminId = nanoid();
    const vladId = nanoid();
    const antonId = nanoid();

    await sql`
      INSERT INTO pmtool_user (id, email, name, password, role, organization_id)
      VALUES 
        (${adminId}, 'arthur@pmtool.demo', 'Arthur', ${hashedPassword}, 'admin', ${orgId}),
        (${vladId}, 'vlad@pmtool.demo', 'Vlad', ${hashedPassword}, 'member', ${orgId}),
        (${antonId}, 'anton@pmtool.demo', 'Anton', ${hashedPassword}, 'member', ${orgId})
    `;
    
    console.log('✅ Users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin: arthur@pmtool.demo / Demo123!');
    console.log('  User: vlad@pmtool.demo / Demo123!');
    console.log('  User: anton@pmtool.demo / Demo123!');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

addUsers();