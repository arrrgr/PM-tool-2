# PM Tool - Railway Deployment Guide

This guide will help you deploy the PM Tool to Railway with PostgreSQL database.

## 📋 Prerequisites

- ✅ GitHub repository: `https://github.com/arrrgr/PM-tool-2`
- ✅ Railway account connected to GitHub
- ✅ OpenAI API key
- ✅ AWS S3 credentials

## 🚀 Deployment Steps

### 1. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "**New Project**"
3. Select "**Deploy from GitHub repo**"
4. Choose `arrrgr/PM-tool-2`
5. Railway will automatically detect it's a Next.js app

### 2. Add PostgreSQL Database

1. In your Railway project dashboard
2. Click "**+ New**" 
3. Select "**Database**" → "**PostgreSQL**"
4. Railway will provision a PostgreSQL database
5. Copy the `DATABASE_URL` from the PostgreSQL service

### 3. Configure Environment Variables

In your **Next.js service** settings, add these environment variables:

#### Required Variables:
```bash
# Database (Copy from Railway PostgreSQL service)
DATABASE_URL=postgresql://postgres:password@host:port/database

# Authentication (Generate a secure random string)
NEXTAUTH_SECRET=your-super-secure-random-secret-here
NEXTAUTH_URL=https://your-app-name.railway.app

# OpenAI Integration
OPENAI_API_KEY=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

# AWS S3 File Storage
AWS_ACCESS_KEY_ID=AKIAWPXYWDFCJLK4T7P4
AWS_SECRET_ACCESS_KEY=iZau8qRQzGIe1wHFwnT/Nr8jzaT+JqfPba+60I13
AWS_REGION=eu-west-2
AWS_S3_BUCKET=pp-25-dev

# Placeholders (not needed yet)
SLACK_CLIENT_ID=placeholder
SLACK_CLIENT_SECRET=placeholder
GITHUB_CLIENT_ID=placeholder
GITHUB_CLIENT_SECRET=placeholder
```

#### 🔐 Generate NEXTAUTH_SECRET:
```bash
# Use this command to generate a secure secret:
openssl rand -base64 32
```

### 4. Set Up Database

After deployment, you need to run migrations:

1. Go to your Railway project
2. Open the **Next.js service**
3. Go to "**Settings**" → "**Environment**"
4. Add a one-time deployment variable:
   ```bash
   RUN_MIGRATIONS=true
   ```
5. **Redeploy** the service
6. **Remove** the `RUN_MIGRATIONS` variable after successful deployment

### 5. Initial Setup

1. Visit your deployed app: `https://your-app-name.railway.app`
2. Click "**Sign Up**" to create the first admin account
3. Create your organization (e.g., "My Company")
4. Start creating projects and tasks!

## 🔧 Post-Deployment

### Health Check
- Visit: `https://your-app-name.railway.app/api/health`
- Should return: `{"status":"healthy","timestamp":"...","database":"connected"}`

### Test Accounts
After deployment, create your own accounts. The development seed data is not included in production.

### Domain Setup (Optional)
1. Go to Railway project → Next.js service → "**Settings**"
2. Add your custom domain
3. Update `NEXTAUTH_URL` to your custom domain

## 📊 Monitoring

### Railway Metrics
- Monitor CPU, Memory, and Network usage in Railway dashboard
- Check application logs for any errors
- Set up alerts for service health

### Database Monitoring
- Monitor PostgreSQL metrics in Railway
- Check connection counts and query performance

## 🛠️ Troubleshooting

### Common Issues:

#### 1. **Build Failures**
- Check if all dependencies are installed
- Verify Node.js version compatibility
- Check Railway build logs

#### 2. **Database Connection Issues**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL service is running
- Check network connectivity between services

#### 3. **Environment Variables**
- Verify all required variables are set
- Check for typos in variable names
- Ensure no trailing spaces in values

#### 4. **Authentication Issues**
- Generate a new `NEXTAUTH_SECRET`
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check callback URLs in authentication settings

### Getting Help:

1. **Railway Logs**: Check service logs in Railway dashboard
2. **Health Endpoint**: Visit `/api/health` for system status
3. **GitHub Issues**: Report issues at the repository

## 📈 Scaling

### Performance Optimization:
- Enable Railway's **Auto-scaling**
- Monitor response times and error rates
- Consider upgrading to Railway Pro for better performance

### Database Scaling:
- Monitor PostgreSQL performance metrics
- Consider connection pooling for high traffic
- Upgrade database plan if needed

---

## 🎉 Success!

Your PM Tool should now be live and accessible! 

**Next Steps:**
- Create your first project
- Invite team members
- Start managing tasks with the Kanban board
- Explore all the features you've built

**Features Available:**
- ✅ User authentication and organizations
- ✅ Project management with Kanban boards
- ✅ Task creation and assignment
- ✅ Team collaboration
- ✅ Advanced filtering and search
- ✅ Drag-and-drop task management
- ✅ Role-based permissions

Ready for **Phase 3** features like real-time comments and AI integration! 🚀