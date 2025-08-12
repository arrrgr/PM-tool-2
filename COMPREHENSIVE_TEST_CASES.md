# Comprehensive Test Cases - PM Tool Application

## Test Execution Date: 2025-08-12
## Application Version: Full Implementation (Phase 1-7)

---

## 1. AUTHENTICATION & USER MANAGEMENT

### AUTH-1: User Login
**Objective:** Verify user can log in with valid credentials
**Steps:**
1. Navigate to /auth/signin
2. Enter valid email and password
3. Click "Sign In"
**Expected:** User is redirected to dashboard
**Status:** [ ] PASS [ ] FAIL

### AUTH-2: User Logout
**Objective:** Verify user can log out
**Steps:**
1. Click "Sign Out" button in header
2. Confirm logout
**Expected:** User is redirected to login page
**Status:** [ ] PASS [ ] FAIL

### AUTH-3: Session Persistence
**Objective:** Verify session persists across page refreshes
**Steps:**
1. Log in successfully
2. Refresh the page
3. Navigate to different pages
**Expected:** User remains logged in
**Status:** [ ] PASS [ ] FAIL

---

## 2. DASHBOARD

### DASH-1: Dashboard Overview
**Objective:** Verify dashboard displays correct statistics
**Steps:**
1. Navigate to /dashboard
2. Check project count
3. Check task statistics
4. Check recent activity
**Expected:** All statistics display correctly
**Status:** [ ] PASS [ ] FAIL

### DASH-2: Quick Actions
**Objective:** Verify quick action buttons work
**Steps:**
1. Click "New Project" button
2. Click "New Task" button
**Expected:** Appropriate dialogs open
**Status:** [ ] PASS [ ] FAIL

---

## 3. PROJECT MANAGEMENT

### PROJ-1: Create Project
**Objective:** Verify project creation
**Steps:**
1. Navigate to /projects
2. Click "New Project"
3. Fill in: Name, Key, Description
4. Submit form
**Expected:** Project created and appears in list
**Status:** [ ] PASS [ ] FAIL

### PROJ-2: View Project Details
**Objective:** Verify project details page
**Steps:**
1. Click on a project from list
2. Check project information displays
3. Check task list loads
**Expected:** All project details visible
**Status:** [ ] PASS [ ] FAIL

### PROJ-3: Edit Project
**Objective:** Verify project editing
**Steps:**
1. Open project details
2. Click edit button
3. Modify project details
4. Save changes
**Expected:** Changes persist
**Status:** [ ] PASS [ ] FAIL

### PROJ-4: Delete Project
**Objective:** Verify project deletion
**Steps:**
1. Select a test project
2. Click delete button
3. Confirm deletion
**Expected:** Project removed from list
**Status:** [ ] PASS [ ] FAIL

---

## 4. TASK MANAGEMENT

### TASK-1: Create Task
**Objective:** Verify task creation
**Steps:**
1. Navigate to project
2. Click "New Task"
3. Fill in: Title, Description, Priority, Assignee
4. Submit form
**Expected:** Task created with unique key
**Status:** [ ] PASS [ ] FAIL

### TASK-2: Edit Task
**Objective:** Verify task editing
**Steps:**
1. Click edit icon on task
2. Modify task details
3. Save changes
**Expected:** Changes persist
**Status:** [ ] PASS [ ] FAIL

### TASK-3: Task Status Updates
**Objective:** Verify status changes
**Steps:**
1. Open task
2. Change status from To Do → In Progress → Done
3. Check status persists
**Expected:** Status updates correctly
**Status:** [ ] PASS [ ] FAIL

### TASK-4: Task Comments
**Objective:** Verify commenting system
**Steps:**
1. Open task details
2. Add a comment
3. Submit comment
**Expected:** Comment appears with timestamp
**Status:** [ ] PASS [ ] FAIL

### TASK-5: Delete Task
**Objective:** Verify task deletion
**Steps:**
1. Click delete on task
2. Confirm deletion
**Expected:** Task removed
**Status:** [ ] PASS [ ] FAIL

---

## 5. KANBAN BOARD

### KAN-1: Drag and Drop
**Objective:** Verify drag-drop functionality
**Steps:**
1. Navigate to project Kanban view
2. Drag task from To Do to In Progress
3. Drag task to Done
**Expected:** Task status updates with movement
**Status:** [ ] PASS [ ] FAIL

### KAN-2: Column Filtering
**Objective:** Verify Kanban filtering
**Steps:**
1. Apply assignee filter
2. Apply priority filter
**Expected:** Only matching tasks display
**Status:** [ ] PASS [ ] FAIL

---

## 6. TASK FILTERS & SEARCH

### FILTER-1: Search Tasks
**Objective:** Verify task search
**Steps:**
1. Navigate to /tasks
2. Enter search term in search box
3. Check results
**Expected:** Only matching tasks display
**Status:** [ ] PASS [ ] FAIL

