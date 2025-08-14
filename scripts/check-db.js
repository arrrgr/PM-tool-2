const postgres = require('postgres');
const sql = postgres('postgresql://localhost:5432/pmtool');

async function checkDatabase() {
  console.log('🔍 Checking database structure...\n');
  
  try {
    // Check columns in pmtool_user table
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pmtool_user' 
      ORDER BY ordinal_position
    `;
    
    console.log('Columns in pmtool_user table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check for password columns
    const passwordColumn = columns.find(col => 
      col.column_name.includes('password') || 
      col.column_name.includes('hashed')
    );
    
    if (passwordColumn) {
      console.log(`\n✅ Found password column: ${passwordColumn.column_name}`);
    } else {
      console.log('\n❌ No password column found\!');
    }
    
    // Check for existing users
    const userCount = await sql`SELECT COUNT(*) FROM pmtool_user`;
    console.log(`\nTotal users in database: ${userCount[0].count}`);
    
    // Check admin user
    const adminUser = await sql`
      SELECT id, email, name, organization_id, role 
      FROM pmtool_user 
      WHERE email = 'admin@test.com'
    `;
    
    if (adminUser.length > 0) {
      console.log('\n✅ Admin user exists:');
      console.log('  Email:', adminUser[0].email);
      console.log('  Name:', adminUser[0].name);
      console.log('  Role:', adminUser[0].role);
      console.log('  Org ID:', adminUser[0].organization_id);
    } else {
      console.log('\n❌ Admin user not found');
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

checkDatabase();
EOF < /dev/null