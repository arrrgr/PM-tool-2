'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Plus,
  Users,
  Edit,
  Trash2,
  UserPlus,
  Crown,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  description: string | null;
  parentTeamId: string | null;
  leaderId: string | null;
  leaderName: string | null;
  isActive: boolean;
  createdAt: string;
  memberCount?: number;
}

interface TeamMember {
  userId: string;
  role: string;
  joinedAt: string;
  userName: string | null;
  userEmail: string;
  userImage: string | null;
}

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/organizations/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const response = await fetch(`/api/organizations/teams/members?teamId=${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    }
  };

  const createTeam = async () => {
    if (!newTeam.name) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/organizations/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam),
      });

      if (response.ok) {
        toast({
          title: 'Team created',
          description: `Team "${newTeam.name}" has been created`,
        });
        setCreateDialogOpen(false);
        setNewTeam({ name: '', description: '' });
        fetchTeams();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to create team',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive',
      });
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/organizations/teams?id=${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Team deactivated',
          description: 'The team has been deactivated',
        });
        fetchTeams();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to deactivate team',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate team',
        variant: 'destructive',
      });
    }
  };

  const viewMembers = async (team: Team) => {
    setSelectedTeam(team);
    setMembersDialogOpen(true);
    await fetchTeamMembers(team.id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teams & Departments</CardTitle>
              <CardDescription>
                Organize your workspace into teams and departments
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Create a new team or department in your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="e.g., Engineering, Marketing"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team-description">Description (optional)</Label>
                    <Textarea
                      id="team-description"
                      value={newTeam.description}
                      onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                      placeholder="Describe the team's responsibilities"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTeam}>Create Team</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No teams created yet</p>
              <Button
                type="button"
                onClick={() => setCreateDialogOpen(true)}
                variant="link"
                className="mt-2"
              >
                Create your first team
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams
                .filter((team) => team.isActive)
                .map((team) => (
                  <Card key={team.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          {team.description && (
                            <CardDescription className="mt-1 text-sm">
                              {team.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {team.memberCount || 0}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {team.leaderName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Crown className="h-3 w-3" />
                          <span>Led by {team.leaderName}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewMembers(team)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Members
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTeam(team.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Team Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name} Members</DialogTitle>
            <DialogDescription>
              View and manage team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No members in this team yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {member.userName?.[0] || member.userEmail[0]}
                      </div>
                      <div>
                        <p className="font-medium">{member.userName || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === 'lead' ? 'default' : 'outline'}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}