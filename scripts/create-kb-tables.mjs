import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/pmtool';

async function createKnowledgeTables() {
  console.log('Creating knowledge base tables...');
  console.log('Connecting to:', DATABASE_URL);
  
  const sql = postgres(DATABASE_URL);
  
  try {
    // Create knowledge articles table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_knowledge_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        category VARCHAR(100),
        tags JSONB DEFAULT '[]'::jsonb,
        embedding JSONB,
        ai_generated BOOLEAN DEFAULT false,
        author_id VARCHAR(255) NOT NULL,
        project_id UUID,
        is_published BOOLEAN DEFAULT true,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✓ Created pmtool_knowledge_articles table');
    
    // Create article feedback table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_article_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id UUID NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        helpful BOOLEAN NOT NULL,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✓ Created pmtool_article_feedback table');
    
    // Create AI queries table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_ai_queries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        context JSONB,
        tokens INTEGER,
        response_time INTEGER,
        helpful BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✓ Created pmtool_ai_queries table');
    
    // Create knowledge categories table
    await sql`
      CREATE TABLE IF NOT EXISTS pmtool_knowledge_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7),
        icon VARCHAR(50),
        parent_id UUID,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✓ Created pmtool_knowledge_categories table');
    
    // Add default categories
    await sql`
      INSERT INTO pmtool_knowledge_categories (name, description, color, icon) VALUES
        ('Technical', 'Technical documentation and guides', '#3B82F6', 'code'),
        ('Process', 'Business processes and workflows', '#10B981', 'workflow'),
        ('Documentation', 'General documentation', '#8B5CF6', 'file-text'),
        ('Best Practices', 'Best practices and guidelines', '#F59E0B', 'star'),
        ('FAQ', 'Frequently asked questions', '#EF4444', 'help-circle')
      ON CONFLICT (name) DO NOTHING
    `;
    console.log('✓ Added default categories');
    
    console.log('\n✅ Knowledge base tables created successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    await sql.end();
    process.exit(1);
  }
}

createKnowledgeTables();