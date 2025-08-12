import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/pmtool';

async function createIndexes() {
  console.log('Creating indexes for organization tables...');
  console.log('Connecting to:', DATABASE_URL);
  
  const sql = postgres(DATABASE_URL);
  
  try {
    // Create indexes one by one
    await sql`CREATE INDEX IF NOT EXISTS idx_invitation_email ON pmtool_organization_invitation(email)`;
    console.log('✓ Created idx_invitation_email');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_invitation_token ON pmtool_organization_invitation(token)`;
    console.log('✓ Created idx_invitation_token');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_team_org ON pmtool_team(organization_id)`;
    console.log('✓ Created idx_team_org');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_team_member_user ON pmtool_team_member(user_id)`;
    console.log('✓ Created idx_team_member_user');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_org ON pmtool_organization_activity_log(organization_id)`;
    console.log('✓ Created idx_activity_org');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_user ON pmtool_organization_activity_log(user_id)`;
    console.log('✓ Created idx_activity_user');
    
    console.log('\n✅ All indexes created successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    await sql.end();
    process.exit(1);
  }
}

createIndexes();