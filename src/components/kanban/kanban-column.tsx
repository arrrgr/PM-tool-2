'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EnhancedTaskCard } from './enhanced-task-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { Button } from '@/components/ui/button';

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
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
}

interface KanbanColumnProps {
  status: string;
  tasks: Task[];
  projectId: string;
  teamMembers: TeamMember[];
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, projectId, teamMembers, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'to do': return 'bg-gray-100 text-gray-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'in review': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[300px] max-w-[300px] bg-gray-50 rounded-lg p-4 transition-colors',
        isOver && 'bg-gray-100 ring-2 ring-blue-500 ring-opacity-50'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">
          {status}
        </h3>
        <Badge 
          variant="secondary" 
          className={cn('text-xs', getStatusColor(status))}
        >
          {tasks.length}
        </Badge>
      </div>
      
      <SortableContext
        items={tasks.map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3 min-h-[200px]">
          {tasks.map((task) => (
            <EnhancedTaskCard 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick?.(task)}
              teamMembers={teamMembers}
            />
          ))}
          
          {tasks.length === 0 && (
            <CreateTaskDialog projectId={projectId} initialStatus={status}>
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <Plus className="h-8 w-8 mb-2 text-gray-300" />
                <span>Click to add task</span>
              </div>
            </CreateTaskDialog>
          )}
          
          {/* Add task button at bottom of column */}
          <CreateTaskDialog projectId={projectId} initialStatus={status}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add task
            </Button>
          </CreateTaskDialog>
        </div>
      </SortableContext>
    </div>
  );
}