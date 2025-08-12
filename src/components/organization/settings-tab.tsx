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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Building2, Globe, Shield, Bell } from 'lucide-react';

export function SettingsTab() {
  const [settings, setSettings] = useState({
    name: 'My Organization',
    slug: 'my-org',
    description: '',
    defaultTaskStatuses: ['To Do', 'In Progress', 'Done'],
    features: {
      knowledgeBase: true,
      timeTracking: true,
      reporting: true,
    },
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const saveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement settings API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Settings saved',
        description: 'Organization settings have been updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure your organization's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="org-slug">URL Slug</Label>
              <Input
                id="org-slug"
                value={settings.slug}
                onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Describe your organization"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Enable or disable features for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="kb-feature">Knowledge Base</Label>
              <p className="text-sm text-muted-foreground">
                AI-powered documentation and Q&A system
              </p>
            </div>
            <Switch
              id="kb-feature"
              checked={settings.features.knowledgeBase}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, knowledgeBase: checked },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="time-feature">Time Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Track time spent on tasks and projects
              </p>
            </div>
            <Switch
              id="time-feature"
              checked={settings.features.timeTracking}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, timeTracking: checked },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reporting-feature">Advanced Reporting</Label>
              <p className="text-sm text-muted-foreground">
                Detailed analytics and custom reports
              </p>
            </div>
            <Switch
              id="reporting-feature"
              checked={settings.features.reporting}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, reporting: checked },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage security settings for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all organization members
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out inactive users after 30 minutes
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}