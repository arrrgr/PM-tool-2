'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MessageSquare, 
  Paperclip,
  MoreVertical,
  User,
  Hash,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Task {
  id: string;
  key: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  type: string | null;
  storyPoints: number | null;
  complexity?: string | null;
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

interface EnhancedTaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
  teamMembers?: TeamMember[];
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export function EnhancedTaskCard({ 
  task, 
  isDragging = false, 
  onClick,
  teamMembers = [],
  onUpdateTask
}: EnhancedTaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(task.assignee?.id || 'unassigned');
  const [selectedPoints, setSelectedPoints] = useState(task.storyPoints?.toString() || '0');
  const [selectedPriority, setSelectedPriority] = useState(task.priority || 'medium');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getPriorityBadgeVariant = (priority: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'low': return 'secondary';
      default: return 'default';
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

  const handleAssigneeChange = async (value: string) => {
    if (isUpdating || !onUpdateTask) return;
    
    setIsUpdating(true);
    setSelectedAssignee(value);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assigneeId: value === 'unassigned' ? null : value 
        }),
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update assignee:', error);
      setSelectedAssignee(task.assignee?.id || 'unassigned');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePointsChange = async (value: string) => {
    if (isUpdating || !onUpdateTask) return;
    
    setIsUpdating(true);
    setSelectedPoints(value);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storyPoints: value === '0' ? null : parseInt(value) 
        }),
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update story points:', error);
      setSelectedPoints(task.storyPoints?.toString() || '0');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (value: string) => {
    if (isUpdating || !onUpdateTask) return;
    
    setIsUpdating(true);
    setSelectedPriority(value);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: value }),
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update priority:', error);
      setSelectedPriority(task.priority || 'medium');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click when dragging
    if (!isDragging && !isSortableDragging && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md',
        getPriorityColor(task.priority),
        (isDragging || isSortableDragging) && 'opacity-50 rotate-2 shadow-lg',
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {task.key}
            </span>
            <span className="text-xs">{getTypeIcon(task.type)}</span>
          </div>
          
          {/* Priority Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 px-2 hover:bg-white/50"
                disabled={isUpdating}
              >
                <Badge 
                  variant={getPriorityBadgeVariant(selectedPriority)}
                  className="text-xs cursor-pointer"
                >
                  {selectedPriority || 'Medium'}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
                <Flag className="h-3 w-3 mr-2 text-red-500" />
                High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
                <Flag className="h-3 w-3 mr-2 text-yellow-500" />
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
                <Flag className="h-3 w-3 mr-2 text-green-500" />
                Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title - Clickable to open task */}
        <h4 
          className="font-medium text-sm leading-tight line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={handleCardClick}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Quick Actions Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Story Points Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 px-2 text-xs hover:bg-white/50"
                disabled={isUpdating}
              >
                <Hash className="h-3 w-3 mr-1" />
                {selectedPoints || '0'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Story Points</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['0', '1', '2', '3', '5', '8', '13', '21'].map(points => (
                <DropdownMenuItem key={points} onClick={() => handlePointsChange(points)}>
                  {points} {points === '1' ? 'point' : 'points'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assignee Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 px-1 hover:bg-white/50"
                disabled={isUpdating}
              >
                {task.assignee ? (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignee.image || ''} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(task.assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs">Unassigned</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Assign To</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAssigneeChange('unassigned')}>
                <User className="h-3 w-3 mr-2" />
                Unassigned
              </DropdownMenuItem>
              {teamMembers.map((member) => (
                <DropdownMenuItem key={member.id} onClick={() => handleAssigneeChange(member.id)}>
                  <Avatar className="h-4 w-4 mr-2">
                    <AvatarImage src={member.image || ''} />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  {member.name || member.email}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* Comments */}
            {(task.commentCount !== undefined && task.commentCount > 0) && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.commentCount}</span>
              </div>
            )}
            
            {/* Attachments */}
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>0</span>
            </div>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(task.dueDate, 'MMM d')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}