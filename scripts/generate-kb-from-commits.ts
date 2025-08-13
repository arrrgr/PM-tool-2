import { db } from '@/server/db';
import { kbArticles, kbCategories, organizations, users } from '@/server/db/schema';
import { exec } from 'child_process';
import { promisify } from 'util';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

const execPromise = promisify(exec);

interface Commit {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
}

async function getCommitHistory(): Promise<Commit[]> {
  const { stdout } = await execPromise('git log --format="%H|%an|%ae|%ad|%s|%b" --date=short -50');
  const lines = stdout.trim().split('\n').filter(Boolean);
  
  return lines.map(line => {
    const [hash, author, email, date, message, body = ''] = line.split('|');
    return { hash, author, email, date, message: message + (body ? '\n' + body : '') };
  });
}

async function getCommitDetails(hash: string): Promise<string> {
  try {
    const { stdout } = await execPromise(`git show --stat --format="Changes in this commit:" ${hash}`);
    return stdout;
  } catch {
    return '';
  }
}

function generateArticleContent(commit: Commit, details: string): string {
  const sections = [];
  
  // Overview section
  sections.push(`## Overview\n\n${commit.message.replace(/^[^:]+:\s*/, '')}`);
  
  // Implementation details
  if (details) {
    sections.push(`## Implementation Details\n\n\`\`\`\n${details}\n\`\`\``);
  }
  
  // Author and date information
  sections.push(`## Metadata\n\n- **Author**: ${commit.author}\n- **Date**: ${commit.date}\n- **Commit**: \`${commit.hash.substring(0, 7)}\``);
  
  // Add relevant tags based on commit message
  const tags = [];
  if (commit.message.includes('fix') || commit.message.includes('Fix')) tags.push('bug-fix');
  if (commit.message.includes('feat') || commit.message.includes('feature')) tags.push('feature');
  if (commit.message.includes('auth') || commit.message.includes('Auth')) tags.push('authentication');
  if (commit.message.includes('deploy') || commit.message.includes('Railway')) tags.push('deployment');
  if (commit.message.includes('user') || commit.message.includes('User')) tags.push('user-management');
  if (commit.message.includes('permission') || commit.message.includes('role')) tags.push('permissions');
  if (commit.message.includes('task') || commit.message.includes('Task')) tags.push('task-management');
  if (commit.message.includes('kanban') || commit.message.includes('Kanban')) tags.push('kanban');
  
  if (tags.length > 0) {
    sections.push(`## Tags\n\n${tags.map(tag => `\`${tag}\``).join(', ')}`);
  }
  
  return sections.join('\n\n');
}

async function main() {
  console.log('Getting organization and user...');
  
  // Get the first organization (PM Tool Org)
  const [organization] = await db.select().from(organizations).limit(1);
  if (!organization) {
    console.error('No organization found. Please create an organization first.');
    return;
  }
  
  // Get the admin user (Arthur)
  const [adminUser] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
  if (!adminUser) {
    console.error('No admin user found. Please create an admin user first.');
    return;
  }
  
  console.log(`Using organization: ${organization.name}, user: ${adminUser.name}`);
  
  // First, create KB categories if they don't exist
  const categories = [
    { id: nanoid(), name: 'Documentation', slug: 'documentation', organizationId: organization.id },
    { id: nanoid(), name: 'Features', slug: 'features', organizationId: organization.id },
    { id: nanoid(), name: 'Bug Fixes', slug: 'bug-fixes', organizationId: organization.id },
    { id: nanoid(), name: 'Deployment', slug: 'deployment', organizationId: organization.id },
  ];
  
  // Check if categories exist
  const existingCategories = await db.select().from(kbCategories).where(eq(kbCategories.organizationId, organization.id));
  
  if (existingCategories.length === 0) {
    console.log('Creating KB categories...');
    await db.insert(kbCategories).values(categories);
  } else {
    console.log('Using existing categories');
    categories.splice(0, categories.length, ...existingCategories);
  }
  
  console.log('Fetching commit history...');
  const commits = await getCommitHistory();
  
  console.log(`Found ${commits.length} commits. Creating knowledge base articles...`);
  
  const articles = [];
  
  // Create a release notes article
  const releaseNotesContent = commits.slice(0, 20).map(commit => {
    const date = new Date(commit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `### ${date} - ${commit.message.replace(/^[^:]+:\s*/, '')}\n\nCommit: \`${commit.hash.substring(0, 7)}\` by ${commit.author}`;
  }).join('\n\n---\n\n');
  
  const docCategory = categories.find(c => c.slug === 'documentation') || categories[0];
  
  articles.push({
    id: nanoid(),
    title: 'Release Notes - Development History',
    slug: 'release-notes',
    content: `# Release Notes\n\nThis document contains the development history and release notes for the PM Tool project.\n\n## Recent Changes\n\n${releaseNotesContent}`,
    summary: 'Complete development history and release notes for the PM Tool project',
    status: 'published',
    type: 'documentation',
    organizationId: organization.id,
    authorId: adminUser.id,
    categoryId: docCategory.id,
    tags: ['release-notes', 'changelog', 'development'],
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Create feature documentation articles for major features
  const featureCommits = commits.filter(c => c.message.startsWith('feat:'));
  const featCategory = categories.find(c => c.slug === 'features') || categories[1];
  
  for (const commit of featureCommits.slice(0, 10)) {
    const details = await getCommitDetails(commit.hash);
    const title = commit.message.replace(/^feat:\s*/, '').substring(0, 100);
    
    articles.push({
      id: nanoid(),
      title: `Feature: ${title}`,
      slug: `feature-${commit.hash.substring(0, 7)}`,
      content: generateArticleContent(commit, details),
      summary: `Implementation details for: ${title}`,
      status: 'published',
      type: 'guide',
      organizationId: organization.id,
      authorId: adminUser.id,
      categoryId: featCategory.id,
      tags: ['feature', 'implementation'],
      publishedAt: new Date(commit.date),
      createdAt: new Date(commit.date),
      updatedAt: new Date(commit.date),
    });
  }
  
  // Create bug fix documentation
  const bugFixCommits = commits.filter(c => c.message.toLowerCase().includes('fix'));
  const bugCategory = categories.find(c => c.slug === 'bug-fixes') || categories[2];
  
  if (bugFixCommits.length > 0) {
    const bugFixContent = bugFixCommits.slice(0, 15).map(commit => {
      return `### ${commit.message.replace(/^[^:]+:\s*/, '')}\n\n- **Date**: ${commit.date}\n- **Author**: ${commit.author}\n- **Commit**: \`${commit.hash.substring(0, 7)}\``;
    }).join('\n\n');
    
    articles.push({
      id: nanoid(),
      title: 'Bug Fixes and Resolutions',
      slug: 'bug-fixes',
      content: `# Bug Fixes and Resolutions\n\nThis document tracks all bug fixes and issue resolutions in the PM Tool project.\n\n## Resolved Issues\n\n${bugFixContent}`,
      summary: 'Complete list of bug fixes and issue resolutions',
      status: 'published',
      type: 'reference',
      organizationId: organization.id,
      authorId: adminUser.id,
      categoryId: bugCategory.id,
      tags: ['bug-fix', 'issues', 'resolutions'],
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  // Create deployment guide based on Railway-related commits
  const deploymentCommits = commits.filter(c => 
    c.message.toLowerCase().includes('railway') || 
    c.message.toLowerCase().includes('deploy') ||
    c.message.toLowerCase().includes('build')
  );
  
  const deployCategory = categories.find(c => c.slug === 'deployment') || categories[3];
  
  if (deploymentCommits.length > 0) {
    const deploymentContent = deploymentCommits.map(commit => {
      return `### ${commit.message.replace(/^[^:]+:\s*/, '')}\n\n${commit.date} - This change addressed deployment-related issues.`;
    }).join('\n\n');
    
    articles.push({
      id: nanoid(),
      title: 'Deployment Guide and History',
      slug: 'deployment-guide',
      content: `# Deployment Guide\n\n## Railway Deployment\n\nThis project is deployed on Railway. Here's the deployment history and important fixes:\n\n${deploymentContent}\n\n## Key Configuration\n\n- **Trust Host**: Enabled in NextAuth configuration\n- **Environment Variables**: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL\n- **Build Command**: npm run build\n- **Start Command**: npm run start`,
      summary: 'Complete deployment guide and configuration for Railway',
      status: 'published',
      type: 'tutorial',
      organizationId: organization.id,
      authorId: adminUser.id,
      categoryId: deployCategory.id,
      tags: ['deployment', 'railway', 'configuration'],
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  // Create architecture overview
  articles.push({
    id: nanoid(),
    title: 'Project Architecture Overview',
    slug: 'architecture',
    content: `# PM Tool Architecture\n\n## Technology Stack\n\n### Frontend\n- **Framework**: Next.js 15 with App Router\n- **Language**: TypeScript\n- **Styling**: Tailwind CSS\n- **UI Components**: shadcn/ui\n- **State Management**: React hooks and context\n\n### Backend\n- **API**: Next.js API Routes\n- **Database**: PostgreSQL\n- **ORM**: Drizzle ORM\n- **Authentication**: NextAuth.js\n\n### Deployment\n- **Platform**: Railway\n- **Database**: Railway PostgreSQL\n- **CI/CD**: GitHub integration with Railway\n\n## Key Features\n\n1. **User Management**: Comprehensive user and role management system\n2. **Task Management**: Create, edit, delete, and track tasks\n3. **Kanban Boards**: Visual task management with drag-and-drop\n4. **Permissions System**: Role-based access control\n5. **Knowledge Base**: Documentation and article management\n6. **Real-time Updates**: Live updates for collaborative work\n\n## Recent Development Phases\n\n- **Phase 1**: Core task management features\n- **Phase 2**: Advanced features including Kanban boards\n- **Phase 3**: User management and permissions refactoring`,
    summary: 'Complete technical architecture overview of the PM Tool',
    status: 'published',
    type: 'reference',
    organizationId: organization.id,
    authorId: adminUser.id,
    categoryId: docCategory.id,
    tags: ['architecture', 'overview', 'technical'],
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Insert articles into database
  console.log(`Inserting ${articles.length} articles into knowledge base...`);
  
  try {
    await db.insert(kbArticles).values(articles);
    console.log('✅ Knowledge base articles created successfully!');
  } catch (error) {
    console.error('Error inserting articles:', error);
  }
}

main().catch(console.error).finally(() => process.exit());