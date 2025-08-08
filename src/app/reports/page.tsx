import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Analytics and insights about your projects and team performance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Coming Soon Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Task Analytics</span>
              </CardTitle>
              <CardDescription>
                Track task completion rates and velocity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Badge variant="secondary">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Visualize your team's productivity trends
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Project Progress</span>
              </CardTitle>
              <CardDescription>
                Monitor project milestones and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Badge variant="secondary">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Track project delivery timelines
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Performance</span>
              </CardTitle>
              <CardDescription>
                Analyze individual and team metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Badge variant="secondary">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Understand team workload distribution
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Time Tracking</span>
              </CardTitle>
              <CardDescription>
                Time spent on tasks and projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Badge variant="secondary">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Analyze time allocation patterns
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
            <CardDescription>
              These features will be available in the next phase of development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">🚀 Phase 3</Badge>
                <span>Burndown charts and sprint analytics</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">🚀 Phase 3</Badge>
                <span>Custom dashboards and KPI tracking</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">🚀 Phase 3</Badge>
                <span>Export reports to PDF and CSV</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">🚀 Phase 3</Badge>
                <span>Automated reporting and alerts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}