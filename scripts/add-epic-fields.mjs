import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/pmtool';

async function addEpicFields() {
  console.log('Adding epic/hierarchy fields to tasks table...');
  console.log('Connecting to:', DATABASE_URL);
  
  const sql = postgres(DATABASE_URL);
  
  try {
    // Add isEpic field
    await sql`
      ALTER TABLE pmtool_task 
      ADD COLUMN IF NOT EXISTS is_epic BOOLEAN DEFAULT false
    `;
    console.log('✓ Added is_epic column');
    
    // Add progress field for epics
    await sql`
      ALTER TABLE pmtool_task 
      ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0
    `;
    console.log('✓ Added progress column');
    
    // Check if parent_task_id exists, if not add it
    await sql`
      ALTER TABLE pmtool_task 
      ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255)
    `;
    console.log('✓ Ensured parent_task_id column exists');
    
    // Add index for parent_task_id for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_task_parent 
      ON pmtool_task(parent_task_id)
    `;
    console.log('✓ Created index on parent_task_id');
    
    // Add index for is_epic for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_task_epic 
      ON pmtool_task(is_epic)
    `;
    console.log('✓ Created index on is_epic');
    
    console.log('\n✅ Epic/hierarchy fields added successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error adding fields:', error);
    await sql.end();
    process.exit(1);
  }
}

addEpicFields();