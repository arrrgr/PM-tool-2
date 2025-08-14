'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Briefcase, 
  Code, 
  Megaphone, 
  Calendar,
  FileText,
  Plus,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    id: 'software-dev',
    name: 'Software Development',
    description: 'Agile software development project with sprints and releases',
    icon: Code,
    color: 'bg-blue-500',
    tasks: 12,
    tags: ['Agile', 'Scrum', 'Development'],
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns with timeline and deliverables',
    icon: Megaphone,
    color: 'bg-purple-500',
    tasks: 8,
    tags: ['Marketing', 'Campaign', 'Social'],
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Complete product launch checklist from ideation to market',
    icon: Rocket,
    color: 'bg-green-500',
    tasks: 15,
    tags: ['Product', 'Launch', 'Strategy'],
  },
  {
    id: 'business-proposal',
    name: 'Business Proposal',
    description: 'Structure for creating comprehensive business proposals',
    icon: Briefcase,
    color: 'bg-orange-500',
    tasks: 6,
    tags: ['Business', 'Sales', 'Proposal'],
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Organize events with timeline, vendors, and logistics',
    icon: Calendar,
    color: 'bg-pink-500',
    tasks: 10,
    tags: ['Event', 'Planning', 'Logistics'],
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    description: 'Editorial calendar for content creation and publishing',
    icon: FileText,
    color: 'bg-indigo-500',
    tasks: 7,
    tags: ['Content', 'Editorial', 'Publishing'],
  },
];

const getTemplateTasks = (templateId: string) => {
  const templates: Record<string, any[]> = {
    'software-dev': [
      { title: 'Setup development environment', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Create project repository', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Define project requirements', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Design system architecture', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Setup CI/CD pipeline', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Implement core features', type: 'feature', priority: 'high', status: 'To Do' },
      { title: 'Write unit tests', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Code review', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Deploy to staging', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'User acceptance testing', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Bug fixes', type: 'bug', priority: 'high', status: 'To Do' },
      { title: 'Deploy to production', type: 'task', priority: 'high', status: 'To Do' },
    ],
    'marketing-campaign': [
      { title: 'Define campaign objectives', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Research target audience', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Create campaign strategy', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Design creative assets', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Write campaign copy', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Setup social media channels', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Launch campaign', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Monitor and analyze metrics', type: 'task', priority: 'medium', status: 'To Do' },
    ],
    'product-launch': [
      { title: 'Market research', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Define product requirements', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Create product roadmap', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Design prototypes', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Develop MVP', type: 'feature', priority: 'high', status: 'To Do' },
      { title: 'User testing', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Iterate based on feedback', type: 'improvement', priority: 'medium', status: 'To Do' },
      { title: 'Prepare marketing materials', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Set pricing strategy', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Create sales collateral', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Train sales team', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Setup support channels', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Launch preparation', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Product launch', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Post-launch analysis', type: 'task', priority: 'medium', status: 'To Do' },
    ],
    'business-proposal': [
      { title: 'Research client needs', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Define proposal scope', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Create executive summary', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Develop solution approach', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Create budget and timeline', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Review and finalize', type: 'task', priority: 'high', status: 'To Do' },
    ],
    'event-planning': [
      { title: 'Define event objectives', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Set budget', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Select venue', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Create guest list', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Send invitations', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Arrange catering', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Book entertainment', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Coordinate logistics', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Setup event space', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Event execution', type: 'task', priority: 'high', status: 'To Do' },
    ],
    'content-calendar': [
      { title: 'Define content strategy', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Research topics', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Create content calendar', type: 'task', priority: 'high', status: 'To Do' },
      { title: 'Write blog posts', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Create social media content', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Review and edit content', type: 'task', priority: 'medium', status: 'To Do' },
      { title: 'Publish and promote', type: 'task', priority: 'high', status: 'To Do' },
    ],
  };

  return templates[templateId] || [];
};

export default function TemplatesPage() {
  const handleUseTemplate = async (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    try {
      // Create project from template
      const projectData = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        description: template.description,
        key: templateId.toUpperCase().slice(0, 5),
        status: 'active',
        priority: 'medium',
      };

      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!projectResponse.ok) {
        throw new Error('Failed to create project');
      }

      const project = await projectResponse.json();

      // Create template tasks
      const templateTasks = getTemplateTasks(templateId);
      
      for (const task of templateTasks) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...task,
            projectId: project.id,
          }),
        });
      }

      toast.success(`Project created from ${template.name} template!`);
      // Redirect to the new project
      window.location.href = `/projects/${project.id}`;
    } catch (error) {
      console.error('Error creating project from template:', error);
      toast.error('Failed to create project from template');
    }
  };

  const handleCreateTemplate = () => {
    toast.info('Template creation coming soon!');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Project Templates</h1>
            <p className="text-muted-foreground">
              Use templates to quickly create new projects with predefined structure and tasks
            </p>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${template.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary">{template.tasks} tasks</Badge>
                  </div>
                  <CardTitle className="mt-4">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    Use Template
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Create Custom Template</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Save your project structure as a reusable template
            </p>
            <Button variant="outline" onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}