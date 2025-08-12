const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/pmtool';
  const sql = postgres(connectionString);

  try {
    console.log('🚀 Running advanced features migration...');
    
    // Read the SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrate-advanced-features.sql'),
      'utf8'
    );

    // Split by semicolons but be careful with functions/triggers
    const statements = migrationSQL
      .split(/;(?=\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT|DO\s+\$\$))/i)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        // Add semicolon back if it's not a DO block
        const finalStatement = statement.includes('DO $$') 
          ? statement + ';' 
          : statement.endsWith(';') 
          ? statement 
          : statement + ';';
          
        await sql.unsafe(finalStatement);
        successCount++;
        console.log('✅ Executed statement', successCount);
      } catch (error) {
        errorCount++;
        console.error('❌ Error executing statement:', error.message);
        // Continue with other statements
      }
    }

    console.log(`\n📊 Migration Results:`);
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ❌ Failed statements: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Tables may already exist.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();