### FILTER-2: Filter by Project
**Objective:** Verify project filter
**Steps:**
1. Select project from dropdown
2. Check filtered results
**Expected:** Only tasks from selected project show
**Status:** [ ] PASS [ ] FAIL

### FILTER-3: Filter by Assignee
**Objective:** Verify assignee filter
**Steps:**
1. Select assignee from dropdown
2. Check filtered results
**Expected:** Only assigned tasks show
**Status:** [ ] PASS [ ] FAIL

### FILTER-4: Filter by Status
**Objective:** Verify status filter
**Steps:**
1. Select status from dropdown
2. Check filtered results
**Expected:** Only tasks with selected status show
**Status:** [ ] PASS [ ] FAIL

### FILTER-5: Filter by Priority
**Objective:** Verify priority filter
**Steps:**
1. Select priority from dropdown
2. Check filtered results
**Expected:** Only tasks with selected priority show
**Status:** [ ] PASS [ ] FAIL

---

## 7. PHASE 1: FILE ATTACHMENTS

### FILE-1: Upload Attachment
**Objective:** Verify file upload to S3
**Steps:**
1. Open task details
2. Click "Attach File"
3. Select a file (< 10MB)
4. Upload file
**Expected:** File uploads and appears in attachments
**Status:** [ ] PASS [ ] FAIL

### FILE-2: Download Attachment
**Objective:** Verify file download
**Steps:**
1. Click on attached file
2. Download file
**Expected:** File downloads correctly
**Status:** [ ] PASS [ ] FAIL

### FILE-3: Delete Attachment
**Objective:** Verify attachment deletion
**Steps:**
1. Click delete on attachment
2. Confirm deletion
**Expected:** Attachment removed
**Status:** [ ] PASS [ ] FAIL

---

## 8. PHASE 2: AI KNOWLEDGE BASE

### KB-1: View Articles
**Objective:** Verify knowledge base display
**Steps:**
1. Navigate to /knowledge
2. Check articles display
3. Click on an article
**Expected:** Articles list and content display
**Status:** [ ] PASS [ ] FAIL

### KB-2: Search Articles
**Objective:** Verify article search
**Steps:**
1. Enter search term
2. Click "AI Search"
3. Check results
**Expected:** Relevant articles appear
**Status:** [ ] PASS [ ] FAIL

### KB-3: Create Article
**Objective:** Verify article creation
**Steps:**
1. Click "New Article"
2. Fill in title and content
3. Save article
**Expected:** Article created and visible
**Status:** [ ] PASS [ ] FAIL

### KB-4: Article Categories
**Objective:** Verify category filtering
**Steps:**
1. Click on category filter
2. Select "Getting Started"
3. Check filtered results
**Expected:** Only articles in category show
**Status:** [ ] PASS [ ] FAIL

---

## 9. PHASE 3: EPIC/SUB-TASK HIERARCHY

### EPIC-1: Create Epic
**Objective:** Verify epic creation
**Steps:**
1. Create new task
2. Mark as "Epic"
3. Set epic color
**Expected:** Epic created with special styling
**Status:** [ ] PASS [ ] FAIL

### EPIC-2: Create Sub-task
**Objective:** Verify sub-task creation
**Steps:**
1. Open epic task
2. Click "Add Sub-task"
3. Create sub-task
**Expected:** Sub-task linked to epic
**Status:** [ ] PASS [ ] FAIL

### EPIC-3: View Hierarchy
**Objective:** Verify task hierarchy display
**Steps:**
1. Open epic with sub-tasks
2. Check hierarchy visualization
**Expected:** Parent-child relationship visible
**Status:** [ ] PASS [ ] FAIL

---

## 10. PHASE 4: ORGANIZATION MANAGEMENT

### ORG-1: View Organization
**Objective:** Verify organization page
**Steps:**
1. Navigate to /organization
2. Check organization details
3. Check departments list
**Expected:** Organization info displays
**Status:** [ ] PASS [ ] FAIL

### ORG-2: View Departments
**Objective:** Verify departments display
**Steps:**
1. Check Engineering department
2. Check Marketing department
3. Check HR department
**Expected:** All 3 departments visible
**Status:** [ ] PASS [ ] FAIL

### ORG-3: Team Management
**Objective:** Verify team display
**Steps:**
1. Navigate to /team
2. Check team members list
3. Check roles display
**Expected:** Team members and roles visible
**Status:** [ ] PASS [ ] FAIL

---

## 11. PHASE 5: BULK OPERATIONS

### BULK-1: Multi-Select Tasks
**Objective:** Verify task selection
**Steps:**
1. Navigate to /tasks
2. Click checkboxes for 3 tasks
3. Check selection counter
**Expected:** Shows "3 selected"
**Status:** [ ] PASS [ ] FAIL

