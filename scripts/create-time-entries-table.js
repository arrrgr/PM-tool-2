const fs = require('fs');
const path = require('path');

// Load env file manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value.replace(/^["']|["']$/g, '');
  }
});

const postgres = require('postgres');

async function createTable() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('Creating time_entry table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_time_entry (
        id VARCHAR(255) PRIMARY KEY,
        task_id VARCHAR(255) NOT NULL REFERENCES pmtool_task(id),
        user_id VARCHAR(255) NOT NULL REFERENCES pmtool_user(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INTEGER,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ time_entry table created successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    await sql.end();
    process.exit(1);
  }
}

createTable();