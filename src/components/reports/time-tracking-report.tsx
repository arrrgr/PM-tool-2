'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { formatDuration } from '../../lib/utils';

interface TimeTrackingReportProps {
  dateRange: { from: Date; to: Date };
  projectId: string;
  onExport: () => void;
}

export function TimeTrackingReport({ dateRange, projectId, onExport }: TimeTrackingReportProps) {
  const [data, setData] = useState<any>({
    byUser: [],
    byProject: [],
    byTask: [],
    totalTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeData();
  }, [dateRange, projectId]);

  const fetchTimeData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });
      if (projectId !== 'all') {
        params.append('projectId', projectId);
      }

      const response = await fetch(`/api/time-tracking?${params}`);
      if (response.ok) {
        const logs = await response.json();
        
        // Process data for visualization
        const byUser: Record<string, number> = {};
        const byProject: Record<string, number> = {};
        const byTask: Record<string, { title: string; time: number }> = {};
        let totalTime = 0;

        logs.forEach((log: any) => {
          const userName = log.userName || 'Unknown';
          const taskTitle = log.taskTitle || 'Untitled';
          
          byUser[userName] = (byUser[userName] || 0) + log.timeSpent;
          byTask[log.taskId] = { title: taskTitle, time: (byTask[log.taskId]?.time || 0) + log.timeSpent };
          totalTime += log.timeSpent;
        });

        setData({
          byUser: Object.entries(byUser).map(([name, time]) => ({ name, time })),
          byProject: Object.entries(byProject).map(([name, time]) => ({ name, time })),
          byTask: Object.entries(byTask).map(([id, data]) => ({ id, ...data })),
          totalTime,
        });
      }
    } catch (error) {
      console.error('Error fetching time data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading time tracking data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Time Tracking Report</h3>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.byUser.map((item: any) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{formatDuration(item.time)}</span>
                </div>
              ))}
              {data.byUser.length === 0 && (
                <p className="text-sm text-muted-foreground">No time logged</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Tasks by Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.byTask.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-sm truncate flex-1 mr-2">{item.title}</span>
                  <span className="text-sm font-medium">{formatDuration(item.time)}</span>
                </div>
              ))}
              {data.byTask.length === 0 && (
                <p className="text-sm text-muted-foreground">No time logged</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Time Logged</p>
              <p className="text-2xl font-bold">{formatDuration(data.totalTime)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Contributors</p>
              <p className="text-2xl font-bold">{data.byUser.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Worked On</p>
              <p className="text-2xl font-bold">{data.byTask.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}