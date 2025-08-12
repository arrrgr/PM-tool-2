'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BulkOperationsToolbar } from '@/components/tasks/bulk-operations-toolbar';
import {
  CheckSquare,
  Calendar,
  User,
  AlertCircle,
  Tag,
} from 'lucide-react';

interface Task {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  labels: string[];
}

export default function DemoBulkPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      key: 'TASK-001',
      title: 'Implement user authentication',
      status: 'In Progress',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-02-15',
      labels: ['backend', 'security'],
    },
    {
      id: '2',
      key: 'TASK-002',
      title: 'Design landing page',
      status: 'To Do',
      priority: 'medium',
      assignee: 'Jane Smith',
      dueDate: '2024-02-20',
      labels: ['design', 'frontend'],
    },
    {
      id: '3',
      key: 'TASK-003',
      title: 'Setup CI/CD pipeline',
      status: 'To Do',
      priority: 'high',
      assignee: 'Bob Wilson',
      dueDate: '2024-02-18',
      labels: ['devops'],
    },
    {
      id: '4',
      key: 'TASK-004',
      title: 'Write API documentation',
      status: 'In Review',
      priority: 'low',
      assignee: 'Alice Johnson',
      dueDate: '2024-02-25',
      labels: ['documentation'],
    },
    {
      id: '5',
      key: 'TASK-005',
      title: 'Optimize database queries',
      status: 'To Do',
      priority: 'medium',
      assignee: 'John Doe',
      dueDate: '2024-02-22',
      labels: ['backend', 'performance'],
    },
  ]);

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

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
    // Simulate updating tasks after bulk operation
    // In a real app, this would refetch data
    console.log('Bulk operation completed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'secondary';
      case 'In Progress':
        return 'default';
      case 'In Review':
        return 'warning';
      case 'Done':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Operations Demo</h1>
        <p className="text-muted-foreground">
          Select multiple tasks to perform bulk actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedTasks.length} of {tasks.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 transition-colors ${
                  selectedTasks.includes(task.id) ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => handleSelectTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-muted-foreground">
                            {task.key}
                          </span>
                          <Badge variant={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant={getPriorityColor(task.priority)}>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{task.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assignee}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <div className="flex gap-1">
                          {task.labels.map((label) => (
                            <Badge key={label} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <BulkOperationsToolbar
        selectedTasks={selectedTasks}
        onClearSelection={handleClearSelection}
        onOperationComplete={handleOperationComplete}
      />
    </div>
  );
}