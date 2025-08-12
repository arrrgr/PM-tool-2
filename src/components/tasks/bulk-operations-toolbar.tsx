'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  User,
  Tag,
  Folder,
  Archive,
  Trash2,
  ChevronDown,
  AlertCircle,
  X,
} from 'lucide-react';

interface BulkOperationsToolbarProps {
  selectedTasks: string[];
  onClearSelection: () => void;
  onOperationComplete: () => void;
  teamMembers?: Array<{ id: string; name: string | null; email: string; image: string | null; }>;
  projects?: Array<{ id: string; name: string; key: string; }>;
}

export function BulkOperationsToolbar({
  selectedTasks,
  onClearSelection,
  onOperationComplete,
  teamMembers = [],
  projects = [],
}: BulkOperationsToolbarProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    title: string;
    description: string;
  }>({
    open: false,
    action: '',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [assigneeDialog, setAssigneeDialog] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [labelsDialog, setLabelsDialog] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [moveDialog, setMoveDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  const performBulkOperation = async (action: string, data?: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskIds: selectedTasks,
          action,
          data,
        }),
      });

      if (response.ok) {
        onOperationComplete();
        onClearSelection();
      } else {
        console.error('Bulk operation failed');
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: '', title: '', description: '' });
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'delete':
        setConfirmDialog({
          open: true,
          action: 'delete',
          title: 'Delete Tasks',
          description: `Are you sure you want to delete ${selectedTasks.length} task(s)? This action cannot be undone.`,
        });
        break;
      case 'archive':
        setConfirmDialog({
          open: true,
          action: 'archive',
          title: 'Archive Tasks',
          description: `Archive ${selectedTasks.length} task(s)? They can be restored later from the archive.`,
        });
        break;
      default:
        // For other actions, perform immediately or show specific UI
        performBulkOperation(action);
    }
  };

  if (selectedTasks.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border shadow-lg rounded-lg p-4 flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {selectedTasks.length} selected
          </Badge>

          <div className="flex items-center gap-2">
            {/* Status Update */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Status
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => performBulkOperation('updateStatus', { status: 'To Do' })}>
                  To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => performBulkOperation('updateStatus', { status: 'In Progress' })}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => performBulkOperation('updateStatus', { status: 'In Review' })}>
                  In Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => performBulkOperation('updateStatus', { status: 'Done' })}>
                  Done
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Update */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Priority
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => performBulkOperation('updatePriority', { priority: 'low' })}>
                  Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => performBulkOperation('updatePriority', { priority: 'medium' })}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => performBulkOperation('updatePriority', { priority: 'high' })}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => performBulkOperation('updatePriority', { priority: 'urgent' })}>
                  Urgent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Assignee */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAssigneeDialog(true)}
              disabled={teamMembers.length === 0}
            >
              <User className="h-4 w-4 mr-2" />
              Assign
            </Button>

            {/* Labels */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLabelsDialog(true)}
            >
              <Tag className="h-4 w-4 mr-2" />
              Labels
            </Button>

            {/* Move to Project */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMoveDialog(true)}
              disabled={projects.length === 0}
            >
              <Folder className="h-4 w-4 mr-2" />
              Move
            </Button>

            <div className="border-l pl-2 ml-2">
              {/* Archive */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('archive')}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>

              {/* Delete */}
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 ml-2"
                onClick={() => handleAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => performBulkOperation(confirmDialog.action)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignee Dialog */}
      <Dialog open={assigneeDialog} onOpenChange={setAssigneeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tasks</DialogTitle>
            <DialogDescription>
              Select a team member to assign {selectedTasks.length} task(s) to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assignee">Team Member</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAssigneeDialog(false);
              setSelectedAssignee('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                performBulkOperation('updateAssignee', { assigneeId: selectedAssignee });
                setAssigneeDialog(false);
                setSelectedAssignee('');
              }}
              disabled={!selectedAssignee || loading}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Labels Dialog */}
      <Dialog open={labelsDialog} onOpenChange={setLabelsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Labels</DialogTitle>
            <DialogDescription>
              Add labels to {selectedTasks.length} task(s). Separate multiple labels with commas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="labels">Labels</Label>
              <Input
                id="labels"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="bug, frontend, priority"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setLabelsDialog(false);
              setLabelInput('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const labels = labelInput.split(',').map(l => l.trim()).filter(Boolean);
                performBulkOperation('addLabels', { labels });
                setLabelsDialog(false);
                setLabelInput('');
              }}
              disabled={!labelInput.trim() || loading}
            >
              Add Labels
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Project Dialog */}
      <Dialog open={moveDialog} onOpenChange={setMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Tasks</DialogTitle>
            <DialogDescription>
              Move {selectedTasks.length} task(s) to another project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setMoveDialog(false);
              setSelectedProject('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                performBulkOperation('moveToProject', { projectId: selectedProject });
                setMoveDialog(false);
                setSelectedProject('');
              }}
              disabled={!selectedProject || loading}
            >
              Move Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}