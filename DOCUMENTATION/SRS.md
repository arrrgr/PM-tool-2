# **Task Tracker / Project Manager – Software Requirements Specification (SRS)**

**Version:** 1.0  
**Date:** 07 Aug 2025  
**Status:** Draft / POC

---

## **1  Purpose**

This document defines all functional and non‑functional requirements—including detailed user stories—for a proof‑of‑concept (POC) web application that provides lightweight project and task management with nested work items, user/organisation administration, Slack notifications, and GitHub integration. The SRS will be used by Cursor (AI coding agent) to scaffold the initial codebase and by stakeholders to validate scope.

## **2  Scope**

* Allow teams to organise work in **Projects → Epics → Tasks → Sub‑tasks**.  
* Provide dashboards, Kanban board, basic reporting, and personal views.  
* Support single‑organisation multi‑user model (owner, admin, member, guest).  
* Out‑of‑scope for POC: billing, mobile app, real‑time multi‑cursor editing.

## **3  Definitions & Abbreviations**

| Term | Meaning |
| ----- | ----- |
| **POC** | Proof of Concept release |
| **Epic** | Large body of work that can be broken down into Tasks |
| **tRPC** | Type‑safe RPC framework for TS/Node |
| **Drizzle ORM** | SQL‑first Typescript ORM used with PostgreSQL |
| **Zustand** | Lightweight React state‑management library |

## **4  Overall Description**

### **4.1  User Roles**

| Role | Permissions |
| :---- | :---- |
| **Org Owner** | Full access incl. Slack/GitHub integration settings & role management |
| **Admin** | CRUD on all Projects/Epics/Tasks; manage invites |
| **Member** | CRUD on Tasks they own; create projects; view dashboards |
| **Guest** | Read‑only access to selected projects |

### **4.2  Product Perspective**

| Layer | Tech |
| :---- | :---- |
| Front‑end | Next.js 14 \+ React 19, Tailwind CSS, **Zustand** |
| API | **tRPC v10** (Express adapter) |
| DB | **PostgreSQL 15** with **Drizzle ORM** migrations |
| Auth | NextAuth (credentials provider) \+ optional TOTP MFA |
| Integrations | Slack Web API, GitHub App (REST \+ webhook) |

## **5  Functional Requirements (FR)**

### **5.1  Account & Organisation**

* **FR‑A1** Sign‑up / Sign‑in with email & password.  
* **FR‑A2** Create organisation; creator becomes Owner.  
* **FR‑A3** Invite / revoke users via email; role assignment.  
* **FR‑A4** Switch between orgs without logout.

### **5.2  Project Hierarchy**

* **FR‑B1** Create Project inside an org (name, key).  
* **FR‑B2** Nested items: Project → Epic → Task → Sub‑task (max depth 4).  
* **FR‑B3** Clone project template.  
* **FR‑B4** Archive / unarchive project.

### **5.3  Task Management**

* **FR‑C1** Create/read/update/delete Task fields (title, description, status, priority, assignee, due date).  
* **FR‑C2** Drag‑and‑drop Tasks across statuses on Kanban board.  
* **FR‑C3** Bulk‑edit tasks.  
* **FR‑C4** Time tracking per task & roll‑up.  
* **FR‑C5** File attachments (S3 presigned URLs).  
* **FR‑C6** Rich‑text comments with @mentions.

### **5.4  Dashboard & Reporting**

* **FR‑D1** Personal dashboard of assigned/open tasks.  
* **FR‑D2** Project dashboard with status pie & burndown.

### **5.5  Notifications & Slack**

* **FR‑E1** Connect Slack workspace via OAuth; save token encrypted.  
* **FR‑E2** Post messages on task‑created / status‑changed / @mention events.  
* **FR‑E3** User‑level notification preferences (email vs Slack).

### **5.6  GitHub Integration**

* **FR‑F1** Install GitHub App with repo selection.  
* **FR‑F2** Link Task to GitHub Issue; two‑way status sync.  
* **FR‑F3** Show commits referencing TASK‑KEY in activity feed.  
* **FR‑F4** PR that closes a linked Task triggers status change to “In Review”.  
* **FR‑F5** Create branch from Task UI.

### **5.7  Search & Views**

* **FR‑G1** Full‑text search across tasks.  
* **FR‑G2** Preset & custom filters; save views.

### **5.8  Security & Permissions**

