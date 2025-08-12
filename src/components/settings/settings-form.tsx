'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Settings as SettingsIcon, Crown } from 'lucide-react';

interface SettingsFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    settings: any;
    subscriptionTier: string | null;
  };
  userCount: number;
}

export function SettingsForm({ user, organization, userCount }: SettingsFormProps) {
  const { toast } = useToast();
  const isAdmin = user.role === 'admin' || user.role === 'owner';
  
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email,
  });
  
  const [orgData, setOrgData] = useState({
    name: organization.name,
    slug: organization.slug,
    description: organization.description || '',
  });
  
  const [loading, setLoading] = useState(false);

  const updateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/organizations/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData),
      });
      
      if (response.ok) {
        toast({
          title: 'Organization updated',
          description: 'Organization settings have been updated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update organization',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to update organization',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
              <Input 
                id="name" 
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={updateProfile} disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
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
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="orgSlug">Organization Slug</Label>
              <Input 
                id="orgSlug" 
                value={orgData.slug}
                onChange={(e) => setOrgData({ ...orgData, slug: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="orgDescription">Description</Label>
            <Textarea
              id="orgDescription" 
              value={orgData.description}
              onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
              disabled={!isAdmin}
              placeholder="Describe your organization"
              rows={3}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{userCount} team members</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline">{organization.subscriptionTier || 'free'}</Badge>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={updateOrganization} disabled={loading}>
                {loading ? 'Updating...' : 'Update Organization'}
              </Button>
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
              {(organization.settings?.defaultTaskStatuses || ['To Do', 'In Progress', 'In Review', 'Done']).map((status: string) => (
                <Badge key={status} variant="outline">
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Default Priorities</Label>
            <div className="flex flex-wrap gap-2">
              {(organization.settings?.defaultPriorities || ['Low', 'Medium', 'High']).map((priority: string) => (
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