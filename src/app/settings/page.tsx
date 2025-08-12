import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { organizations, users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SettingsForm } from '@/components/settings/settings-form';

async function SettingsContent() {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return <div>No organization found</div>;
  }

  // Get organization details
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.id, session.user.organizationId),
  });

  // Get user count
  const userCount = await db.query.users.findMany({
    where: eq(users.organizationId, session.user.organizationId),
  });

  if (!organization) {
    return <div>Organization not found</div>;
  }

  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };

  return (
    <SettingsForm 
      user={userData}
      organization={organization}
      userCount={userCount.length}
    />
  );
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
    </DashboardLayout>
  );
}