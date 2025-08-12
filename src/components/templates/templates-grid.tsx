'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Rocket, 
  Users, 
  Code, 
  Briefcase, 
  Globe,
  Plus,
  Copy,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string | null;
  key: string;
  color: string | null;
  icon: string | null;
  isPublic: boolean;
  category: string | null;
  tags: string[] | any;
  taskTemplates: any[] | any;
  workflowStates: string[] | any;
  customFields: any[] | any;
  createdAt: Date;
}

interface TemplatesGridProps {
  organizationTemplates: Template[];
  publicTemplates: Template[];
}

const categoryIcons: Record<string, any> = {
  general: FileText,
  development: Code,
  marketing: Rocket,
  hr: Users,
  business: Briefcase,
};

export function TemplatesGrid({ organizationTemplates, publicTemplates }: TemplatesGridProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [useTemplateDialogOpen, setUseTemplateDialogOpen] = useState(false);
  const [createTemplateDialogOpen, setCreateTemplateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    key: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const [newTemplateData, setNewTemplateData] = useState({
    name: '',
    description: '',
    key: '',
    category: 'general',
    tags: '',
  });

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjectData),
      });

      if (response.ok) {
        const { project } = await response.json();
        router.push(`/projects/${project.id}`);
      } else {
        console.error('Failed to create project from template');
      }
    } catch (error) {
      console.error('Error using template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTemplateData,
          tags: newTemplateData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        router.refresh();
        setCreateTemplateDialogOpen(false);
      } else {
        console.error('Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateCard = (template: Template) => {
    const Icon = categoryIcons[template.category || 'general'] || FileText;
    const taskCount = Array.isArray(template.taskTemplates) ? template.taskTemplates.length : 0;
    const tags = Array.isArray(template.tags) ? template.tags : [];

    return (
      <Card key={template.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: template.color || '#6366f1' }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            {template.isPublic && (
              <Badge variant="secondary">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            )}
          </div>
          <CardTitle className="mt-3">{template.name}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {taskCount} predefined tasks
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTemplate(template);
              setNewProjectData({
                name: '',
                key: template.key,
                description: template.description || '',
                startDate: '',
                endDate: '',
              });
              setUseTemplateDialogOpen(true);
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Use Template
          </Button>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button onClick={() => setCreateTemplateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
            <Button variant="outline">
              Create from Project
            </Button>
          </div>
        </div>

        <Tabs defaultValue="organization" className="w-full">
          <TabsList>
            <TabsTrigger value="organization">
              Organization Templates ({organizationTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="public">
              Public Templates ({publicTemplates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization" className="mt-6">
            {organizationTemplates.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No organization templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first template to streamline project creation.
                  </p>
                  <Button onClick={() => setCreateTemplateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizationTemplates.map(renderTemplateCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="public" className="mt-6">
            {publicTemplates.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No public templates available</h3>
                  <p className="text-muted-foreground">
                    Public templates will appear here when available.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {publicTemplates.map(renderTemplateCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Use Template Dialog */}
      <Dialog open={useTemplateDialogOpen} onOpenChange={setUseTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Project from Template</DialogTitle>
            <DialogDescription>
              Use "{selectedTemplate?.name}" template to create a new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectData.name}
                onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-key">Project Key</Label>
              <Input
                id="project-key"
                value={newProjectData.key}
                onChange={(e) => setNewProjectData({ ...newProjectData, key: e.target.value.toUpperCase() })}
                placeholder="e.g., PROJ"
                maxLength={10}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Textarea
                id="project-description"
                value={newProjectData.description}
                onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                placeholder="Describe your project"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date (Optional)</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newProjectData.startDate}
                  onChange={(e) => setNewProjectData({ ...newProjectData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newProjectData.endDate}
                  onChange={(e) => setNewProjectData({ ...newProjectData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUseTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUseTemplate} disabled={loading || !newProjectData.name || !newProjectData.key}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={createTemplateDialogOpen} onOpenChange={setCreateTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for future projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={newTemplateData.name}
                onChange={(e) => setNewTemplateData({ ...newTemplateData, name: e.target.value })}
                placeholder="e.g., Software Development Project"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-key">Project Key Prefix</Label>
              <Input
                id="template-key"
                value={newTemplateData.key}
                onChange={(e) => setNewTemplateData({ ...newTemplateData, key: e.target.value.toUpperCase() })}
                placeholder="e.g., PROJ"
                maxLength={10}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={newTemplateData.description}
                onChange={(e) => setNewTemplateData({ ...newTemplateData, description: e.target.value })}
                placeholder="Describe what this template is for"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-category">Category</Label>
              <Select
                value={newTemplateData.category}
                onValueChange={(value) => setNewTemplateData({ ...newTemplateData, category: value })}
              >
                <SelectTrigger id="template-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-tags">Tags (comma-separated)</Label>
              <Input
                id="template-tags"
                value={newTemplateData.tags}
                onChange={(e) => setNewTemplateData({ ...newTemplateData, tags: e.target.value })}
                placeholder="e.g., agile, scrum, software"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={loading || !newTemplateData.name || !newTemplateData.key}
            >
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}