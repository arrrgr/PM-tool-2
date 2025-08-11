'use client';

import { useState, useMemo } from 'react';
import { TasksFilters } from './tasks-filters';
import { TasksList } from './tasks-list';

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

interface TasksWithFiltersProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
}

export function TasksWithFilters({ tasks, projects, teamMembers }: TasksWithFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    project: 'all',
    assignee: 'all',
    status: 'all',
    priority: 'all',
    type: 'all',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.key.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Project filter
      if (filters.project && filters.project !== 'all') {
        if (task.project?.id !== filters.project) return false;
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
  }, [tasks, filters]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <TasksFilters 
        projects={projects}
        teamMembers={teamMembers}
        onFiltersChange={handleFiltersChange}
      />
      
      <TasksList 
        tasks={filteredTasks}
        projects={projects}
        teamMembers={teamMembers}
      />
    </>
  );
}