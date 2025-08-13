// Debug script to understand the auth issue
const postgres = require('postgres');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

async function debugAuth() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔍 Checking database schema...\n');
    
    // Check column names
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'pmtool_user'
      ORDER BY ordinal_position
    `;
    
    console.log('User table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check if we have the right indexes
    console.log('\n🔍 Checking indexes...');
    const indexes = await sql`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'pmtool_user'
    `;
    
    console.log('Indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    
    // Check actual user data
    console.log('\n🔍 Checking user data...');
    const users = await sql`
      SELECT 
        id,
        email, 
        name,
        password,
        LENGTH(password) as pwd_length,
        SUBSTRING(password, 1, 10) as pwd_prefix,
        role,
        organization_id,
        is_active,
        created_at
      FROM pmtool_user 
      WHERE email LIKE '%pmtool.demo'
      ORDER BY email
    `;
    
    console.log('\nDemo users:');
    users.forEach(user => {
      console.log(`\n${user.email}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.is_active}`);
      console.log(`  Has Password: ${user.password ? 'YES' : 'NO'}`);
      console.log(`  Password Length: ${user.pwd_length || 0}`);
      console.log(`  Password Prefix: ${user.pwd_prefix || 'NULL'}`);
      console.log(`  Org ID: ${user.organization_id}`);
      console.log(`  Created: ${user.created_at}`);
    });
    
    // Check sessions table
    console.log('\n🔍 Checking sessions table...');
    const sessionColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'pmtool_session'
      ORDER BY ordinal_position
    `;
    
    if (sessionColumns.length > 0) {
      console.log('Session table columns:');
      sessionColumns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('⚠️ Session table not found or empty');
    }
    
    // Check for any existing sessions
    const sessions = await sql`
      SELECT COUNT(*) as count FROM pmtool_session
    `;
    console.log(`\nActive sessions: ${sessions[0].count}`);
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

debugAuth();