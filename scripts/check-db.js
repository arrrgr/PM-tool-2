const postgres = require('postgres');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

async function checkDB() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔍 Checking organizations...');
    const orgs = await sql`SELECT id, name, slug FROM pmtool_organization`;
    console.log('Organizations:', orgs);
    
    console.log('\n🔍 Checking users...');
    const users = await sql`SELECT id, email, name, organization_id, password IS NOT NULL as has_password FROM pmtool_user`;
    console.log('Users:', users);
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

checkDB();