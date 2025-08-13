const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

async function testSimpleAuth() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔍 Testing simple authentication...\n');
    
    const email = 'arthur@pmtool.demo';
    const password = 'Demo123!';
    
    // Query exactly as Drizzle would
    const result = await sql`
      SELECT * FROM pmtool_user WHERE email = ${email}
    `;
    
    if (result.length === 0) {
      console.log('❌ User not found');
      await sql.end();
      return;
    }
    
    const user = result[0];
    
    console.log('User object keys:', Object.keys(user));
    console.log('\nChecking password fields:');
    console.log('  user.password:', user.password ? `exists (${user.password.length} chars)` : 'undefined');
    console.log('  user.hashedPassword:', user.hashedPassword ? `exists (${user.hashedPassword.length} chars)` : 'undefined');
    console.log('  user.hashed_password:', user.hashed_password ? `exists (${user.hashed_password.length} chars)` : 'undefined');
    
    // Try to authenticate
    const passwordField = user.password || user.hashedPassword || user.hashed_password;
    
    if (!passwordField) {
      console.log('\n❌ No password field found');
    } else {
      const isValid = await bcrypt.compare(password, passwordField);
      console.log(`\n✅ Password field used: ${user.password ? 'password' : user.hashedPassword ? 'hashedPassword' : 'hashed_password'}`);
      console.log(`Authentication result: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

testSimpleAuth();