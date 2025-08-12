'use client';

import { useState, useMemo } from 'react';
import { KanbanBoard } from './kanban-board';
import { TasksFilters } from '@/components/tasks/tasks-filters';

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
  commentCount?: number;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

interface KanbanWithFiltersProps {
  tasks: Task[];
  statuses: string[];
  projectId: string;
  teamMembers: TeamMember[];
  project: any;
}

export function KanbanWithFilters({ 
  tasks, 
  statuses, 
  projectId, 
  teamMembers,
  project 
}: KanbanWithFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    project: 'all',
    assignee: 'all',
    status: 'all',
    priority: 'all',
    type: 'all',
  });

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      // Search filter
      if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.key.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Assignee filter
      if (filters.assignee && filters.assignee !== 'all') {
        if (filters.assignee === 'unassigned') {
          if (task.assignee !== null) return false;
        } else {
          if (task.assignee?.id !== filters.assignee) return false;
        }
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        const taskStatus = task.status || 'To Do';
        if (taskStatus !== filters.status) return false;
      }

      // Priority filter
      if (filters.priority && filters.priority !== 'all') {
        const taskPriority = task.priority || 'medium';
        if (taskPriority.toLowerCase() !== filters.priority.toLowerCase()) return false;
      }

      // Type filter
      if (filters.type && filters.type !== 'all') {
        const taskType = task.type || 'task';
        if (taskType.toLowerCase() !== filters.type.toLowerCase()) return false;
      }

      return true;
    });

    // Sort by due date (tasks with due dates first, then by date ascending)
    return filtered.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, filters]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Since we're on a specific project page, we don't need project filter
  // Create a dummy projects array for the filter component
  const projects = [{ id: projectId, name: project.name, key: project.key }];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Board</h2>
      </div>

      <TasksFilters 
        projects={projects}
        teamMembers={teamMembers}
        onFiltersChange={handleFiltersChange}
        hideProjectFilter={true} // Since we're already on a project page
      />
      
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedTasks.length} of {tasks.length} tasks
      </div>

      <KanbanBoard 
        tasks={filteredAndSortedTasks}
        statuses={statuses}
        projectId={projectId}
        teamMembers={teamMembers}
      />
    </div>
  );
}