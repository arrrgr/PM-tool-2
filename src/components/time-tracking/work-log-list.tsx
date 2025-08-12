'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, Clock } from 'lucide-react';
import { formatDuration, formatDate } from '../../lib/utils';
import { toast } from 'sonner';

interface WorkLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string | null;
  timeSpent: number;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

interface WorkLogListProps {
  taskId: string;
  refresh?: number;
}

export function WorkLogList({ taskId, refresh = 0 }: WorkLogListProps) {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    fetchWorkLogs();
  }, [taskId, refresh]);

  const fetchWorkLogs = async () => {
    try {
      const response = await fetch(`/api/time-tracking?taskId=${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
        const total = data.reduce((sum: number, log: WorkLog) => sum + log.timeSpent, 0);
        setTotalTime(total);
      }
    } catch (error) {
      console.error('Error fetching work logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      const response = await fetch(`/api/time-tracking?id=${logId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Time entry deleted');
        fetchWorkLogs();
      } else {
        toast.error('Failed to delete time entry');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Failed to delete time entry');
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading time logs...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No time logged yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Work Logs</h3>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Total: {formatDuration(totalTime)}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        {logs.map((log) => (
          <Card key={log.id} className="p-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatDuration(log.timeSpent)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    by {log.userName || 'Unknown'}
                  </span>
                </div>
                {log.description && (
                  <p className="text-sm text-muted-foreground">
                    {log.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(log.createdAt)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => deleteLog(log.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}