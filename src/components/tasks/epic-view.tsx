'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

interface Subtask {
  id: string;
  key: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  type: string | null;
  storyPoints: number | null;
  dueDate: Date | null;
  progress: number | null;
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
}

interface EpicViewProps {
  taskId: string;
  isEpic: boolean;
  progress?: number;
  teamMembers?: TeamMember[];
  onSubtaskUpdate?: () => void;
}

export function EpicView({ taskId, isEpic, progress = 0, teamMembers = [], onSubtaskUpdate }: EpicViewProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    if (isEpic) {
      fetchSubtasks();
    }
  }, [taskId, isEpic]);

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`);
      if (response.ok) {
        const data = await response.json();
        setSubtasks(data);
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubtask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubtask),
      });

      if (response.ok) {
        await fetchSubtasks();
        setCreateDialogOpen(false);
        setNewSubtask({
          title: '',
          description: '',
          assigneeId: '',
          priority: 'medium',
          dueDate: '',
        });
        onSubtaskUpdate?.();
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchSubtasks();
        onSubtaskUpdate?.();
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'done': return 'success';
      case 'in progress': return 'warning';
      case 'in review': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high': 
      case 'urgent': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (!isEpic) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <CardTitle className="text-lg">
                Sub-tasks ({subtasks.length})
              </CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <div className="w-32">
                  <Progress value={progress} className="h-2" />
                </div>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Sub-task
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {expanded && (
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading sub-tasks...
              </div>
            ) : subtasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No sub-tasks yet. Break down this epic into smaller tasks.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Sub-task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              {subtask.key}
                            </span>
                            <Badge variant={getStatusColor(subtask.status)} className="text-xs">
                              {subtask.status || 'To Do'}
                            </Badge>
                            <Badge variant={getPriorityColor(subtask.priority)} className="text-xs">
                              {subtask.priority || 'Medium'}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm">{subtask.title}</h4>
                          {subtask.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {subtask.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {subtask.assignee && (
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={subtask.assignee.image || ''} />
                                  <AvatarFallback className="text-xs">
                                    {subtask.assignee.name?.[0] || subtask.assignee.email[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{subtask.assignee.name || subtask.assignee.email}</span>
                              </div>
                            )}
                            {subtask.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Due {format(new Date(subtask.dueDate), 'MMM d')}</span>
                              </div>
                            )}
                            {subtask.storyPoints && (
                              <span>{subtask.storyPoints} pts</span>
                            )}
                          </div>
                        </div>
                        <Select
                          value={subtask.status || 'To Do'}
                          onValueChange={(value) => updateSubtaskStatus(subtask.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="To Do">To Do</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="In Review">In Review</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Create Sub-task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Sub-task</DialogTitle>
            <DialogDescription>
              Add a new sub-task to this epic. Sub-tasks help break down large work into manageable pieces.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newSubtask.title}
                onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                placeholder="Enter sub-task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newSubtask.description}
                onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                placeholder="Describe the sub-task"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select
                  value={newSubtask.assigneeId}
                  onValueChange={(value) => setNewSubtask({ ...newSubtask, assigneeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newSubtask.priority}
                  onValueChange={(value) => setNewSubtask({ ...newSubtask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newSubtask.dueDate}
                onChange={(e) => setNewSubtask({ ...newSubtask, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createSubtask} disabled={!newSubtask.title.trim()}>
              Create Sub-task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}