* **FR‑H1** Argon2id password hashing; OWASP ASVS L1.  
* **FR‑H2** TOTP MFA optional.  
* **FR‑H3** Session expiry after 14 days inactivity.

### 5.9 **Feature Description — “AI-Augmented Knowledge Base”**

### **Goal**

### Provide a built-in knowledge-base (KB) where teams can:

1. ### **Manually curate** articles, snippets, and architectural docs (rich-text \+ attachments). 

2. ### **Auto-update** docs on every GitHub *merge request (MR)* by invoking **OpenAI o4-mini**: 

   * ### The CI webhook sends the MR diff \+ description and the linked Task/Epic details. 

   * ### The LLM extracts “what changed” (new modules, deleted functions, env-var additions, etc.). 

   * ### It drafts or amends KB pages (e.g., /docs/api/payment.md) using a structured prompt:      **📚 Feature Description — “AI-Augmented Knowledge Base”**

### **Goal**

### Provide a built-in knowledge-base (KB) where teams can:

1. ### **Manually curate** articles, snippets, and architectural docs (rich-text \+ attachments). 

2. ### **Auto-update** docs on every GitHub *merge request (MR)* by invoking **OpenAI o4-mini**: 

   * ### The CI webhook sends the MR diff \+ description and the linked Task/Epic details. 

   * ### The LLM extracts “what changed” (new modules, deleted functions, env-var additions, etc.). 

   * ### It drafts or amends KB pages (e.g., /docs/api/payment.md) using a structured prompt: 

````
<<SYSTEM>>
You are DocsForge, an expert technical writer who keeps developer documentation
concise, accurate, and actionable.  Your job is to update our internal knowledge
base (KB) after every GitHub merge request (MR).

### house-style
* Write in clear, active voice. One sentence ≤ 25 words.
* Use Markdown fenced code blocks for code; no syntax highlighting tags.
* Wrap long lines at 100 chars (hard wrap).
* Anchor links with reference-style footnotes at document end.

### update-policy
* NEVER touch files outside the “/docs” namespace.
* If you can’t confidently update a section, create a **TODO** note instead.
* For red/green diff output, prefix added lines with “+ ” and removed with “- ”.

### security-policy
* Mask any secrets (keys, passwords) with “••••”.
* If diff chunk > 500 lines, summarise instead of pasting verbatim.

###
END OF SYSTEM BLOCK
<<USER>>
You will receive:
1.  `MR_JSON`  – GitHub payload with title, body, diff, files_changed[] (truncated to 5k lines)
2.  `TASK_JSON` – Linked task/epic info from our tracker
3.  `KB_SNAP`   – Current Markdown of affected KB pages (max 8 pages, 30k tokens total)

**Steps**

1️⃣  **Analyse change scope**

* Derive high-level purpose (bug-fix, feature, refactor, config change).
* Extract public interfaces added/removed (functions, env vars, CLI flags, API routes).
* Identify files that map to existing KB pages (path heuristics).

2️⃣  **Generate revision plan**

For each affected KB page decide: *modify*, *append-section*, *no-change*, or *create-new-page*.

3️⃣  **Produce content**

For each planned revision:
* Keep headings level ≤ H3.
* Add a *Changelog* bullet at bottom: “2025-08-07 – auto-update from MR #123 by DocsForge”.

4️⃣  **Summarise**

Write 1-paragraph MR comment titled **“DocsForge bot”**:
* List pages updated/created.
* Provide link placeholders that our CI layer will swap (`{{url}}`).

**Important – Output must be JSON**  
Use the exact schema below.  
Return **nothing else** outside the JSON.

```jsonc
{
  "revision_plan": [
    {
      "page_path": "docs/api/payment.md",
      "action": "modify",
      "new_markdown": "..."
    },
    {
      "page_path": "docs/config/env_vars.md",
      "action": "append-section",
      "new_markdown": "..."
    }
  ],
  "mr_comment": "### DocsForge bot\\n• Updated: [payment.md]({{url}})\\n• Added section to env_vars.md\\n"
}

````

###  

* ### Proposed edits are saved as a *pending KB revision* that an Admin can accept/reject. 

### **Actor flow**

```
sequenceDiagram
  participant Dev as Developer
  participant GitHub
  participant CI
  participant LLM
  participant KB as Knowledge Base

  Dev->>GitHub: Open MR & link TASK-123
  GitHub->>CI: webhook /PR merged
  CI->>KB: fetch TASK-123 details via tRPC
  CI->>LLM: prompt(diff + taskSummary)
  LLM-->>CI: markdown patch(es)
  CI->>KB: create Draft Revision
  Admin->>KB: review & publish
