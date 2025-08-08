import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users, tasks } from '@/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, Crown, User } from 'lucide-react';

async function TeamContent() {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return <div>No organization found</div>;
  }

  const organizationId = session.user.organizationId;

  // Get all team members with task counts
  const teamMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
    })
    .from(users)
    .where(eq(users.organizationId, organizationId))
    .orderBy(users.name);

  // Get task counts for each user
  const taskCounts = await db
    .select({
      assigneeId: tasks.assigneeId,
      totalTasks: count(),
    })
    .from(tasks)
    .where(eq(tasks.isArchived, false))
    .groupBy(tasks.assigneeId);

  const taskCountsMap = taskCounts.reduce((acc, { assigneeId, totalTasks }) => {
    if (assigneeId) {
      acc[assigneeId] = totalTasks;
    }
    return acc;
  }, {} as Record<string, number>);

  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'default';
      case 'member': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Manage your team members and their access to projects.
          </p>
        </div>
        <Button disabled>
          Invite Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.image || ''} />
                    <AvatarFallback>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name || 'No Name'}</CardTitle>
                    <div className="flex items-center space-x-1 mt-1">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role === 'admin' ? (
                          <>
                            <Crown className="mr-1 h-3 w-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="mr-1 h-3 w-3" />
                            Member
                          </>
                        )}
                      </Badge>
                      {!member.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(member.createdAt || new Date(), 'MMM d, yyyy')}</span>
                </div>

                {member.lastLogin && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span className="text-xs">Last seen {format(member.lastLogin, 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Active Tasks:</span>
                  <Badge variant="outline">
                    {taskCountsMap[member.id] || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members</h3>
            <p className="text-gray-500 mb-4">
              Invite team members to collaborate on projects and tasks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading team...</div>}>
        <TeamContent />
      </Suspense>
    </DashboardLayout>
  );
}