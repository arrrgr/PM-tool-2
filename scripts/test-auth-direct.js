const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

async function testAuth() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔍 Testing authentication for arthur@pmtool.demo...');
    
    // Get user
    const users = await sql`
      SELECT id, email, name, password, role, organization_id 
      FROM pmtool_user 
      WHERE email = 'arthur@pmtool.demo'
    `;
    
    if (users.length === 0) {
      console.error('❌ User not found');
      await sql.end();
      return;
    }
    
    const user = users[0];
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      role: user.role,
      organization_id: user.organization_id
    });
    
    // Test password
    const testPassword = 'Demo123!';
    console.log('\n🔐 Testing password verification...');
    console.log('Password to test:', testPassword);
    console.log('Stored hash:', user.password ? user.password.substring(0, 20) + '...' : 'NULL');
    
    if (!user.password) {
      console.error('❌ User has no password stored');
    } else {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('Password valid:', isValid ? '✅ YES' : '❌ NO');
      
      if (!isValid) {
        // Try to see what a correct hash would look like
        const correctHash = await bcrypt.hash(testPassword, 10);
        console.log('\nExpected hash pattern:', correctHash.substring(0, 20) + '...');
        
        // Update the password to fix it
        console.log('\n🔧 Fixing password...');
        await sql`
          UPDATE pmtool_user 
          SET password = ${correctHash}
          WHERE email = 'arthur@pmtool.demo'
        `;
        console.log('✅ Password updated');
        
        // Verify the fix
        const updatedUsers = await sql`
          SELECT password FROM pmtool_user WHERE email = 'arthur@pmtool.demo'
        `;
        const isValidNow = await bcrypt.compare(testPassword, updatedUsers[0].password);
        console.log('Password valid after fix:', isValidNow ? '✅ YES' : '❌ NO');
      }
    }
    
    // Also fix the other users
    console.log('\n🔧 Fixing passwords for all demo users...');
    const correctHash = await bcrypt.hash(testPassword, 10);
    
    await sql`
      UPDATE pmtool_user 
      SET password = ${correctHash}
      WHERE email IN ('arthur@pmtool.demo', 'vlad@pmtool.demo', 'anton@pmtool.demo')
    `;
    
    console.log('✅ All demo user passwords updated');
    
    // Verify all users
    console.log('\n📋 Final verification:');
    const allUsers = await sql`
      SELECT email, password IS NOT NULL as has_password 
      FROM pmtool_user 
      WHERE email IN ('arthur@pmtool.demo', 'vlad@pmtool.demo', 'anton@pmtool.demo')
    `;
    
    for (const u of allUsers) {
      const testResult = await sql`
        SELECT password FROM pmtool_user WHERE email = ${u.email}
      `;
      const valid = await bcrypt.compare(testPassword, testResult[0].password);
      console.log(`${u.email}: ${valid ? '✅' : '❌'}`);
    }
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

testAuth();