```

### ---

### Add the table above to **Epic K** in your SRS when you’re ready, and Cursor can scaffold:

1. ### kb schema & tRPC routers 

2. ### CI script (.github/workflows/kb-autodoc.yml) that calls the mutation post-merge 

3. ### React diff-review page with Zustand state 

### Let me know if you’d like those snippets next\!

* ### 

## **6  Non‑Functional Requirements (NFR)**

| ID | Requirement |
| :---- | :---- |
| **NFR‑SEC1** | Store all secrets encrypted at rest; env vars only. |
| **NFR‑PERF1** | Kanban dashboard loads \< 2 s on 4G (P95). |
| **NFR‑PERF2** | All tRPC queries P95 \< 200 ms under 50 concurrent users. |
| **NFR‑REL1** | Daily DB backups retained 30 days. |
| **NFR‑UX1** | Optimistic UI for drag‑and‑drop; rollback on error. |

## **7  External Interface Requirements**

* **Slack API** – `chat.postMessage`, OAuth 2.0.  
* **GitHub App** – REST \+ Webhook (issues, pulls, pushes).

## **8  Assumptions & Dependencies**

* Users access via modern evergreen browsers.  
* Outbound internet allowed for Slack/GitHub calls.  
* POC will be deployed on Railway/Render with Docker.

## **9  Acceptance Criteria (POC)**

1. User can register → create org → invite teammate who accepts.  
2. Owner adds project, creates epic, task, sub‑task; hierarchy visible.  
3. Drag task to “Done” updates status and posts Slack message (if connected).  
4. Link GitHub issue; closing PR moves task to “In Review”.  
5. Dashboard and personal views load under 2 s.

## **10  Detailed User Stories**

### **🗂️ Epic A — Account & Organisation Management**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **A‑01** | As a visitor I want to sign up with email \+ password so I can access the app. | Form validates, Argon2‑hashed password stored, redirect to onboarding page. |
| **A‑02** | As a signed‑in user I want to create an Organisation so I can group projects under one workspace. | Org name unique; creator becomes Owner. |
| **A‑03** | As an Org Owner I want to invite teammates by email so they can join my Org. | Email token expires after 7 days; accept‑invite page. |
| **A‑04** | As an Org Owner I want to revoke an invitation before it’s accepted. | Revoked token invalid; status shows “revoked”. |
| **A‑05** | As an Org Owner I want to assign Member/Admin roles. | RBAC enforced; change logged. |
| **A‑06** | As any user I want to switch between Orgs without re‑authing. | Org switcher persists selection. |

### **🏗️ Epic B — Project Structure & Hierarchy**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **B‑01** | As a Member I want to create a Project so work items are separated. | Requires name; optional key (e.g., “CRM”). |
| **B‑02** | As a Member I want Projects to contain Epics, Tasks, Sub‑tasks so I can nest work. | DB supports 4‑level depth; breadcrumb reflects hierarchy. |
| **B‑03** | As a Member I want to clone a Project skeleton. | Clone copies items minus status/assignees. |
| **B‑04** | As an Admin I want to archive a Project. | Archived projects hidden from active lists; read‑only. |

### **✅ Epic C — Task & Sub‑task Management**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **C‑01** | As a Member I want to create a Task with title, description, status, priority, assignee, due date. | Mandatory title; default status “To Do”. |
| **C‑02** | As a Member I want to break a Task into Sub‑tasks. | Progress bar shows % complete. |
| **C‑03** | As a Member I want to drag‑and‑drop Tasks between columns. | DnD updates status instantly. |
| **C‑04** | As a Member I want to bulk‑edit multiple Tasks. | Single batch mutation. |
| **C‑05** | As an Assignee I want to log time on a Task. | Total time rolls up. |
| **C‑06** | As a Member I want to attach files to a Task. | Upload to S3; previews. |
| **C‑07** | As a Member I want comments with @mentions. | Mention sends Slack DM if enabled. |

### **📊 Epic D — Dashboard & Reporting**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **D‑01** | As a user I want a personal dashboard showing my open Tasks. | Grouped by due‑soon, overdue. |
| **D‑02** | As an Admin I want a Project dashboard with status pies. | Uses Recharts; loads \< 2 s. |
| **D‑03** | As an Org Owner I want a global burndown chart. | Auto‑refresh every 60 s. |

### **🔔 Epic E — Notifications & Slack**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **E‑01** | As an Org Owner I want to connect Slack. | OAuth; test ping ok. |
| **E‑02** | As a Member I want to choose which events notify me. | Pref toggles for email/Slack. |
| **E‑03** | As a Member I want @mentions to DM me on Slack. | Message includes task link. |

### **🛠️ Epic F — GitHub Integration**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **F‑01** | As an Org Owner I want to install the app on GitHub. | Select repos during install. |
| **F‑02** | As a Member I want to link a Task to a GitHub Issue. | Webhook updates Task status \< 30 s. |
| **F‑03** | As a Dev I want commits referencing TASK‑123 to appear in Task feed. | Show SHA \+ diff link. |
| **F‑04** | As a Dev I want a PR that closes a linked Task to move Task to “In Review”. | Keyword detection. |
| **F‑05** | As a PM I want to create a GitHub branch from a Task. | Branch name `task/TASK‑123‑slug`. |

### **🔍 Epic G — Search, Filters & Views**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **G‑01** | As a Member I want to search Tasks by keyword. | Full‑text index. |
| **G‑02** | As a Member I want preset filters. | URL params persist. |
| **G‑03** | As a Member I want to save a custom view. | Listed in sidebar. |

### **🔐 Epic H — Security & Permissions**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **H‑01** | As an Admin I want TOTP MFA. | 6‑digit code on login. |
| **H‑02** | As an Org Owner I want Guests to be read‑only. | Middleware denies write ops. |
| **H‑03** | As any user I want session timeout after 14 days. | Refresh‑token rotation. |

### **🚀 Epic I — Performance & Reliability**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **I‑01** | As a user I want the dashboard to load under 2 s on 3G. | Lighthouse P95 \< 2 s. |
| **I‑02** | As an Admin I want optimistic UI updates. | Rollback on error. |
| **I‑03** | As an Org Owner I want daily DB backups. | Restore script documented. |

### **🧰 Epic J — Developer & Ops Tooling**

| ID | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| **J‑01** | As a Dev I want Docker‑compose to spin up Postgres \+ app locally. | `docker compose up` works. |
| **J‑02** | As a Dev I want CI to run tests & lint on every PR. | GitHub Actions workflow green. |
| **J‑03** | As a Dev I want seeded dummy data. | `pnpm seed` inserts demo content.  |

### **🗂️ User Stories – Epic “K: Knowledge Base & Auto-Docs”**

| ID | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **K-01** | *As a Member I want to create, edit, and version KB pages manually so we have a central source of truth.* | Rich-text editor supports markdown, embeds, and file upload; version history retained. |
| **K-02** | *As an Admin I want the system to analyse every merged MR and suggest KB updates automatically, so docs stay up-to-date with minimal effort.* | On MR merge, a Draft Revision appears within 60 s containing AI-generated changes referencing touched files. |
| **K-03** | *As an Admin I want to approve or reject each AI-generated KB revision before it goes live, to prevent incorrect docs.* | “Approve” publishes revision; “Reject” discards and logs decision. |
| **K-04** | *As a Dev I want a comment posted back to the MR showing which KB pages were updated, so I can review the doc impact quickly.* | CI bot comment lists links to Draft Revisions. |
| **K-05** | *As a Member I want full-text search across KB articles and revisions, so I can find answers fast.* | Search returns results ranked by relevance; highlights diff between current & previous versions. |
| **K-06** | *As an Org Owner I want to see analytics on KB coverage (pages per project, stale pages), so we can track documentation health.* | Dashboard widget shows % pages touched in last 30 days and list of pages \> 90 days old. |

---

## **11  Out‑of‑Scope (for POC)**

* Paid plans, billing, usage quotas.  
* Mobile (native) apps.  
* Real‑time presence / cursor sync.

## **12  Revision History**

| Version | Date | Author | Notes |
| :------ | :--- | :----- | :---- |
| 1.0 | 07 Aug 2025 | Original | Initial draft/POC specification |
| 1.1 | 11 Aug 2025 | Development Team | Phase 1 Implementation Complete |

## **13  Implementation Status**

### **Phase 1 - Core Task Management (Completed 11 Aug 2025)**

#### **Completed Features:**
- ✅ **FR-A1**: Sign-up/Sign-in with email & password
- ✅ **FR-A2**: Create organization
- ✅ **FR-B1**: Create Project with name & key
- ✅ **FR-C1**: Full CRUD operations on Tasks
  - Create tasks with all fields
  - Edit tasks via modal dialog
  - Delete/Archive tasks with confirmation
  - Update status, priority, assignee, due dates
- ✅ **FR-C2**: Full Kanban board functionality
  - Drag-and-drop between columns
  - Double-click to edit tasks
  - Visual hints on hover
  - Create Task button integrated
  - Full filtering capabilities
  - Default sort by due date
- ✅ **FR-C6**: Comments on tasks with @mentions functionality
  - Real-time autocomplete for team member mentions
  - Visual highlighting of mentions
  - Comment counts displayed on task cards
- ✅ **FR-D1**: Personalized dashboard
  - Shows only user's assigned tasks
  - Overdue tasks section with warnings
  - Due Soon section (next 3 days)
  - Personal task statistics
  - Quick action links to main areas
- ✅ **FR-G1**: Task search functionality
- ✅ **FR-G2**: Task filtering (project, assignee, status, priority, type)

#### **Technical Implementations:**
- Edit Task Dialog with tabbed interface (Details/Comments)
- Task Comments with @mentions autocomplete
- TaskCommentsWithMentions component for enhanced collaboration
- KanbanWithFilters component for filtered board view
- Alert dialogs for destructive actions
- Optimistic UI updates with window.location.reload() for task creation
- Real-time task filtering across all views
- Double-click to edit on Kanban cards with visual hints
- Comment counts via SQL subqueries for performance
- Personalized dashboard with user-specific metrics

### **Phase 2 - Next Sprint (Priority Order)**
1. **Epic B**: Project hierarchy (Epics/Tasks/Subtasks)
   - Create Epic as parent container for multiple tasks
   - Support sub-tasks under main tasks
   - Visual hierarchy in Kanban and List views
   - Breadcrumb navigation

2. **Epic A-03 to A-05**: Team Management
   - Email invitations for team members
   - Role-based access control (Owner/Admin/Member)
   - Team member management UI

3. **FR-C4**: Time Tracking
   - Start/stop timer on tasks
   - Manual time entry
   - Time logs and reports

4. **FR-C5**: File Attachments
   - Upload files to tasks and comments
   - S3 integration for storage
   - Preview for images/documents

### **User Backlog (Features Requested During Development)**

These features were identified during Phase 1 development based on user feedback:

#### **High Priority**
- ✅ **Make tasks editable from Kanban view** - COMPLETED (double-click to edit)
- ✅ **Add Task Filters to Kanban Board** - COMPLETED (same filters as Tasks page)
- ✅ **Default sort tasks by due date** - COMPLETED (automatic sorting)
- ✅ **Show comment counts on task cards** - COMPLETED (displays actual count)
- ✅ **Implement @mentions in comments** - COMPLETED (with autocomplete)
- ✅ **Personalized dashboard** - COMPLETED (user-specific view)

#### **Medium Priority (Phase 2)**
- Bulk task operations (select multiple tasks)
- Task templates for common workflows
- Custom fields for tasks
- Recurring tasks
- Task dependencies visualization
- Quick add task from any page (global shortcut)
- Export tasks to CSV/Excel
- Print-friendly task views

#### **Low Priority (Future)**
- Dark mode theme
- Keyboard shortcuts for power users
- Mobile app (iOS/Android)
- Email notifications digest
- Calendar view integration
- Timezone handling for global teams
- Custom task statuses per project
- Archived tasks recovery

### **Phase 3 - Q1 2026 (Planned)**
1. **Epic E**: Slack Integration
   - OAuth connection flow
   - Notifications for task updates
   - Create tasks from Slack
   - Status updates in channels

2. **Epic F**: GitHub Integration
   - Link issues to tasks
   - Auto-status updates from PRs
   - Branch creation from tasks
   - Commit linking

3. **Epic K**: AI Knowledge Base
   - Auto-documentation from code changes
   - AI-powered search
   - Documentation suggestions
   - Knowledge graph visualization

4. **Advanced Features**
   - FR-H1: TOTP MFA for security
   - Gantt chart view
   - Sprint planning tools
   - Resource allocation
   - Budget tracking
   - Custom workflows
   - Advanced analytics and reporting
   - API for third-party integrations

