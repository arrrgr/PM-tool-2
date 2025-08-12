import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { projectTemplates } from '@/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TemplatesGrid } from '@/components/templates/templates-grid';

async function TemplatesContent() {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return <div>No organization found</div>;
  }

  // Get templates (both organization and public)
  const templates = await db
    .select()
    .from(projectTemplates)
    .where(
      or(
        eq(projectTemplates.organizationId, session.user.organizationId),
        eq(projectTemplates.isPublic, true)
      )
    )
    .orderBy(projectTemplates.createdAt);

  const organizationTemplates = templates.filter(t => t.organizationId === session.user.organizationId);
  const publicTemplates = templates.filter(t => t.isPublic);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Project Templates</h2>
        <p className="text-muted-foreground">
          Use templates to quickly create new projects with predefined structure and tasks.
        </p>
      </div>

      <TemplatesGrid
        organizationTemplates={organizationTemplates}
        publicTemplates={publicTemplates}
      />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading templates...</div>}>
        <TemplatesContent />
      </Suspense>
    </DashboardLayout>
  );
}