import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { projects, tasks, users } from '@/server/db/schema';
import { eq, and, count, or, gte, lte } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, AlertCircle, Calendar, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

async function DashboardStats() {
  const session = await auth();
  
  if (!session?.user?.organizationId || !session?.user?.id) {
    return <div>No organization found</div>;
  }

  const organizationId = session.user.organizationId;
  const userId = session.user.id;

  // Get user's assigned tasks
  const myTasks = await db
    .select({
      id: tasks.id,
      key: tasks.key,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      type: tasks.type,
      dueDate: tasks.dueDate,
      projectId: tasks.projectId,
      projectName: projects.name,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      and(
        eq(projects.organizationId, organizationId),
        eq(tasks.assigneeId, userId),
        eq(tasks.isArchived, false)
      )
    )
    .orderBy(tasks.dueDate);

  // Calculate stats for user's tasks
  const myTaskStats = {
    total: myTasks.length,
    todo: myTasks.filter(t => t.status === 'To Do').length,
    inProgress: myTasks.filter(t => t.status === 'In Progress').length,
    inReview: myTasks.filter(t => t.status === 'In Review').length,
    done: myTasks.filter(t => t.status === 'Done').length,
  };

  // Get overdue and due soon tasks
  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);
  
  const overdueTasks = myTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < today && task.status !== 'Done'
  );
  
  const dueSoonTasks = myTasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) >= today && 
    new Date(task.dueDate) <= threeDaysFromNow &&
    task.status !== 'Done'
  );

  // Get recently updated tasks for the user
  const recentlyUpdated = myTasks
    .filter(t => t.status !== 'Done')
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  // Get team members count
  const teamMembersCount = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.organizationId, organizationId));

  const stats = [
    {
      title: 'My Open Tasks',
      value: myTaskStats.total - myTaskStats.done,
      description: `${myTaskStats.inProgress} in progress, ${myTaskStats.todo} to do`,
      icon: CheckSquare,
      color: 'text-blue-600',
      href: `/tasks?assignee=${userId}&status=open`,
    },
    {
      title: 'Overdue',
      value: overdueTasks.length,
      description: overdueTasks.length > 0 ? 'Needs immediate attention' : 'All tasks on track',
      icon: AlertCircle,
      color: overdueTasks.length > 0 ? 'text-red-600' : 'text-green-600',
      href: `/tasks?assignee=${userId}&overdue=true`,
    },
    {
      title: 'Due Soon',
      value: dueSoonTasks.length,
      description: 'Next 3 days',
      icon: Calendar,
      color: 'text-yellow-600',
      href: `/tasks?assignee=${userId}&dueSoon=true`,
    },
    {
      title: 'Completed This Week',
      value: myTaskStats.done,
      description: 'Great progress!',
      icon: TrendingUp,
      color: 'text-green-600',
      href: `/tasks?assignee=${userId}&status=Done&completedThisWeek=true`,
    },
  ];

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'info';
      case 'In Review': return 'warning';
      default: return 'secondary';
    }
  };

  const TaskSection = ({ title, tasks: sectionTasks, emptyMessage }: { 
    title: string; 
    tasks: typeof myTasks; 
    emptyMessage: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sectionTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {emptyMessage}
            </p>
          ) : (
            sectionTasks.map((task) => (
              <Link
                key={task.id}
                href={`/projects/${task.projectId}`}
                className="block hover:bg-accent rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {task.key}
                      </span>
                      <span className="font-medium text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {task.projectName}
                      </span>
                      {task.dueDate && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            Due {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority || 'Medium'}
                    </Badge>
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status || 'To Do'}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name || session.user.email}! Here's your personal overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Task Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <TaskSection 
            title="⚠️ Overdue Tasks" 
            tasks={overdueTasks} 
            emptyMessage="No overdue tasks"
          />
        )}

        {/* Due Soon */}
        <TaskSection 
          title="📅 Due Soon (Next 3 Days)" 
          tasks={dueSoonTasks} 
          emptyMessage="No tasks due soon"
        />

        {/* In Progress */}
        <TaskSection 
          title="🚀 In Progress" 
          tasks={myTasks.filter(t => t.status === 'In Progress')} 
          emptyMessage="No tasks in progress"
        />

        {/* Recently Assigned */}
        <TaskSection 
          title="📝 My To Do List" 
          tasks={myTasks.filter(t => t.status === 'To Do').slice(0, 5)} 
          emptyMessage="No tasks in your to-do list"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Link href="/tasks">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent p-2">
                View All Tasks
              </Badge>
            </Link>
            <Link href="/projects">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent p-2">
                Browse Projects
              </Badge>
            </Link>
            <Link href="/team">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent p-2">
                Team Directory
              </Badge>
            </Link>
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