### BULK-2: Select All
**Objective:** Verify select all functionality
**Steps:**
1. Click "Select All" button
2. Check all tasks selected
3. Click "Deselect All"
**Expected:** All tasks select/deselect
**Status:** [ ] PASS [ ] FAIL

### BULK-3: Bulk Status Update
**Objective:** Verify bulk status change
**Steps:**
1. Select 2 tasks
2. Click Status dropdown in toolbar
3. Select "Done"
**Expected:** Both tasks update to Done
**Status:** [ ] PASS [ ] FAIL

### BULK-4: Bulk Priority Update
**Objective:** Verify bulk priority change
**Steps:**
1. Select 2 tasks
2. Click Priority dropdown
3. Select "High"
**Expected:** Both tasks update to High priority
**Status:** [ ] PASS [ ] FAIL

### BULK-5: Bulk Delete
**Objective:** Verify bulk deletion
**Steps:**
1. Select test tasks
2. Click Delete button
3. Confirm deletion
**Expected:** Selected tasks deleted
**Status:** [ ] PASS [ ] FAIL

---

## 12. PHASE 6: PROJECT TEMPLATES

### TEMP-1: View Templates
**Objective:** Verify templates display
**Steps:**
1. Navigate to /templates
2. Check Organization Templates tab
3. Check templates display
**Expected:** 3 templates visible
**Status:** [ ] PASS [ ] FAIL

### TEMP-2: Use Template
**Objective:** Verify project creation from template
**Steps:**
1. Click "Use Template" on Software Development
2. Fill in project name "Test Project"
3. Fill in key "TEST"
4. Submit form
**Expected:** Project created with template tasks
**Status:** [ ] PASS [ ] FAIL

### TEMP-3: Create Template
**Objective:** Verify template creation
**Steps:**
1. Click "Create Template"
2. Fill in template details
3. Save template
**Expected:** New template appears in list
**Status:** [ ] PASS [ ] FAIL

### TEMP-4: Template Categories
**Objective:** Verify template categories
**Steps:**
1. Check Software Development (development)
2. Check Marketing Campaign (marketing)
3. Check Employee Onboarding (hr)
**Expected:** Categories display correctly
**Status:** [ ] PASS [ ] FAIL

---

## 13. PHASE 7: ROLE-BASED PERMISSIONS

### PERM-1: View Permissions Page
**Objective:** Verify permissions page access
**Steps:**
1. Navigate to /settings/permissions
2. Check page loads or shows access denied
**Expected:** Shows based on user permissions
**Status:** [ ] PASS [ ] FAIL

### PERM-2: View Roles
**Objective:** Verify roles display
**Steps:**
1. If accessible, check Roles tab
2. Verify 4 default roles exist
**Expected:** Admin, Manager, Member, Viewer roles visible
**Status:** [ ] PASS [ ] FAIL

### PERM-3: User Role Assignment
**Objective:** Verify role assignment (if admin)
**Steps:**
1. Click "Assign Role"
2. Select user and role
3. Confirm assignment
**Expected:** Role assigned to user
**Status:** [ ] PASS [ ] FAIL

---

## 14. NAVIGATION & UI

### NAV-1: Sidebar Navigation
**Objective:** Verify all navigation links
**Steps:**
1. Click Dashboard → loads /dashboard
2. Click Projects → loads /projects
3. Click Tasks → loads /tasks
4. Click Team → loads /team
5. Click Templates → loads /templates
6. Click Knowledge Base → loads /knowledge
7. Click Organization → loads /organization
8. Click Permissions → loads /settings/permissions
9. Click Reports → loads /reports
10. Click Settings → loads /settings
**Expected:** All pages load correctly
**Status:** [ ] PASS [ ] FAIL

### NAV-2: Responsive Design
**Objective:** Verify responsive layout
**Steps:**
1. Resize browser window
2. Check mobile view
3. Check tablet view
**Expected:** Layout adapts appropriately
**Status:** [ ] PASS [ ] FAIL

---

## 15. REPORTS & ANALYTICS

### REP-1: View Reports
**Objective:** Verify reports page
**Steps:**
1. Navigate to /reports
2. Check statistics display
3. Check charts load
**Expected:** Reports and analytics display
**Status:** [ ] PASS [ ] FAIL

### REP-2: Project Statistics
**Objective:** Verify project stats
**Steps:**
1. Check total projects count
2. Check active projects
3. Check completed projects
**Expected:** Statistics accurate
**Status:** [ ] PASS [ ] FAIL

---

## TEST EXECUTION SUMMARY

Total Test Cases: 65
- [ ] Passed: 0
- [ ] Failed: 0
- [ ] Blocked: 0
- [ ] Not Tested: 65

## CRITICAL ISSUES FOUND

1. 
2. 
3. 

## RECOMMENDATIONS

1. 
2. 
3. 

---

## Test Execution Log

| Test ID | Status | Notes | Timestamp |
|---------|--------|-------|-----------|
| | | | |