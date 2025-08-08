import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { tasks, projects, users } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TasksList } from '@/components/tasks/tasks-list';
import { TasksFilters } from '@/components/tasks/tasks-filters';

async function TasksContent() {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return <div>No organization found</div>;
  }

  const organizationId = session.user.organizationId;

  // Get all tasks for the organization with project and assignee information
  const allTasks = await db
    .select({
      id: tasks.id,
      key: tasks.key,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      type: tasks.type,
      storyPoints: tasks.storyPoints,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      project: {
        id: projects.id,
        name: projects.name,
        key: projects.key,
      },
      assignee: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(
      and(
        eq(projects.organizationId, organizationId),
        eq(tasks.isArchived, false)
      )
    )
    .orderBy(tasks.updatedAt);

  // Get all projects for filtering
  const allProjects = await db.query.projects.findMany({
    where: and(
      eq(projects.organizationId, organizationId),
      eq(projects.isArchived, false)
    ),
    columns: {
      id: true,
      name: true,
      key: true,
    },
    orderBy: (projects, { asc }) => [asc(projects.name)],
  });

  // Get all team members for filtering
  const teamMembers = await db.query.users.findMany({
    where: eq(users.organizationId, organizationId),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    orderBy: (users, { asc }) => [asc(users.name)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">
          View and manage all tasks across your organization.
        </p>
      </div>

      <TasksFilters 
        projects={allProjects}
        teamMembers={teamMembers}
      />

      <TasksList 
        tasks={allTasks}
        projects={allProjects}
        teamMembers={teamMembers}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading tasks...</div>}>
        <TasksContent />
      </Suspense>
    </DashboardLayout>
  );
}