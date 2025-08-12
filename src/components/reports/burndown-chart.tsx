'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface BurndownChartProps {
  projectId: string;
  onExport: () => void;
}

export function BurndownChart({ projectId, onExport }: BurndownChartProps) {
  const days = [
    { day: 'Day 1', ideal: 100, actual: 100 },
    { day: 'Day 2', ideal: 90, actual: 95 },
    { day: 'Day 3', ideal: 80, actual: 88 },
    { day: 'Day 4', ideal: 70, actual: 75 },
    { day: 'Day 5', ideal: 60, actual: 68 },
    { day: 'Day 6', ideal: 50, actual: 55 },
    { day: 'Day 7', ideal: 40, actual: 45 },
    { day: 'Day 8', ideal: 30, actual: 38 },
    { day: 'Day 9', ideal: 20, actual: 25 },
    { day: 'Day 10', ideal: 10, actual: 15 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprint Burndown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-sm text-muted-foreground">Points Remaining</p>
              <p className="text-2xl font-bold">15</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Days Left</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Velocity Needed</p>
              <p className="text-2xl font-bold">7.5/day</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>Ideal Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Actual Progress</span>
              </div>
            </div>
            
            <div className="relative h-48 mt-4">
              {/* Simplified chart visualization */}
              <div className="absolute inset-0 border-l border-b border-muted-foreground/20" />
              {days.map((day, index) => (
                <div
                  key={day.day}
                  className="absolute bottom-0"
                  style={{ left: `${index * 10}%` }}
                >
                  <div
                    className="w-1 bg-blue-500 opacity-50"
                    style={{ height: `${day.ideal * 1.8}px` }}
                  />
                  <div
                    className="w-1 bg-green-500 ml-1"
                    style={{ height: `${day.actual * 1.8}px` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}