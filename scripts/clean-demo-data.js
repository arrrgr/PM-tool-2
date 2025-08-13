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

async function cleanDemoData() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('🧹 Cleaning existing demo data...');
    
    // Delete in order to avoid foreign key constraints  
    // First check what columns exist
    const orgResult = await sql`SELECT id FROM pmtool_organization WHERE slug = 'pm-tool-org' LIMIT 1`;
    if (orgResult.length > 0) {
      const orgId = orgResult[0].id;
      
      // Delete time entries
      await sql`DELETE FROM pmtool_time_entry WHERE task_id IN (SELECT id FROM pmtool_task WHERE project_id IN (SELECT id FROM pmtool_project WHERE organization_id = ${orgId}))`;
      
      // Delete comments
      await sql`DELETE FROM pmtool_comment WHERE task_id IN (SELECT id FROM pmtool_task WHERE project_id IN (SELECT id FROM pmtool_project WHERE organization_id = ${orgId}))`;
      
      // Delete tasks
      await sql`DELETE FROM pmtool_task WHERE project_id IN (SELECT id FROM pmtool_project WHERE organization_id = ${orgId})`;
      
      // Delete projects
      await sql`DELETE FROM pmtool_project WHERE organization_id = ${orgId}`;
      
      // Delete activity logs
      await sql`DELETE FROM pmtool_activity_log WHERE organization_id = ${orgId}`;
      
      // Delete KB articles and categories if they exist
      try {
        await sql`DELETE FROM pmtool_kb_article WHERE author_id IN (SELECT id FROM pmtool_user WHERE organization_id = ${orgId})`;
        await sql`DELETE FROM pmtool_kb_category`;
      } catch (e) {
        // Tables might not exist yet
      }
      
      // Delete users
      await sql`DELETE FROM pmtool_user WHERE organization_id = ${orgId}`;
      
      // Delete organization
      await sql`DELETE FROM pmtool_organization WHERE id = ${orgId}`;
    }
    
    console.log('✅ Demo data cleaned successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning data:', error);
    await sql.end();
    process.exit(1);
  }
}

cleanDemoData();