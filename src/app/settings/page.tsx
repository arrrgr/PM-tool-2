import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { organizations, users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Building, Users, Settings as SettingsIcon, Crown } from 'lucide-react';

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

  const isAdmin = session.user.role === 'admin';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and organization preferences.
        </p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Profile</span>
          </CardTitle>
          <CardDescription>
            Your personal account settings and information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant={isAdmin ? 'default' : 'secondary'}>
                {isAdmin ? (
                  <>
                    <Crown className="mr-1 h-3 w-3" />
                    Admin
                  </>
                ) : (
                  'Member'
                )}
              </Badge>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={session.user.name || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session.user.email || ''} disabled />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button disabled>Update Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Organization</span>
          </CardTitle>
          <CardDescription>
            Manage your organization settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input 
                id="orgName" 
                value={organization.name} 
                disabled={!isAdmin}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="orgSlug">Organization Slug</Label>
              <Input 
                id="orgSlug" 
                value={organization.slug} 
                disabled={!isAdmin}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="orgDescription">Description</Label>
            <Input 
              id="orgDescription" 
              value={organization.description || ''} 
              disabled={!isAdmin}
              placeholder="Describe your organization"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{userCount.length} team members</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline">{organization.subscriptionTier || 'Free'}</Badge>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex justify-end">
              <Button disabled>Update Organization</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Project Defaults</CardTitle>
          <CardDescription>
            Default settings for new projects in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Default Task Statuses</Label>
            <div className="flex flex-wrap gap-2">
              {(organization.settings as any)?.defaultTaskStatuses?.map((status: string) => (
                <Badge key={status} variant="outline">
                  {status}
                </Badge>
              )) || ['To Do', 'In Progress', 'In Review', 'Done'].map((status) => (
                <Badge key={status} variant="outline">
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Default Priorities</Label>
            <div className="flex flex-wrap gap-2">
              {(organization.settings as any)?.defaultPriorities?.map((priority: string) => (
                <Badge key={priority} variant="outline">
                  {priority}
                </Badge>
              )) || ['Low', 'Medium', 'High'].map((priority) => (
                <Badge key={priority} variant="outline">
                  {priority}
                </Badge>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <Button disabled>Update Defaults</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Some settings require administrator privileges to modify.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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