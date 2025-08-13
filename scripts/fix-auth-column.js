const postgres = require('postgres');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

async function fixAuthColumn() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔍 Checking user table columns...');
    
    // Check if the column exists
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pmtool_user' 
      AND column_name IN ('hashed_password', 'password', 'hashedPassword')
    `;
    
    console.log('Columns found:', columns);
    
    // Check if we have the hashed_password column
    const hasHashedPassword = columns.some(col => col.column_name === 'hashed_password');
    const hasPassword = columns.some(col => col.column_name === 'password');
    
    if (hasHashedPassword && !hasPassword) {
      console.log('✅ Column "hashed_password" exists');
      
      // Check if any user has a password set
      const users = await sql`
        SELECT id, email, name, hashed_password IS NOT NULL as has_password 
        FROM pmtool_user 
        WHERE email IN ('arthur@pmtool.demo', 'vlad@pmtool.demo', 'anton@pmtool.demo')
      `;
      
      console.log('Demo users:', users);
      
      // Update the column if needed
      if (!hasPassword) {
        console.log('📝 Renaming column from hashed_password to password...');
        await sql`ALTER TABLE pmtool_user RENAME COLUMN hashed_password TO password`;
        console.log('✅ Column renamed successfully');
      }
    } else if (hasPassword) {
      console.log('✅ Column "password" already exists');
      
      // Check users
      const users = await sql`
        SELECT id, email, name, password IS NOT NULL as has_password 
        FROM pmtool_user 
        WHERE email IN ('arthur@pmtool.demo', 'vlad@pmtool.demo', 'anton@pmtool.demo')
      `;
      
      console.log('Demo users:', users);
    }
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

fixAuthColumn();