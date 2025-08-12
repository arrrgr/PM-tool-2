'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, ExternalLink, Edit2, MessageSquare } from 'lucide-react';
import { EditTaskDialog } from './edit-task-dialog';
import { BulkOperationsToolbar } from './bulk-operations-toolbar';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  key: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  type: string | null;
  storyPoints: number | null;
  dueDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  project: {
    id: string;
    name: string;
    key: string;
  } | null;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  commentCount?: number;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface TasksListProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
}

export function TasksList({ tasks, projects, teamMembers }: TasksListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

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
      case 'done': return 'success';
      case 'in progress': return 'info';
      case 'in review': return 'warning';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'improvement': return '⚡';
      case 'story': return '📖';
      default: return '📝';
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

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTasks([]);
      setSelectAll(false);
    } else {
      setSelectedTasks(tasks.map((t) => t.id));
      setSelectAll(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedTasks([]);
    setSelectAll(false);
  };

  const handleOperationComplete = () => {
    router.refresh();
    handleClearSelection();
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            Create your first task to start tracking work across your projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          {selectedTasks.length > 0 && ` • ${selectedTasks.length} selected`}
        </p>
        {tasks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectAll ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className={`hover:shadow-md transition-all ${
              selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => handleSelectTask(task.id)}
                  className="mt-1"
                />
                <div className="flex items-start justify-between flex-1">
                  <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {task.key}
                      </span>
                      <span className="text-xs">{getTypeIcon(task.type)}</span>
                    </div>
                    <h4 className="font-medium text-sm truncate">
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {task.project?.name}
                      </Badge>
                      <Badge variant={getStatusColor(task.status)} className="text-xs">
                        {task.status || 'To Do'}
                      </Badge>
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority || 'Medium'}
                      </Badge>
                    </div>
                    
                    {task.storyPoints && (
                      <Badge variant="outline" className="text-xs">
                        {task.storyPoints} pts
                      </Badge>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due {format(task.dueDate, 'MMM d')}</span>
                        </div>
                      )}
                      
                      {task.updatedAt && (
                        <span>Updated {format(task.updatedAt, 'MMM d')}</span>
                      )}
                      
                      {task.commentCount !== undefined && task.commentCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{task.commentCount} comments</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {task.assignee && (
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={task.assignee.image || ''} />
                            <AvatarFallback className="text-xs">
                              {getInitials(task.assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{task.assignee.name || task.assignee.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Link href={`/projects/${task.project?.id}`} passHref>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTask && (
        <EditTaskDialog
          task={{
            id: selectedTask.id,
            key: selectedTask.key,
            title: selectedTask.title,
            description: selectedTask.description,
            status: selectedTask.status,
            priority: selectedTask.priority,
            type: selectedTask.type,
            storyPoints: selectedTask.storyPoints,
            dueDate: selectedTask.dueDate,
            assigneeId: selectedTask.assignee?.id || null,
            projectId: selectedTask.project?.id || '',
          }}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          teamMembers={teamMembers}
        />
      )}
      
      <BulkOperationsToolbar
        selectedTasks={selectedTasks}
        onClearSelection={handleClearSelection}
        onOperationComplete={handleOperationComplete}
        teamMembers={teamMembers}
        projects={projects}
      />
    </div>
  );
}