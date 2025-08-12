'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TeamVelocityChartProps {
  projectId: string;
  onExport: () => void;
}

export function TeamVelocityChart({ projectId, onExport }: TeamVelocityChartProps) {
  const sprints = [
    { name: 'Sprint 1', completed: 45, committed: 50 },
    { name: 'Sprint 2', completed: 52, committed: 55 },
    { name: 'Sprint 3', completed: 48, committed: 50 },
    { name: 'Sprint 4', completed: 58, committed: 60 },
    { name: 'Sprint 5', completed: 55, committed: 55 },
  ];

  const averageVelocity = Math.round(
    sprints.reduce((sum, s) => sum + s.completed, 0) / sprints.length
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Velocity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Average Velocity</p>
            <p className="text-3xl font-bold">{averageVelocity} points/sprint</p>
          </div>
          
          <div className="space-y-2">
            {sprints.map((sprint) => (
              <div key={sprint.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{sprint.name}</span>
                  <span>{sprint.completed}/{sprint.committed} points</span>
                </div>
                <div className="relative h-4 bg-muted rounded">
                  <div
                    className="absolute h-full bg-primary rounded"
                    style={{ width: `${(sprint.completed / sprint.committed) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}