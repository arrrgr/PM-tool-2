'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Mail, Plus, Check, X } from 'lucide-react';

export default function TestOrgPage() {
  const [invitations, setInvitations] = useState([
    { id: '1', email: 'john@example.com', role: 'member', status: 'pending' },
    { id: '2', email: 'jane@example.com', role: 'admin', status: 'accepted' },
  ]);
  const [teams, setTeams] = useState([
    { id: '1', name: 'Engineering', memberCount: 5 },
    { id: '2', name: 'Marketing', memberCount: 3 },
  ]);
  const [newEmail, setNewEmail] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  const sendInvitation = () => {
    if (newEmail) {
      setInvitations([
        ...invitations,
        {
          id: String(invitations.length + 1),
          email: newEmail,
          role: 'member',
          status: 'pending',
        },
      ]);
      setNewEmail('');
    }
  };

  const createTeam = () => {
    if (newTeamName) {
      setTeams([
        ...teams,
        {
          id: String(teams.length + 1),
          name: newTeamName,
          memberCount: 0,
        },
      ]);
      setNewTeamName('');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Organization Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage teams, members, and settings
          </p>
        </div>
      </div>

      {/* Invitations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Team Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendInvitation()}
            />
            <Button onClick={sendInvitation}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </div>

          <div className="space-y-2">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{invite.email}</span>
                  <Badge variant="outline">{invite.role}</Badge>
                </div>
                <Badge
                  variant={invite.status === 'accepted' ? 'default' : 'secondary'}
                >
                  {invite.status === 'accepted' ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <X className="h-3 w-3 mr-1" />
                  )}
                  {invite.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teams Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Teams & Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createTeam()}
            />
            <Button onClick={createTeam}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.memberCount} members
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-bold">Pro</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">25 / 50</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold">2.1 GB / 10 GB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}