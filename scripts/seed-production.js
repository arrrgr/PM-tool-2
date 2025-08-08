const { runMigrations } = require('./migrate');

async function setupProduction() {
  try {
    console.log('🏗️ Setting up production database...');
    
    // Run migrations first
    await runMigrations();
    
    console.log('🌱 Production setup completed!');
    console.log('');
    console.log('🔑 Next steps:');
    console.log('1. Go to your deployed app URL');
    console.log('2. Click "Sign Up" to create the first admin account');
    console.log('3. Create your organization and start using the PM Tool!');
    
  } catch (error) {
    console.error('❌ Production setup failed:', error);
    process.exit(1);
  }
}

setupProduction();