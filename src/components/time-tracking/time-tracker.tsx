'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Play, Pause, Clock } from 'lucide-react';
import { formatDuration } from '../../lib/utils';

interface TimeTrackerProps {
  taskId: string;
  onTimeLogged?: () => void;
}

export function TimeTracker({ taskId, onTimeLogged }: TimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [logId, setLogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for active timer on mount
  useEffect(() => {
    checkActiveTimer();
  }, [taskId]);

  // Update elapsed time every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const checkActiveTimer = async () => {
    try {
      const response = await fetch(`/api/time-tracking/timer?taskId=${taskId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isRunning) {
          setIsRunning(true);
          setLogId(data.logId);
          setElapsed(data.elapsed || 0);
        }
      }
    } catch (error) {
      console.error('Error checking timer:', error);
    }
  };

  const startTimer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsRunning(true);
        setLogId(data.logId);
        setElapsed(0);
      }
    } catch (error) {
      console.error('Error starting timer:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async () => {
    if (!logId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId }),
      });

      if (response.ok) {
        setIsRunning(false);
        setLogId(null);
        setElapsed(0);
        onTimeLogged?.();
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className="font-mono text-sm">
        {formatDuration(elapsed)}
      </span>
      <Button
        size="sm"
        variant={isRunning ? "destructive" : "default"}
        onClick={isRunning ? stopTimer : startTimer}
        disabled={loading}
      >
        {isRunning ? (
          <>
            <Pause className="h-3 w-3 mr-1" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-3 w-3 mr-1" />
            Start
          </>
        )}
      </Button>
    </div>
  );
}