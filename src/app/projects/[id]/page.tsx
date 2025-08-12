import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { projects, tasks, users, comments } from '@/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProjectHeader } from '@/components/projects/project-header';
import { KanbanWithFilters } from '@/components/kanban/kanban-with-filters';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

async function ProjectContent({ projectId }: { projectId: string }) {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return <div>No organization found</div>;
  }

  // Get project details
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.organizationId, session.user.organizationId)
    ),
    with: {
      leader: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Get tasks for this project with assignee information and comment counts
  const projectTasks = await db
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
      assignee: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
      commentCount: sql<number>`(SELECT COUNT(*) FROM pmtool_comment WHERE task_id = ${tasks.id})::int`,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(
      and(
        eq(tasks.projectId, projectId),
        eq(tasks.isArchived, false)
      )
    )
    .orderBy(tasks.dueDate);

  // Get team members for the organization
  const teamMembers = await db.query.users.findMany({
    where: eq(users.organizationId, session.user.organizationId),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  const statuses = project.settings?.taskStatuses || ['To Do', 'In Progress', 'In Review', 'Done'];

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />
      <KanbanWithFilters 
        tasks={projectTasks} 
        statuses={statuses}
        projectId={projectId}
        teamMembers={teamMembers}
        project={project}
      />
    </div>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading project...</div>}>
        <ProjectContent projectId={id} />
      </Suspense>
    </DashboardLayout>
  );
}