const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

function nanoid() {
  return crypto.randomUUID();
}

async function resetProduction() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🧹 Cleaning all data...');
    
    // Clean in order to avoid foreign key constraints
    try { await sql`DELETE FROM pmtool_time_entry`; } catch(e) {}
    try { await sql`DELETE FROM pmtool_comment`; } catch(e) {}
    try { await sql`DELETE FROM pmtool_task`; } catch(e) {}
    try { await sql`DELETE FROM pmtool_project`; } catch(e) {}
    try { await sql`DELETE FROM pmtool_activity_log`; } catch(e) {}
    try { await sql`DELETE FROM pmtool_user`; } catch(e) {}
    try { await sql`DELETE FROM pmtool_organization`; } catch(e) {}
    
    console.log('✅ All data cleaned');
    
    console.log('📦 Creating PM Tool Org...');
    const orgId = nanoid();
    await sql`
      INSERT INTO pmtool_organization (id, name, slug, description, settings, subscription_tier)
      VALUES (
        ${orgId},
        'PM Tool Org',
        'pm-tool-org',
        'Demo organization for PM Tool',
        ${JSON.stringify({ features: { knowledgeBase: true, timeTracking: true, reporting: true } })},
        'enterprise'
      )
    `;
    
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('Demo123!', 10);
    
    await sql`
      INSERT INTO pmtool_user (id, email, name, password, role, organization_id)
      VALUES 
        (${nanoid()}, 'arthur@pmtool.demo', 'Arthur', ${hashedPassword}, 'admin', ${orgId}),
        (${nanoid()}, 'vlad@pmtool.demo', 'Vlad', ${hashedPassword}, 'member', ${orgId}),
        (${nanoid()}, 'anton@pmtool.demo', 'Anton', ${hashedPassword}, 'member', ${orgId})
    `;
    
    console.log('✅ Production database reset successfully!');
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

resetProduction();