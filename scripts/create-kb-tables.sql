-- Create Knowledge Base Categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS pmtool_kb_category (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id VARCHAR(255) REFERENCES pmtool_kb_category(id),
  organization_id VARCHAR(255) NOT NULL REFERENCES pmtool_organization(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Knowledge Base Articles table if it doesn't exist
CREATE TABLE IF NOT EXISTS pmtool_kb_article (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  summary TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  type VARCHAR(50) DEFAULT 'guide',
  organization_id VARCHAR(255) NOT NULL REFERENCES pmtool_organization(id),
  author_id VARCHAR(255) NOT NULL REFERENCES pmtool_user(id),
  category_id VARCHAR(255) REFERENCES pmtool_kb_category(id),
  tags JSON DEFAULT '[]'::json,
  metadata JSON DEFAULT '{}'::json,
  embedding JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kb_article_organization ON pmtool_kb_article(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_author ON pmtool_kb_article(author_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_category ON pmtool_kb_article(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_status ON pmtool_kb_article(status);
CREATE INDEX IF NOT EXISTS idx_kb_article_slug ON pmtool_kb_article(slug);

CREATE INDEX IF NOT EXISTS idx_kb_category_organization ON pmtool_kb_category(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_category_slug ON pmtool_kb_category(slug);