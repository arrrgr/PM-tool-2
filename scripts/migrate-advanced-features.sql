-- Advanced Features Migration Script
-- This script creates all tables for the new features

-- 1. Knowledge Base Tables
CREATE TABLE IF NOT EXISTS pmtool_kb_article (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    summary TEXT,
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    author_id VARCHAR(255) REFERENCES pmtool_user(id),
    organization_id VARCHAR(255) REFERENCES pmtool_organization(id),
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    ai_embeddings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmtool_kb_article_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES pmtool_kb_article(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES pmtool_user(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_helpful BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Organization Management Tables
CREATE TABLE IF NOT EXISTS pmtool_department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    organization_id VARCHAR(255) REFERENCES pmtool_organization(id),
    parent_id UUID REFERENCES pmtool_department(id),
    head_id VARCHAR(255) REFERENCES pmtool_user(id),
    budget DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmtool_team (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES pmtool_department(id),
    organization_id VARCHAR(255) REFERENCES pmtool_organization(id),
    lead_id VARCHAR(255) REFERENCES pmtool_user(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmtool_team_member (
    team_id VARCHAR(255) REFERENCES pmtool_team(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES pmtool_user(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

-- 3. Project Templates Tables
CREATE TABLE IF NOT EXISTS pmtool_project_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    key VARCHAR(10) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50),
    is_public BOOLEAN DEFAULT false,
    category VARCHAR(50) DEFAULT 'general',
    tags JSONB DEFAULT '[]',
    task_templates JSONB DEFAULT '[]',
    workflow_states JSONB DEFAULT '["To Do", "In Progress", "In Review", "Done"]',
    custom_fields JSONB DEFAULT '[]',
    organization_id VARCHAR(255) REFERENCES pmtool_organization(id),
    created_by VARCHAR(255) REFERENCES pmtool_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmtool_template_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES pmtool_project_template(id) ON DELETE CASCADE,
    project_id VARCHAR(255) REFERENCES pmtool_project(id) ON DELETE CASCADE,
    used_by VARCHAR(255) REFERENCES pmtool_user(id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Role-Based Access Control (RBAC) Tables
CREATE TABLE IF NOT EXISTS pmtool_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    organization_id VARCHAR(255) REFERENCES pmtool_organization(id),
    permissions JSONB DEFAULT '[]',
    type VARCHAR(50) DEFAULT 'custom',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmtool_user_role (
    user_id VARCHAR(255) REFERENCES pmtool_user(id) ON DELETE CASCADE,
    role_id UUID REFERENCES pmtool_role(id) ON DELETE CASCADE,
    scope VARCHAR(50) DEFAULT 'organization',
    scope_id UUID,
    granted_by VARCHAR(255) REFERENCES pmtool_user(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id, scope, scope_id)
);

CREATE TABLE IF NOT EXISTS pmtool_project_permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(255) REFERENCES pmtool_project(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES pmtool_user(id) ON DELETE CASCADE,
    team_id VARCHAR(255) REFERENCES pmtool_team(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '[]',
    granted_by VARCHAR(255) REFERENCES pmtool_user(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmtool_team_permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(255) REFERENCES pmtool_team(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES pmtool_user(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '[]',
    granted_by VARCHAR(255) REFERENCES pmtool_user(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmtool_permission_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    organization_id VARCHAR(255) REFERENCES pmtool_organization(id),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    conditions JSONB DEFAULT '[]',
    effect VARCHAR(10) DEFAULT 'allow',
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. File Attachments (if not exists)
CREATE TABLE IF NOT EXISTS pmtool_attachment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(255) REFERENCES pmtool_task(id) ON DELETE CASCADE,
    project_id VARCHAR(255) REFERENCES pmtool_project(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_key VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(255) REFERENCES pmtool_user(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Epic/Sub-task Hierarchy (add parent_id to tasks if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pmtool_task' AND column_name='parent_id') THEN
        ALTER TABLE pmtool_task ADD COLUMN parent_id VARCHAR(255) REFERENCES pmtool_task(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pmtool_task' AND column_name='is_epic') THEN
        ALTER TABLE pmtool_task ADD COLUMN is_epic BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pmtool_task' AND column_name='epic_color') THEN
        ALTER TABLE pmtool_task ADD COLUMN epic_color VARCHAR(7);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kb_article_org ON pmtool_kb_article(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_author ON pmtool_kb_article(author_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_slug ON pmtool_kb_article(slug);

CREATE INDEX IF NOT EXISTS idx_department_org ON pmtool_department(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_org ON pmtool_team(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_dept ON pmtool_team(department_id);

CREATE INDEX IF NOT EXISTS idx_template_org ON pmtool_project_template(organization_id);
CREATE INDEX IF NOT EXISTS idx_template_public ON pmtool_project_template(is_public);

CREATE INDEX IF NOT EXISTS idx_role_org ON pmtool_role(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_role_user ON pmtool_user_role(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_role ON pmtool_user_role(role_id);

CREATE INDEX IF NOT EXISTS idx_task_parent ON pmtool_task(parent_id);
CREATE INDEX IF NOT EXISTS idx_task_epic ON pmtool_task(is_epic);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_kb_article_updated_at') THEN
        CREATE TRIGGER update_kb_article_updated_at BEFORE UPDATE ON pmtool_kb_article 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_department_updated_at') THEN
        CREATE TRIGGER update_department_updated_at BEFORE UPDATE ON pmtool_department 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_updated_at') THEN
        CREATE TRIGGER update_team_updated_at BEFORE UPDATE ON pmtool_team 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_template_updated_at') THEN
        CREATE TRIGGER update_project_template_updated_at BEFORE UPDATE ON pmtool_project_template 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_role_updated_at') THEN
        CREATE TRIGGER update_role_updated_at BEFORE UPDATE ON pmtool_role 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;