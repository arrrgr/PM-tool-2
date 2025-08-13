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

export default function TemplatesPage() {
  const handleUseTemplate = (templateId: string) => {
    toast.success(`Creating project from template...`);
    // In production, this would create a new project with the template structure
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