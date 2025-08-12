'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, Crown, User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  isActive: boolean;
  createdAt: Date | string | null;
  lastLogin: Date | string | null;
  taskCount?: number;
}

export function UsersTab() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const response = await fetch('/api/team/members');
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

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

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage your users and their access to projects.
          </p>
        </div>
        <Button disabled>
          Invite User
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
                  <span>Joined {member.createdAt ? format(new Date(member.createdAt), 'MMM d, yyyy') : 'Unknown'}</span>
                </div>

                {member.lastLogin && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span className="text-xs">Last seen {format(new Date(member.lastLogin), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Active Tasks:</span>
                  <Badge variant="outline">
                    {member.taskCount || 0}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users</h3>
            <p className="text-gray-500 mb-4">
              Invite users to collaborate on projects and tasks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}