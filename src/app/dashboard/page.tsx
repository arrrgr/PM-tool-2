import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { projects, tasks } from '@/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CheckSquare, FolderOpen, Clock, Users } from 'lucide-react';

async function DashboardStats() {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return <div>No organization found</div>;
  }

  const organizationId = session.user.organizationId;

  // Get projects count
  const projectsCount = await db
    .select({ count: count() })
    .from(projects)
    .where(
      and(
        eq(projects.organizationId, organizationId),
        eq(projects.isArchived, false)
      )
    );

  // Get tasks stats
  const allTasks = await db
    .select({ status: tasks.status })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      and(
        eq(projects.organizationId, organizationId),
        eq(tasks.isArchived, false)
      )
    );

  const taskStats = {
    total: allTasks.length,
    todo: allTasks.filter(t => t.status === 'To Do').length,
    inProgress: allTasks.filter(t => t.status === 'In Progress').length,
    done: allTasks.filter(t => t.status === 'Done').length,
  };

  // Get recent tasks
  const recentTasks = await db
    .select({
      id: tasks.id,
      key: tasks.key,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      projectName: projects.name,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      and(
        eq(projects.organizationId, organizationId),
        eq(tasks.isArchived, false)
      )
    )
    .orderBy(tasks.createdAt)
    .limit(5);

  const stats = [
    {
      title: 'Active Projects',
      value: projectsCount[0]?.count || 0,
      description: 'Currently active projects',
      icon: FolderOpen,
    },
    {
      title: 'Total Tasks',
      value: taskStats.total,
      description: `${taskStats.done} completed, ${taskStats.inProgress} in progress`,
      icon: CheckSquare,
    },
    {
      title: 'In Progress',
      value: taskStats.inProgress,
      description: 'Tasks currently being worked on',
      icon: Clock,
    },
    {
      title: 'Team Members',
      value: 4, // This should be dynamic based on organization users
      description: 'Active team members',
      icon: Users,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'text-green-600 bg-green-50';
      case 'In Progress': return 'text-blue-600 bg-blue-50';
      case 'In Review': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>
            Latest tasks created in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No tasks found. Create your first task to get started!
              </p>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        {task.key}
                      </span>
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.projectName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority || 'medium'
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        task.status || 'To Do'
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardStats />
      </Suspense>
    </DashboardLayout>
  );
}