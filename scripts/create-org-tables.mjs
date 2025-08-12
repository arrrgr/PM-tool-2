import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/pmtool';

async function createOrgTables() {
  console.log('Creating organization management tables...');
  console.log('Connecting to:', DATABASE_URL);
  
  const sql = postgres(DATABASE_URL);
  
  try {
    // Create organization invitations table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_organization_invitation (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL REFERENCES pmtool_organization(id),
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        invited_by VARCHAR(255) NOT NULL REFERENCES pmtool_user(id),
        token VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'pending',
        expires_at TIMESTAMP NOT NULL,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created organization_invitation table');
    
    // Create teams table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_team (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL REFERENCES pmtool_organization(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_team_id VARCHAR(255),
        leader_id VARCHAR(255) REFERENCES pmtool_user(id),
        settings JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created team table');
    
    // Create team members table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_team_member (
        team_id VARCHAR(255) NOT NULL REFERENCES pmtool_team(id),
        user_id VARCHAR(255) NOT NULL REFERENCES pmtool_user(id),
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (team_id, user_id)
      )
    `;
    console.log('✓ Created team_member table');
    
    // Create organization billing table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_organization_billing (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL UNIQUE REFERENCES pmtool_organization(id),
        customer_id VARCHAR(255),
        subscription_id VARCHAR(255),
        plan VARCHAR(50) DEFAULT 'free',
        status VARCHAR(50) DEFAULT 'active',
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at TIMESTAMP,
        canceled_at TIMESTAMP,
        trial_ends_at TIMESTAMP,
        monthly_active_users INTEGER DEFAULT 0,
        storage_used_mb INTEGER DEFAULT 0,
        api_calls_count INTEGER DEFAULT 0,
        billing_email VARCHAR(255),
        billing_address JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created organization_billing table');
    
    // Create organization activity log table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_organization_activity_log (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL REFERENCES pmtool_organization(id),
        user_id VARCHAR(255) NOT NULL REFERENCES pmtool_user(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(255),
        metadata JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created organization_activity_log table');
    
    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_invitation_email ON pmtool_organization_invitation(email);
      CREATE INDEX IF NOT EXISTS idx_invitation_token ON pmtool_organization_invitation(token);
      CREATE INDEX IF NOT EXISTS idx_team_org ON pmtool_team(organization_id);
      CREATE INDEX IF NOT EXISTS idx_team_member_user ON pmtool_team_member(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_org ON pmtool_organization_activity_log(organization_id);
      CREATE INDEX IF NOT EXISTS idx_activity_user ON pmtool_organization_activity_log(user_id);
    `;
    console.log('✓ Created indexes');
    
    console.log('\n✅ Organization management tables created successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    await sql.end();
    process.exit(1);
  }
}

createOrgTables();