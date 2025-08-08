import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';
import { organizations, users, projects, tasks } from '@/server/db/schema';

async function main() {
  console.log('🌱 Seeding database...');

  // Create organizations
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

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminUser1 = {
    id: randomUUID(),
    name: 'Alex Johnson',
    email: 'alex@roonix.com',
    hashedPassword,
    organizationId: roonixOrg.id,
    role: 'admin',
  };

  const adminUser2 = {
    id: randomUUID(),
    name: 'Sarah Chen',
    email: 'sarah@synthesis25.com',
    hashedPassword,
    organizationId: synthesisOrg.id,
    role: 'admin',
  };

  const devUser1 = {
    id: randomUUID(),
    name: 'Mike Developer',
    email: 'mike@roonix.com',
    hashedPassword,
    organizationId: roonixOrg.id,
    role: 'member',
  };

  const devUser2 = {
    id: randomUUID(),
    name: 'Emma Wilson',
    email: 'emma@synthesis25.com',
    hashedPassword,
    organizationId: synthesisOrg.id,
    role: 'member',
  };

  await db.insert(users).values([adminUser1, adminUser2, devUser1, devUser2]);

  // Create projects for Roonix BNPL
  const roonixMobileApp = {
    id: randomUUID(),
    name: 'Mobile App v2.0',
    key: 'MOBIL',
    description: 'Next generation mobile app with enhanced UX and new payment features',
    organizationId: roonixOrg.id,
    leaderId: adminUser1.id,
    status: 'active',
    priority: 'high',
  };

  const roonixPaymentEngine = {
    id: randomUUID(),
    name: 'Payment Processing Engine',
    key: 'PAYME',
    description: 'Core payment processing system with multi-currency support',
    organizationId: roonixOrg.id,
    leaderId: devUser1.id,
    status: 'active',
    priority: 'high',
  };

  // Create projects for Synthesis25
  const aiResearch = {
    id: randomUUID(),
    name: 'AI Research Platform',
    key: 'AIRED',
    description: 'Advanced AI research and experimentation platform',
    organizationId: synthesisOrg.id,
    leaderId: adminUser2.id,
    status: 'active',
    priority: 'medium',
  };

  const dataAnalytics = {
    id: randomUUID(),
    name: 'Data Analytics Suite',
    key: 'DATAS',
    description: 'Comprehensive data analytics and visualization tools',
    organizationId: synthesisOrg.id,
    leaderId: devUser2.id,
    status: 'active',
    priority: 'medium',
  };

  await db.insert(projects).values([roonixMobileApp, roonixPaymentEngine, aiResearch, dataAnalytics]);

  // Create sample tasks
  const sampleTasks = [
    // Mobile App tasks
    {
      id: randomUUID(),
      key: 'MOBIL-1',
      title: 'Design new onboarding flow',
      description: 'Create wireframes and mockups for the improved user onboarding experience',
      projectId: roonixMobileApp.id,
      assigneeId: devUser1.id,
      reporterId: adminUser1.id,
      status: 'In Progress',
      priority: 'high',
      type: 'task',
      storyPoints: 5,
    },
    {
      id: randomUUID(),
      key: 'MOBIL-2',
      title: 'Implement biometric authentication',
      description: 'Add fingerprint and face ID authentication options',
      projectId: roonixMobileApp.id,
      assigneeId: devUser1.id,
      reporterId: adminUser1.id,
      status: 'To Do',
      priority: 'medium',
      type: 'feature',
      storyPoints: 8,
    },
    {
      id: randomUUID(),
      key: 'MOBIL-3',
      title: 'Update payment confirmation screen',
      description: 'Improve the payment confirmation UI with better feedback',
      projectId: roonixMobileApp.id,
      assigneeId: devUser1.id,
      reporterId: adminUser1.id,
      status: 'Done',
      priority: 'low',
      type: 'task',
      storyPoints: 3,
    },
    // Payment Engine tasks
    {
      id: randomUUID(),
      key: 'PAYME-1',
      title: 'Add multi-currency support',
      description: 'Implement support for USD, EUR, GBP, and local currencies',
      projectId: roonixPaymentEngine.id,
      assigneeId: devUser1.id,
      reporterId: adminUser1.id,
      status: 'In Progress',
      priority: 'high',
      type: 'feature',
      storyPoints: 13,
    },
    {
      id: randomUUID(),
      key: 'PAYME-2',
      title: 'Optimize payment processing speed',
      description: 'Reduce payment processing time from 3s to under 1s',
      projectId: roonixPaymentEngine.id,
      assigneeId: devUser1.id,
      reporterId: adminUser1.id,
      status: 'To Do',
      priority: 'medium',
      type: 'improvement',
      storyPoints: 8,
    },
    // AI Research tasks
    {
      id: randomUUID(),
      key: 'AIRED-1',
      title: 'Set up ML training pipeline',
      description: 'Configure automated ML model training and evaluation pipeline',
      projectId: aiResearch.id,
      assigneeId: devUser2.id,
      reporterId: adminUser2.id,
      status: 'In Progress',
      priority: 'high',
      type: 'task',
      storyPoints: 8,
    },
    {
      id: randomUUID(),
      key: 'AIRED-2',
      title: 'Implement data preprocessing module',
      description: 'Create data cleaning and preprocessing utilities for research datasets',
      projectId: aiResearch.id,
      assigneeId: devUser2.id,
      reporterId: adminUser2.id,
      status: 'To Do',
      priority: 'medium',
      type: 'feature',
      storyPoints: 5,
    },
    // Data Analytics tasks
    {
      id: randomUUID(),
      key: 'DATAS-1',
      title: 'Build real-time dashboard',
      description: 'Create interactive dashboard for real-time data visualization',
      projectId: dataAnalytics.id,
      assigneeId: devUser2.id,
      reporterId: adminUser2.id,
      status: 'To Do',
      priority: 'high',
      type: 'feature',
      storyPoints: 13,
    },
    {
      id: randomUUID(),
      key: 'DATAS-2',
      title: 'Add export functionality',
      description: 'Allow users to export charts and reports as PDF/PNG',
      projectId: dataAnalytics.id,
      assigneeId: devUser2.id,
      reporterId: adminUser2.id,
      status: 'To Do',
      priority: 'low',
      type: 'feature',
      storyPoints: 5,
    },
  ];

  await db.insert(tasks).values(sampleTasks);

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('• 2 Organizations: Roonix BNPL, Synthesis25');
  console.log('• 4 Users with password: "password123"');
  console.log('• 4 Projects with various priorities');
  console.log('• 9 Sample tasks across all projects');
  console.log('\n👤 Test Accounts:');
  console.log('• alex@roonix.com (Admin)');
  console.log('• sarah@synthesis25.com (Admin)');
  console.log('• mike@roonix.com (Member)');
  console.log('• emma@synthesis25.com (Member)');
}

main()
  .then(() => {
    console.log('🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });