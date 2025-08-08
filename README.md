# PM Tool - Advanced Project Management Platform

A comprehensive project management tool with AI-powered features, built with Next.js, PostgreSQL, and modern web technologies. Deploy-ready for Railway with full production configuration.

## ✨ Features

### Phase 2 (Current - Production Ready)
- ✅ **Authentication & Authorization**: Secure user management with NextAuth
- ✅ **Organization Management**: Multi-tenant organization structure  
- ✅ **Project Management**: Full project lifecycle with creation, editing, archiving
- ✅ **Interactive Kanban Boards**: Drag-and-drop task management with real-time updates
- ✅ **Advanced Task Management**: Comprehensive task creation, assignment, priorities, types
- ✅ **Team Collaboration**: Team member management with role-based permissions
- ✅ **Smart Search & Filtering**: Multi-faceted filtering across projects, assignees, statuses
- ✅ **Professional Dashboard**: Real-time insights and project overview
- ✅ **Production Deployment**: Railway-ready with PostgreSQL and health monitoring

### Phase 3 (Planned)
- 🚀 **Real-time Comments**: Task discussions with live updates
- 🚀 **File Attachments**: S3-integrated document management
- 🚀 **AI Knowledge Base**: OpenAI-powered documentation and smart search
- 🚀 **Time Tracking**: Work logging and productivity analytics
- 🚀 **Activity Feeds**: Real-time notifications and mentions
- 🚀 **Advanced Reporting**: Custom dashboards and analytics
- 🚀 **Slack/GitHub Integration**: Third-party service connections

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js, Drizzle ORM
- **Database**: PostgreSQL with full relational schema
- **Drag & Drop**: @dnd-kit for smooth Kanban interactions
- **Authentication**: NextAuth with secure credential management
- **Deployment**: Railway-optimized with health checks and migrations
- **File Storage**: AWS S3 integration ready
- **AI Integration**: OpenAI API integration prepared

## 🚀 Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy)

**For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### One-Click Deployment Steps:
1. Click the Railway button above
2. Connect your GitHub account
3. Add required environment variables
4. Deploy with automatic PostgreSQL setup

## 🏃‍♂️ Local Development

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL (Docker recommended)
- Git

### Quick Start
```bash
# Clone and install
git clone https://github.com/arrrgr/PM-tool-2.git
cd PM-tool-2
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start database (Docker)
docker-compose up -d
# OR install PostgreSQL locally

# Run migrations and seed
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Test Accounts (Development)
- **Admin**: `alex@roonix.com` / `password123`
- **Admin**: `sarah@synthesis25.com` / `password123`  
- **Member**: `mike@roonix.com` / `password123`
- **Member**: `emma@synthesis25.com` / `password123`

## 📊 Database Schema

Comprehensive 13-table schema supporting:

- **Organizations**: Multi-tenant architecture
- **Users**: Authentication and role management
- **Projects**: Hierarchical project organization  
- **Tasks**: Full lifecycle with assignments, priorities, status tracking
- **Comments**: Task discussions and collaboration
- **Attachments**: File uploads and management
- **Work Logs**: Time tracking and productivity
- **Knowledge Base**: AI-powered documentation
- **Activity Logs**: Audit trail and user activity
- **Integrations**: Third-party service configurations

## 🎯 Key Features Showcase

### Interactive Kanban Boards
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   To Do     │ In Progress │  In Review  │    Done     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ 🎯 TASK-1   │ ⚡ TASK-2   │ 🐛 BUG-1    │ ✨ FEAT-1  │
│ Priority: H │ Priority: M │ Priority: H │ Priority: L │
│ @john       │ @jane       │ @mike       │ @sarah      │
│             │             │             │             │
│ 📝 TASK-3   │             │             │             │
│ Priority: M │             │             │             │
│ Unassigned  │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Smart Filtering System
- 🔍 **Global Search**: Across all task titles and descriptions
- 📂 **Project Filter**: Filter by specific projects  
- 👤 **Assignee Filter**: Show tasks by team member
- 📊 **Status Filter**: Filter by task status
- 🎯 **Priority Filter**: Filter by priority level
- 🏷️ **Type Filter**: Filter by task type (Bug, Feature, Task, etc.)

### Team Collaboration
- 👥 **Role Management**: Admin vs Member permissions
- 📋 **Task Assignment**: Assign tasks to team members
- 🏢 **Organization Scope**: Multi-tenant data isolation
- 📊 **Activity Tracking**: Monitor team productivity

## 📈 Performance & Production

### Built for Scale
- **Optimistic UI Updates**: Instant feedback for drag & drop
- **Efficient Database Queries**: Optimized joins and indexing
- **Server-Side Rendering**: Fast initial page loads
- **TypeScript**: Full type safety across the application
- **Error Boundaries**: Graceful error handling

### Production Features  
- **Health Monitoring**: `/api/health` endpoint for uptime checks
- **Environment Validation**: Robust env var validation with t3-env
- **Migration Scripts**: Automated database setup for production
- **Security**: CSRF protection, secure authentication, input validation

## 🛠️ Development Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production  
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks

# Database
pnpm db:generate  # Generate database schema
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Drizzle Studio
pnpm db:seed      # Seed with sample data

# Production
pnpm migrate      # Run migrations in production
pnpm setup:production # Set up production database
```

