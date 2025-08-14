#!/usr/bin/env node

/**
 * Fix Railway database schema mismatches
 * This script adds missing columns that exist in code but not in Railway's database
 */

const postgres = require('postgres');

async function fixRailwayDatabase() {
  console.log('🚀 Fixing Railway Database Schema...\n');
  
  // Use DATABASE_URL from environment (Railway provides this)
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found. This script should be run on Railway.');
    process.exit(1);
  }
  
  const sql = postgres(databaseUrl);
  
  try {
    console.log('📊 Checking current database schema...\n');
    
    // 1. Check for is_epic column in tasks
    const taskColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pmtool_task'
      ORDER BY ordinal_position
    `;
    
    const hasIsEpic = taskColumns.some(col => col.column_name === 'is_epic');
    
    if (!hasIsEpic) {
      console.log('➕ Adding missing is_epic column to pmtool_task...');
      await sql`
        ALTER TABLE pmtool_task 
        ADD COLUMN is_epic BOOLEAN DEFAULT false
      `;
      console.log('✅ Added is_epic column');
    } else {
      console.log('✅ is_epic column already exists');
    }
    
    // 2. Check for epic_id column
    const hasEpicId = taskColumns.some(col => col.column_name === 'epic_id');
    
    if (!hasEpicId) {
      console.log('➕ Adding missing epic_id column to pmtool_task...');
      await sql`
        ALTER TABLE pmtool_task 
        ADD COLUMN epic_id VARCHAR(255) DEFAULT NULL
      `;
      console.log('✅ Added epic_id column');
    } else {
      console.log('✅ epic_id column already exists');
    }
    
    // 3. Check teams table columns
    const teamsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pmtool_team'
      )
    `;
    
    if (!teamsExists[0].exists) {
      console.log('➕ Creating pmtool_team table...');
      await sql`
        CREATE TABLE pmtool_team (
          id VARCHAR(255) PRIMARY KEY,
          organization_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          parent_team_id VARCHAR(255),
          leader_id VARCHAR(255),
          settings JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ Created pmtool_team table');
    } else {
      console.log('✅ pmtool_team table already exists');
    }
    
    // 4. Check team_members table
    const teamMembersExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pmtool_team_member'
      )
    `;
    
    if (!teamMembersExists[0].exists) {
      console.log('➕ Creating pmtool_team_member table...');
      await sql`
        CREATE TABLE pmtool_team_member (
          team_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'member',
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (team_id, user_id)
        )
      `;
      console.log('✅ Created pmtool_team_member table');
    } else {
      console.log('✅ pmtool_team_member table already exists');
    }
    
    // 5. Verify all changes
    console.log('\n📋 Final verification...');
    
    const finalTaskColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pmtool_task' 
      AND column_name IN ('is_epic', 'epic_id')
    `;
    
    console.log('Task columns fixed:', finalTaskColumns.map(c => c.column_name).join(', '));
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('pmtool_team', 'pmtool_team_member')
    `;
    
    console.log('Tables present:', tables.map(t => t.table_name).join(', '));
    
    console.log('\n✨ Database schema fixed successfully!');
    console.log('\n🎉 All features should now work on Railway:');
    console.log('  ✅ Task creation');
    console.log('  ✅ Drag and drop');
    console.log('  ✅ Team creation');
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    await sql.end();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixRailwayDatabase();
}

module.exports = { fixRailwayDatabase };