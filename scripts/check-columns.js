const postgres = require('postgres');
const sql = postgres('postgresql://localhost:5432/pmtool');

async function checkColumns() {
  try {
    const columns = await sql\`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pmtool_user'
      ORDER BY ordinal_position
    \`;
    
    console.log('Columns in pmtool_user table:');
    columns.forEach(col => {
      console.log('  -', col.column_name);
    });
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

checkColumns();
SCRIPT_END < /dev/null