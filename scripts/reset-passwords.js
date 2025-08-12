const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const sql = postgres('postgresql://localhost:5432/pmtool');

async function resetPasswords() {
  try {
    // Create a fresh password hash
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('🔐 Resetting all user passwords...');
    console.log('Password to hash:', password);
    console.log('Generated hash:', hashedPassword);
    
    // Update ALL users with the new password
    const result = await sql`
      UPDATE pmtool_user 
      SET hashed_password = ${hashedPassword}
      RETURNING email, name
    `;
    
    console.log('\n✅ Password reset for users:');
    result.forEach(user => {
      console.log(`• ${user.email}`);
    });
    
    // Test the hash
    const testMatch = await bcrypt.compare('password123', hashedPassword);
    console.log('\n🧪 Hash verification test:', testMatch ? '✅ PASS' : '❌ FAIL');
    
    // Get one user to verify the update
    const checkUser = await sql`
      SELECT email, hashed_password 
      FROM pmtool_user 
      LIMIT 1
    `;
    
    if (checkUser.length > 0) {
      const verifyPassword = await bcrypt.compare('password123', checkUser[0].hashed_password);
      console.log(`🔍 Verify ${checkUser[0].email}:`, verifyPassword ? '✅ PASS' : '❌ FAIL');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('ALL USERS NOW USE PASSWORD: password123');
    console.log('='.repeat(50));
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
  }
}

resetPasswords();