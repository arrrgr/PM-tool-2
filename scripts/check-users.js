const postgres = require('postgres');
const sql = postgres('postgresql://localhost:5432/pmtool');

async function checkUsers() {
  try {
    const users = await sql`
      SELECT email, name, organization_id 
      FROM pmtool_user 
      ORDER BY email
    `;
    
    console.log('\n📧 Existing Users in Database:\n');
    console.log('================================');
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      users.forEach(user => {
        console.log(`• ${user.email}`);
        if (user.name) console.log(`  Name: ${user.name}`);
        console.log('');
      });
    }
    
    console.log('================================');
    console.log(`Total users: ${users.length}`);
    console.log('\nNOTE: All test users use password: password123');
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error.message);
    await sql.end();
  }
}

checkUsers();