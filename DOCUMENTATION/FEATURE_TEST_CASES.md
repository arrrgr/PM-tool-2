# Feature Test Cases

## Feature 1: File Attachments

### Test Case FA-1: Upload File to Task
**Steps:**
1. Open any task in edit mode
2. Click "Attachments" tab
3. Click "Upload File" or drag file to drop zone
4. Select an image file (< 10MB)
5. Verify upload progress bar appears
6. Verify file appears in attachments list with:
   - Thumbnail (for images)
   - File name
   - File size
   - Upload date
   - Uploader name

### Test Case FA-2: Download Attachment
**Steps:**
1. Open task with attachments
2. Click download icon on any attachment
3. Verify file downloads with original name
4. Verify file integrity (can be opened)

### Test Case FA-3: Delete Attachment
**Steps:**
1. Open task with attachments
2. Click delete icon on attachment
3. Confirm deletion in dialog
4. Verify attachment removed from list
5. Verify file removed from S3 (backend check)

### Test Case FA-4: Preview Image
**Steps:**
1. Upload an image file (JPG/PNG)
2. Click on image thumbnail
3. Verify preview modal opens
4. Verify image displays at full size
5. Close modal with X or ESC key

### Test Case FA-5: Upload to Comment
**Steps:**
1. Open task comments
2. Type comment text
3. Click attachment icon
4. Upload file
5. Submit comment
6. Verify comment shows with attachment

### Test Case FA-6: File Validation
**Steps:**
1. Try uploading file > 10MB
2. Verify error message appears
3. Try uploading unsupported file type (.exe)
4. Verify rejection with appropriate message

**Success Criteria:**
- Files upload successfully to S3
- Downloads work with presigned URLs
- Deletes remove from both DB and S3
- Image previews render correctly
- File size/type validation works

## Feature 2: AI Knowledge Base

### Test Case KB-1: Create Knowledge Article
**Steps:**
1. Navigate to Knowledge Base section
2. Click "New Article" button
3. Enter title and content
4. Add relevant tags
5. Select category
6. Save article
7. Verify article appears in knowledge base list
8. Verify article is searchable

### Test Case KB-2: AI-Powered Search
**Steps:**
1. Go to Knowledge Base search
2. Enter natural language query (e.g., "how to handle payment errors")
3. Press Enter or click Search
4. Verify relevant articles appear
5. Verify results ranked by relevance
6. Click on result to view full article

### Test Case KB-3: Generate Article Summary
**Steps:**
1. Open any long knowledge article
2. Click "Generate AI Summary" button
3. Verify loading indicator appears
4. Verify AI-generated summary displays
5. Verify summary is concise and accurate

### Test Case KB-4: Related Articles
**Steps:**
1. Open any knowledge article
2. Scroll to "Related Articles" section
3. Verify 3-5 related articles shown
4. Verify articles are contextually relevant
5. Click related article to navigate

### Test Case KB-5: Ask AI Assistant
**Steps:**
1. Click "Ask AI" button in knowledge base
2. Type question about project/process
3. Submit query
4. Verify AI provides contextual answer
5. Verify sources/articles referenced
6. Rate answer helpful/not helpful

### Test Case KB-6: Auto-categorization
**Steps:**
1. Create new article
2. Enter title and content
3. Click "Auto-categorize with AI"
4. Verify AI suggests category
5. Verify AI suggests relevant tags
6. Accept or modify suggestions
7. Save article

**Success Criteria:**
- Articles stored with embeddings
- Semantic search returns relevant results
- AI summaries are accurate
- Related articles are contextually appropriate
- AI assistant provides helpful answers

## Feature 3: Epic/Sub-task Hierarchy

### Test Case EH-1: Create Epic
**Steps:**
1. Navigate to project board
2. Click "Create Epic" button
3. Enter epic title and description
4. Set epic properties (due date, priority)
5. Save epic
6. Verify epic appears with special indicator
7. Verify epic shows 0% progress initially

### Test Case EH-2: Add Tasks to Epic
**Steps:**
1. Open existing epic
2. Click "Add Task" or drag existing task
3. Create/link multiple tasks
4. Verify tasks show under epic
5. Verify epic progress updates
6. Verify breadcrumb shows hierarchy

