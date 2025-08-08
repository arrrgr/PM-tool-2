const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Generate migrations
    console.log('📝 Generating migration files...');
    await execAsync('pnpm drizzle-kit generate');
    
    // Run migrations
    console.log('🚀 Applying migrations...');
    await execAsync('pnpm drizzle-kit migrate');
    
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };