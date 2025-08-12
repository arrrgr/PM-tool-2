const bcrypt = require('bcryptjs');
const postgres = require('postgres');

const sql = postgres('postgresql://localhost:5432/pmtool');

async function testAuth() {
  try {
    const email = 'test@test.com';
    const password = 'test123';
    
    console.log('🔍 Testing authentication for:', email);
    console.log('Password to test:', password);
    
    // Get user from database
    const users = await sql`
      SELECT id, email, name, hashed_password, organization_id, role
      FROM pmtool_user 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      
      // Show all emails in database
      const allUsers = await sql`SELECT email FROM pmtool_user`;
      console.log('\nAvailable users:');
      allUsers.forEach(u => console.log(`  • ${u.email}`));
      
      await sql.end();
      return;
    }
    
    const user = users[0];
    console.log('\n✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Has password hash:', !!user.hashed_password);
    console.log('  Hash starts with:', user.hashed_password?.substring(0, 10));
    
    // Test password
    if (!user.hashed_password) {
      console.log('\n❌ User has no password hash!');
    } else {
      console.log('\n🔐 Testing password match...');
      const match = await bcrypt.compare(password, user.hashed_password);
      console.log('Password match:', match ? '✅ SUCCESS' : '❌ FAILED');
      
      // Try with different bcrypt variations
      console.log('\n🧪 Additional tests:');
      const testPassword123 = await bcrypt.compare('password123', user.hashed_password);
      console.log('  password123:', testPassword123 ? '✅' : '❌');
      
      const testTest123 = await bcrypt.compare('test123', user.hashed_password);
      console.log('  test123:', testTest123 ? '✅' : '❌');
      
      // Show what the correct password should be
      if (!match && !testPassword123 && !testTest123) {
        console.log('\n⚠️  Password does not match any common test passwords');
        console.log('Creating new hash for test123...');
        
        const newHash = await bcrypt.hash('test123', 10);
        await sql`
          UPDATE pmtool_user 
          SET hashed_password = ${newHash}
          WHERE email = ${email}
        `;
        
        console.log('✅ Password reset to: test123');
      }
    }
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
  }
}

testAuth();