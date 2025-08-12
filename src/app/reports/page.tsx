'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, Clock, Users, FolderOpen, BarChart3 } from 'lucide-react';
import { TimeTrackingReport } from '@/components/reports/time-tracking-report';
import { ProjectSummaryReport } from '@/components/reports/project-summary-report';
import { TeamVelocityChart } from '@/components/reports/team-velocity-chart';
import { BurndownChart } from '@/components/reports/burndown-chart';
import { CustomReportBuilder } from '@/components/reports/custom-report-builder';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('time-tracking');
  const [stats, setStats] = useState({
    totalTasks: 0,
    timeTracked: 0,
    activeProjects: 0,
    teamVelocity: 0,
  });

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reports/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const exportReport = async (type: string) => {
    try {
      // Map UI report types to API report types
      const reportTypeMap: { [key: string]: string } = {
        'time-tracking': 'team-performance',
        'project-summary': 'project-status',
        'velocity': 'team-performance',
        'burndown': 'project-status',
        'current': activeTab === 'time-tracking' ? 'team-performance' : 
                   activeTab === 'project-summary' ? 'project-status' :
                   activeTab === 'velocity' ? 'team-performance' :
                   activeTab === 'burndown' ? 'project-status' : 'summary',
      };

      const apiReportType = reportTypeMap[type] || 'summary';
      
      const params = new URLSearchParams({
        type: apiReportType,
        format: 'csv',
      });

      if (selectedProject !== 'all') {
        params.append('projectId', selectedProject);
      }

      const url = `/api/reports/export?${params.toString()}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your projects and team performance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('project-summary')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('time-tracking')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.timeTracked / 3600)}h</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('project-summary')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('velocity')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Velocity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teamVelocity}</div>
              <p className="text-xs text-muted-foreground">
                Story points/sprint
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Report Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Configure the data range and scope for reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <input
                  type="date"
                  className="px-3 py-2 border rounded-md"
                  value={dateRange.from.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                />
                <span className="self-center">to</span>
                <input
                  type="date"
                  className="px-3 py-2 border rounded-md"
                  value={dateRange.to.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                />
              </div>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportReport('current')}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
            <TabsTrigger value="project-summary">Project Summary</TabsTrigger>
            <TabsTrigger value="velocity">Team Velocity</TabsTrigger>
            <TabsTrigger value="burndown">Sprint Burndown</TabsTrigger>
            <TabsTrigger value="custom">Custom Report</TabsTrigger>
          </TabsList>

          <TabsContent value="time-tracking" className="space-y-4">
            <TimeTrackingReport 
              dateRange={dateRange} 
              projectId={selectedProject}
              onExport={() => exportReport('time-tracking')}
            />
          </TabsContent>

          <TabsContent value="project-summary" className="space-y-4">
            <ProjectSummaryReport 
              projectId={selectedProject}
              dateRange={dateRange}
              onExport={() => exportReport('project-summary')}
            />
          </TabsContent>

          <TabsContent value="velocity" className="space-y-4">
            <TeamVelocityChart 
              projectId={selectedProject}
              onExport={() => exportReport('velocity')}
            />
          </TabsContent>

          <TabsContent value="burndown" className="space-y-4">
            <BurndownChart 
              projectId={selectedProject}
              onExport={() => exportReport('burndown')}
            />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <CustomReportBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}