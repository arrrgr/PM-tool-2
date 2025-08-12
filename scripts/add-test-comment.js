#!/usr/bin/env node

const { randomUUID } = require('crypto');

// Set environment variables directly
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/pmtool";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key-123";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
process.env.SKIP_ENV_VALIDATION = "true";

async function addTestComments() {
  try {
    console.log('💬 Adding test comments to tasks...');
    
    // Import database after setting env vars
    const { db } = require('../src/server/db');
    const { tasks, comments, users } = require('../src/server/db/schema');
    const { eq } = require('drizzle-orm');
    
    // Get first few tasks
    const allTasks = await db.select().from(tasks).limit(5);
    
    if (allTasks.length === 0) {
      console.log('No tasks found in database');
      return;
    }
    
    // Get first user to be the comment author
    const allUsers = await db.select().from(users).limit(1);
    
    if (allUsers.length === 0) {
      console.log('No users found in database');
      return;
    }
    
    const userId = allUsers[0].id;
    
    // Add comments to each task
    for (const task of allTasks) {
      const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments per task
      
      for (let i = 0; i < numComments; i++) {
        const comment = {
          id: randomUUID(),
          taskId: task.id,
          authorId: userId,
          content: `Test comment ${i + 1} for task ${task.key}. This is a sample comment to test the display functionality. @mention test included.`,
          isInternal: Math.random() > 0.7, // 30% chance of internal comment
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await db.insert(comments).values(comment);
        console.log(`✅ Added comment to task ${task.key}`);
      }
    }
    
    console.log('✅ Test comments added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test comments:', error);
    process.exit(1);
  }
}

addTestComments();