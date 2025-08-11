const { runMigrations } = require('./migrate');
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');

async function setupProduction() {
  try {
    console.log('🏗️ Setting up production database...');
    
    // Run migrations first
    await runMigrations();
    
    // Import database after migrations are complete
    const { db } = require('../src/server/db');
    const { organizations, users } = require('../src/server/db/schema');
    
    console.log('🌱 Seeding test users...');
    
    // Create test organizations
    const roonixOrg = {
      id: randomUUID(),
      name: 'Roonix BNPL',
      slug: 'roonix-bnpl',
      description: 'Buy Now Pay Later platform for emerging markets',
      settings: {
        defaultTaskStatuses: ['To Do', 'In Progress', 'In Review', 'Done'],
        defaultPriorities: ['Low', 'Medium', 'High'],
        features: {
          knowledgeBase: true,
          timeTracking: true,
          reporting: true,
        },
      },
    };

    const synthesisOrg = {
      id: randomUUID(),
      name: 'Synthesis25',
      slug: 'synthesis25',
      description: 'AI-powered research and development company',
      settings: {
        defaultTaskStatuses: ['To Do', 'In Progress', 'In Review', 'Done'],
        defaultPriorities: ['Low', 'Medium', 'High'],
        features: {
          knowledgeBase: true,
          timeTracking: true,
          reporting: true,
        },
      },
    };

    await db.insert(organizations).values([roonixOrg, synthesisOrg]);

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const testUsers = [
      {
        id: randomUUID(),
        name: 'Alex Johnson',
        email: 'alex@roonix.com',
        hashedPassword,
        organizationId: roonixOrg.id,
        role: 'admin',
      },
      {
        id: randomUUID(),
        name: 'Sarah Chen',
        email: 'sarah@synthesis25.com',
        hashedPassword,
        organizationId: synthesisOrg.id,
        role: 'admin',
      },
      {
        id: randomUUID(),
        name: 'Mike Developer',
        email: 'mike@roonix.com',
        hashedPassword,
        organizationId: roonixOrg.id,
        role: 'member',
      },
      {
        id: randomUUID(),
        name: 'Emma Wilson',
        email: 'emma@synthesis25.com',
        hashedPassword,
        organizationId: synthesisOrg.id,
        role: 'member',
      },
    ];

    await db.insert(users).values(testUsers);
    
    console.log('✅ Production setup completed!');
    console.log('');
    console.log('🔑 Test Accounts Available:');
    console.log('• alex@roonix.com / password123 (Admin)');
    console.log('• sarah@synthesis25.com / password123 (Admin)');
    console.log('• mike@roonix.com / password123 (Member)');
    console.log('• emma@synthesis25.com / password123 (Member)');
    
  } catch (error) {
    console.error('❌ Production setup failed:', error);
    process.exit(1);
  }
}

setupProduction();