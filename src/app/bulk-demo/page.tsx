'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, User, AlertCircle } from 'lucide-react';

export default function BulkDemoPage() {
  const [tasks] = useState([
    {
      id: '1',
      title: 'Implement user authentication',
      status: 'In Progress',
      priority: 'high',
      assignee: 'John Doe',
    },
    {
      id: '2',
      title: 'Design landing page',
      status: 'To Do',
      priority: 'medium',
      assignee: 'Jane Smith',
    },
    {
      id: '3',
      title: 'Setup CI/CD pipeline',
      status: 'To Do',
      priority: 'high',
      assignee: 'Bob Wilson',
    },
    {
      id: '4',
      title: 'Write API documentation',
      status: 'In Review',
      priority: 'low',
      assignee: 'Alice Johnson',
    },
  ]);

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAll = () => {
    setSelectedTasks(tasks.map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTasks([]);
  };

  const bulkUpdateStatus = (status: string) => {
    alert(`Updating ${selectedTasks.length} task(s) to ${status}`);
    clearSelection();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Bulk Operations Demo</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tasks</CardTitle>
            <div className="flex gap-2">
              <span className="text-sm text-gray-500">
                {selectedTasks.length} selected
              </span>
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`border rounded p-4 cursor-pointer transition-colors ${
                  selectedTasks.includes(task.id) ? 'bg-blue-50 border-blue-300' : ''
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge>{task.status}</Badge>
                      <Badge variant="outline">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                        {task.assignee}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTasks.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border shadow-lg rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Badge>{selectedTasks.length} selected</Badge>
            <Button
              size="sm"
              onClick={() => bulkUpdateStatus('Done')}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark as Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkUpdateStatus('In Progress')}
            >
              Mark In Progress
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm(`Delete ${selectedTasks.length} task(s)?`)) {
                  alert('Tasks deleted');
                  clearSelection();
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}