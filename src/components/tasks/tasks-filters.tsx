'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

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

interface TasksFiltersProps {
  projects: Project[];
  teamMembers: TeamMember[];
  onFiltersChange?: (filters: any) => void;
}

export function TasksFilters({ projects, teamMembers, onFiltersChange }: TasksFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    project: 'all',
    assignee: 'all',
    status: 'all',
    priority: 'all',
    type: 'all',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      project: 'all',
      assignee: 'all',
      status: 'all',
      priority: 'all',
      type: 'all',
    };
    setFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => value && value !== 'all').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Project Filter */}
        <Select value={filters.project} onValueChange={(value) => handleFilterChange('project', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select value={filters.assignee} onValueChange={(value) => handleFilterChange('assignee', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name || member.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="In Review">In Review</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task">📝 Task</SelectItem>
            <SelectItem value="feature">✨ Feature</SelectItem>
            <SelectItem value="bug">🐛 Bug</SelectItem>
            <SelectItem value="improvement">⚡ Improvement</SelectItem>
            <SelectItem value="story">📖 Story</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            <X className="mr-2 h-4 w-4" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary">
              Search: "{filters.search}"
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('search', '')}
              />
            </Badge>
          )}
          {filters.project && filters.project !== 'all' && (
            <Badge variant="secondary">
              Project: {projects.find(p => p.id === filters.project)?.name}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('project', 'all')}
              />
            </Badge>
          )}
          {filters.assignee && filters.assignee !== 'all' && (
            <Badge variant="secondary">
              Assignee: {filters.assignee === 'unassigned' 
                ? 'Unassigned' 
                : teamMembers.find(m => m.id === filters.assignee)?.name || 'Unknown'}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('assignee', 'all')}
              />
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary">
              Status: {filters.status}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('status', 'all')}
              />
            </Badge>
          )}
          {filters.priority && filters.priority !== 'all' && (
            <Badge variant="secondary">
              Priority: {filters.priority}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('priority', 'all')}
              />
            </Badge>
          )}
          {filters.type && filters.type !== 'all' && (
            <Badge variant="secondary">
              Type: {filters.type}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('type', 'all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}