## 🔧 Environment Variables

### Required for Production:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.railway.app"
OPENAI_API_KEY="sk-..."
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="eu-west-2"
AWS_S3_BUCKET="your-bucket"
```

### Optional (Phase 3):
```bash
SLACK_CLIENT_ID="..."
SLACK_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes (auth, projects, tasks, team)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── projects/          # Project management pages
│   ├── tasks/             # Task management and filtering
│   ├── team/              # Team collaboration
│   └── settings/          # User and org settings
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui base components
│   ├── layout/            # Layout components (header, sidebar)
│   ├── kanban/            # Kanban board components
│   ├── projects/          # Project-specific components
│   └── tasks/             # Task-specific components
├── lib/                   # Utility functions and helpers
├── server/                # Server-side code
│   ├── auth.ts            # NextAuth configuration
│   └── db/                # Database schema and connection
└── env.js                 # Environment validation
```

## 🚀 Deployment Platforms

### Railway (Recommended)
- ✅ **PostgreSQL**: Managed database included
- ✅ **Auto-scaling**: Handle traffic spikes
- ✅ **GitHub Integration**: Deploy on push
- ✅ **Environment Management**: Secure env var handling
- ✅ **Monitoring**: Built-in metrics and logging

### Other Platforms
- **Vercel**: Frontend-optimized with Vercel Postgres
- **Render**: Full-stack deployment with PostgreSQL
- **Digital Ocean**: App Platform with managed databases
- **AWS**: ECS/Lambda with RDS PostgreSQL

## 🤝 Contributing

This is a private project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup
- **Issues**: Report bugs via GitHub Issues  
- **Health Check**: Visit `/api/health` on your deployed app
- **Logs**: Check Railway/Vercel logs for troubleshooting

---

## 🎉 What's Next?

The PM Tool is production-ready with Phase 2 complete! 

**Current Capabilities:**
- 📊 Professional project management with Kanban boards
- 👥 Team collaboration with role-based permissions  
- 🔍 Advanced search and filtering across all tasks
- 🎯 Comprehensive task management (types, priorities, assignments)
- 🏢 Multi-tenant organization architecture
- 🚀 Production deployment on Railway

**Phase 3 Coming Soon:**
- 💬 Real-time comments and discussions
- 📎 File attachments with S3 integration  
- 🤖 AI-powered knowledge base with OpenAI
- ⏱️ Time tracking and productivity analytics
- 🔔 Activity feeds and smart notifications
- 📈 Advanced reporting and custom dashboards

Ready to revolutionize project management! 🚀