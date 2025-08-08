'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { Settings, Plus, Calendar, User } from 'lucide-react';

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    key: string;
    description: string | null;
    status: string | null;
    priority: string | null;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date | null;
    leader?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  };
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'on-hold': return 'warning';
      default: return 'secondary';
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="border-b pb-6">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant="outline" className="font-mono">
                {project.key}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(project.status)}>
                {project.status || 'Active'}
              </Badge>
              <Badge variant={getPriorityColor(project.priority)}>
                {project.priority || 'Medium'} Priority
              </Badge>
            </div>
          </div>
          
          {project.description && (
            <p className="text-muted-foreground max-w-2xl">
              {project.description}
            </p>
          )}
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            {project.leader && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Project Lead:</span>
                <div className="flex items-center space-x-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={project.leader.image || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(project.leader.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {project.leader.name}
                  </span>
                </div>
              </div>
            )}
            
            {project.createdAt && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Created:</span>
                <span>{format(project.createdAt, 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CreateTaskDialog projectId={project.id}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </CreateTaskDialog>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}