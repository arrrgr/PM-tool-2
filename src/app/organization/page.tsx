'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvitationsTab } from '@/components/organization/invitations-tab';
import { UsersTable } from '@/components/organization/users-table';
import { TeamsTab } from '@/components/organization/teams-tab';
import { SettingsTab } from '@/components/organization/settings-tab';
import { BillingTab } from '@/components/organization/billing-tab';
import { Building2, Users, Settings, CreditCard, Mail } from 'lucide-react';

function OrganizationContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'users';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization settings, teams, and members
          </p>
        </div>

        <Tabs defaultValue={tab} className="space-y-4">
          <TabsList className="grid w-full max-w-[700px] grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invitations
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                <p className="text-muted-foreground">
                  Manage your users and their access to projects.
                </p>
              </div>
              <UsersTable />
            </div>
          </TabsContent>

          <TabsContent value="invitations">
            <InvitationsTab />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function OrganizationPage() {
  return (
    <Suspense fallback={<DashboardLayout><div>Loading...</div></DashboardLayout>}>
      <OrganizationContent />
    </Suspense>
  );
}