### Test Case EH-3: Create Sub-tasks
**Steps:**
1. Open any task
2. Click "Add Sub-task"
3. Enter sub-task details
4. Save sub-task
5. Verify sub-task appears nested
6. Verify parent task shows sub-task count

### Test Case EH-4: Progress Rollup
**Steps:**
1. Create epic with 4 tasks
2. Complete 1 task (25% progress)
3. Complete 2nd task (50% progress)
4. Verify epic shows correct percentage
5. Verify progress bar updates

### Test Case EH-5: Convert Task to Epic
**Steps:**
1. Select existing task
2. Click "Convert to Epic"
3. Confirm conversion
4. Verify task becomes epic
5. Verify existing data preserved
6. Verify can add child tasks

### Test Case EH-6: Hierarchy View
**Steps:**
1. Navigate to hierarchy view
2. Verify tree structure displays
3. Expand/collapse epic nodes
4. Verify indentation levels correct
5. Verify can edit at any level

**Success Criteria:**
- Parent-child relationships work correctly
- Progress rolls up accurately
- UI clearly shows hierarchy
- Conversion between types works
- Performance remains good with nested data

## Feature 4: Organization Management

### Test Case OM-1: Create Organization
**Steps:**
1. Navigate to organization settings
2. Click "Create New Organization"
3. Enter organization name and details
4. Select subscription plan
5. Save organization
6. Verify organization created
7. Verify user is admin of new org

### Test Case OM-2: Invite Team Members
**Steps:**
1. Go to team management
2. Click "Invite Members"
3. Enter email addresses
4. Select role for invitees
5. Send invitations
6. Verify invitation emails sent
7. Verify pending invites shown

### Test Case OM-3: Accept Invitation
**Steps:**
1. Open invitation email/link
2. Click accept invitation
3. Complete registration if new user
4. Verify added to organization
5. Verify correct role assigned
6. Verify access to projects

### Test Case OM-4: Organization Settings
**Steps:**
1. Navigate to org settings
2. Update organization name
3. Change default settings
4. Upload organization logo
5. Set working hours
6. Save changes
7. Verify settings applied

### Test Case OM-5: Manage Teams/Departments
**Steps:**
1. Go to teams section
2. Create new department
3. Assign team lead
4. Add members to department
5. Set department permissions
6. Verify structure created

### Test Case OM-6: Billing Management
**Steps:**
1. Navigate to billing section
2. View current subscription
3. Check usage statistics
4. Update payment method
5. View invoice history
6. Download invoices

**Success Criteria:**
- Organizations properly isolated
- Invitation system works smoothly
- Settings apply organization-wide
- Team structure is flexible
- Billing information is secure

## Feature 5: Bulk Operations

### Test Case BO-1: Select Multiple Tasks
**Steps:**
1. Navigate to Tasks page
2. Enable bulk selection mode (checkbox appears)
3. Select 3-5 tasks using checkboxes
4. Verify selection count shows at top
5. Verify bulk action toolbar appears

### Test Case BO-2: Bulk Status Update
**Steps:**
1. Select multiple tasks
2. Click "Change Status" in bulk toolbar
3. Select new status (e.g., "In Progress")
4. Apply changes
5. Verify all selected tasks updated
6. Check activity log for bulk operation

### Test Case BO-3: Bulk Assignee Change
**Steps:**
1. Select multiple tasks
2. Click "Assign To" in bulk toolbar
3. Select user from dropdown
4. Apply assignment
5. Verify all tasks assigned to user
6. Verify notifications sent

### Test Case BO-4: Bulk Delete
**Steps:**
1. Select multiple tasks
2. Click "Delete" in bulk toolbar
3. Confirm deletion in dialog
4. Verify tasks moved to trash/deleted
5. Verify undo option available

### Test Case BO-5: Bulk Move to Project
**Steps:**
1. Select tasks from one project
2. Click "Move to Project"
3. Select target project
4. Confirm move
5. Verify tasks appear in new project
6. Verify task keys updated if needed

### Test Case BO-6: Bulk Label Addition
**Steps:**
1. Select multiple tasks
2. Click "Add Labels"
3. Select/create labels to add
4. Apply labels
5. Verify labels added to all tasks
6. Verify filter by new labels works

**Success Criteria:**
- Checkbox selection works smoothly
- Bulk actions complete successfully
- Confirmation dialogs prevent accidents
- Undo functionality available
- Performance remains good with 100+ selections