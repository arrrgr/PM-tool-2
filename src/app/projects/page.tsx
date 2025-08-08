import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { projects, users } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProjectGrid } from '@/components/projects/project-grid';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

async function ProjectsContent() {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return <div>No organization found</div>;
  }

  const organizationId = session.user.organizationId;

  const projectList = await db
    .select({
      id: projects.id,
      name: projects.name,
      key: projects.key,
      description: projects.description,
      status: projects.status,
      priority: projects.priority,
      startDate: projects.startDate,
      endDate: projects.endDate,
      createdAt: projects.createdAt,
      leaderName: users.name,
      leaderEmail: users.email,
    })
    .from(projects)
    .leftJoin(users, eq(projects.leaderId, users.id))
    .where(
      and(
        eq(projects.organizationId, organizationId),
        eq(projects.isArchived, false)
      )
    )
    .orderBy(projects.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage your organization's projects and track their progress.
          </p>
        </div>
        <CreateProjectDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </CreateProjectDialog>
      </div>

      <ProjectGrid projects={projectList} />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsContent />
      </Suspense>
    </DashboardLayout>
  );
}