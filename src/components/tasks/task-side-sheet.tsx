'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  MoreVertical,
  Clock,
  Paperclip,
  Link,
  Users,
  Calendar,
  Flag,
  Hash,
  Tag,
  MessageSquare,
  Plus,
  Play,
  Pause,
  Trash2,
  Archive,
  Copy,
  ExternalLink,
  Edit3,
  CheckCircle,
  Circle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  assigneeId: string | null;
  projectId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: TeamMember;
  dueDate?: Date;
}

interface TaskSideSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers?: TeamMember[];
}

export function TaskSideSheet({ task, open, onOpenChange, teamMembers = [] }: TaskSideSheetProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Form state
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'To Do',
    priority: task?.priority || 'medium',
    type: task?.type || 'task',
    storyPoints: task?.storyPoints?.toString() || '',
    assigneeId: task?.assigneeId || '',
    dueDate: task?.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
  });

  // Mock data for demonstration
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', title: 'Reproduce runtime error on Permissions page', completed: true, assignee: teamMembers[0] },
    { id: '2', title: 'Refactor queries to avoid null object conversion', completed: true, assignee: teamMembers[1] },
    { id: '3', title: 'Add unit tests for guard util', completed: false, assignee: teamMembers[1] },
    { id: '4', title: 'QA pass on staging', completed: false, assignee: teamMembers[0] },
  ]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'medium',
        type: task.type || 'task',
        storyPoints: task.storyPoints?.toString() || '',
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
      });
      loadComments();
    }
  }, [task]);

  const loadComments = async () => {
    if (!task) return;
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSave = async () => {
    if (!task) return;
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          type: formData.type,
          storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : null,
          assigneeId: formData.assigneeId || null,
          dueDate: formData.dueDate || null,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onOpenChange(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        loadComments();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setSubtasks(prev => 
      prev.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const newTask: Subtask = {
      id: Date.now().toString(),
      title: newSubtask,
      completed: false,
    };
    
    setSubtasks(prev => [...prev, newTask]);
    setNewSubtask('');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in review': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progressPercentage = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-[980px] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-5 py-3 flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Badge variant="outline" className="font-mono">
              {task.key}
            </Badge>
            
            <div className="flex-1" />
            
            <Button variant="ghost" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                  <Edit3 className="h-3 w-3 mr-2" />
                  {isEditing ? 'View Mode' : 'Edit Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="h-3 w-3 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="px-5 pb-4">
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-xl font-semibold"
              />
            ) : (
              <h2 className="text-xl md:text-2xl font-semibold">{task.title}</h2>
            )}
            
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className={cn('gap-1', getStatusColor(formData.status))}>
                <Circle className="h-2 w-2 fill-current" />
                Status: {formData.status}
              </Badge>
              
              <Badge className={cn('gap-1', getPriorityColor(formData.priority))}>
                <Flag className="h-3 w-3" />
                Priority: {formData.priority}
              </Badge>
              
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                {teamMembers.find(m => m.id === formData.assigneeId)?.name || 'Unassigned'}
              </Badge>
              
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {formData.dueDate ? format(new Date(formData.dueDate), 'MMM d, yyyy') : 'No due date'}
              </Badge>
              
              <Badge variant="outline" className="gap-1">
                <Hash className="h-3 w-3" />
                {formData.storyPoints || '0'} pts
              </Badge>
              
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                  {isTimerRunning ? 'Pause' : 'Start'} Timer
                </Button>
                
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-20">
          <div className="grid grid-cols-12 gap-5 py-5">
            {/* Main Column */}
            <div className="col-span-12 lg:col-span-8 space-y-5">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={5}
                      placeholder="Add a description..."
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {formData.description || 
                        <span className="text-muted-foreground">No description provided</span>
                      }
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subtasks */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Subtasks ({completedSubtasks}/{subtasks.length})
                    </CardTitle>
                    <Progress value={progressPercentage} className="w-32" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-3 py-2">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                        />
                        <span className={cn(
                          'flex-1 text-sm',
                          subtask.completed && 'line-through text-muted-foreground'
                        )}>
                          {subtask.title}
                        </span>
                        {subtask.assignee && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={subtask.assignee.image || ''} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(subtask.assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {subtask.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(subtask.dueDate, 'MMM d')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      placeholder="Add a subtask..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddSubtask}>
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Comments & Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Add a comment... (Ctrl+Enter to send)"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              handleAddComment();
                            }
                          }}
                          rows={3}
                        />
                        <div className="mt-2 flex justify-between">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Paperclip className="h-3 w-3 mr-1" />
                              Attach
                            </Button>
                          </div>
                          <Button size="sm" onClick={handleAddComment}>
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.image || ''} />
                          <AvatarFallback>
                            {getInitials(comment.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-xs text-muted-foreground mb-1">
                              {comment.author.name} • {format(comment.createdAt, 'MMM d, h:mm a')}
                            </div>
                            <div className="text-sm">{comment.content}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
              {/* Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      {isEditing ? (
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="task">Task</SelectItem>
                            <SelectItem value="bug">Bug</SelectItem>
                            <SelectItem value="feature">Feature</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm">{formData.type}</div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      {isEditing ? (
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="To Do">To Do</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="In Review">In Review</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm">{formData.status}</div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      {isEditing ? (
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm capitalize">{formData.priority}</div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Assignee</Label>
                      {isEditing ? (
                        <Select
                          value={formData.assigneeId}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {teamMembers.map(member => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name || member.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm">
                          {teamMembers.find(m => m.id === formData.assigneeId)?.name || 'Unassigned'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Story Points</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.storyPoints}
                          onChange={(e) => setFormData(prev => ({ ...prev, storyPoints: e.target.value }))}
                          className="h-8"
                        />
                      ) : (
                        <div className="text-sm">{formData.storyPoints || '0'} points</div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Due Date</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="h-8"
                        />
                      ) : (
                        <div className="text-sm">
                          {formData.dueDate ? format(new Date(formData.dueDate), 'MMM d, yyyy') : 'Not set'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Tracking */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Time Tracking</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(timeSpent / 60)}h {timeSpent % 60}m
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                    >
                      {isTimerRunning ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                      {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Time
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      No time logged yet
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Attachments</CardTitle>
                    <span className="text-xs text-muted-foreground">Max 10MB</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Drop files here or click to browse
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    No attachments yet
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="sticky bottom-0 bg-background border-t px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Last saved {task.updatedAt ? format(task.updatedAt, 'MMM d, h:mm a') : 'Never'}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}