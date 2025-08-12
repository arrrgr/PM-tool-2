'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// Simplified progress bar since Progress component doesn't exist

interface ProjectSummaryReportProps {
  projectId: string;
  dateRange: { from: Date; to: Date };
  onExport: () => void;
}

export function ProjectSummaryReport({ projectId, dateRange, onExport }: ProjectSummaryReportProps) {
  const [summary, setSummary] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    averageTimePerTask: 0,
  });

  useEffect(() => {
    fetchSummary();
  }, [projectId, dateRange]);

  const fetchSummary = async () => {
    // Placeholder data - would fetch from API
    setSummary({
      totalTasks: 45,
      completedTasks: 28,
      inProgressTasks: 12,
      overdueTasks: 3,
      completionRate: 62,
      averageTimePerTask: 4.5,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{summary.totalTasks}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{summary.completedTasks}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{summary.inProgressTasks}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{summary.overdueTasks}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${summary.completionRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{summary.completionRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Time/Task</p>
              <p className="text-2xl font-bold">{summary.averageTimePerTask}h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}