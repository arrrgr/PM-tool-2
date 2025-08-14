-- Fix Railway database schema to match local
-- Run this in Railway's database console or via railway run psql

-- Add missing is_epic column to tasks table
ALTER TABLE pmtool_task 
ADD COLUMN IF NOT EXISTS is_epic BOOLEAN DEFAULT false;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'pmtool_task'
AND column_name = 'is_epic';

-- Check for any other missing columns by comparing with expected schema
-- Expected columns in pmtool_task:
-- id, key, title, description, status, priority, type, story_points, 
-- due_date, project_id, assignee_id, reporter_id, parent_task_id, 
-- is_epic, epic_id, created_at, updated_at

-- If you see other missing columns errors, add them similarly:
-- ALTER TABLE pmtool_task ADD COLUMN IF NOT EXISTS column_name data_type DEFAULT default_value;