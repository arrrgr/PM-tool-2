const postgres = require('postgres');

const DATABASE_URL = 'postgresql://postgres:HkJWsFTkIAbFvAmterwRRfhJZyhmAUwq@switchyard.proxy.rlwy.net:23135/railway';

async function checkColumns() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔍 Checking all columns in pmtool_user table...');
    
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pmtool_user'
      ORDER BY ordinal_position
    `;
    
    console.log('All columns in pmtool_user:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

checkColumns();