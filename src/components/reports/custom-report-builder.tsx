'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Plus, Save, Play } from 'lucide-react';

export function CustomReportBuilder() {
  const [reportName, setReportName] = useState('');
  const [dataSource, setDataSource] = useState('tasks');
  const [filters, setFilters] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState('');
  const [aggregation, setAggregation] = useState('count');

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const runReport = () => {
    console.log('Running report with:', {
      name: reportName,
      dataSource,
      filters,
      groupBy,
      aggregation,
    });
  };

  const saveReport = () => {
    console.log('Saving report:', reportName);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
          <CardDescription>
            Create custom reports with your specific requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="Enter report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-source">Data Source</Label>
              <Select value={dataSource} onValueChange={setDataSource}>
                <SelectTrigger id="data-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Tasks</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="time">Time Logs</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Filters</Label>
              <Button size="sm" variant="outline" onClick={addFilter}>
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </Button>
            </div>
            
            <div className="space-y-2">
              {filters.map((filter, index) => (
                <div key={index} className="flex gap-2">
                  <Select value={filter.field} onValueChange={(v) => {
                    const newFilters = [...filters];
                    newFilters[index].field = v;
                    setFilters(newFilters);
                  }}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="assignee">Assignee</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filter.operator} onValueChange={(v) => {
                    const newFilters = [...filters];
                    newFilters[index].operator = v;
                    setFilters(newFilters);
                  }}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="not_equals">Not Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) => {
                      const newFilters = [...filters];
                      newFilters[index].value = e.target.value;
                      setFilters(newFilters);
                    }}
                  />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFilter(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              
              {filters.length === 0 && (
                <p className="text-sm text-muted-foreground">No filters added</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="group-by">Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger id="group-by">
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="assignee">Assignee</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aggregation">Aggregation</Label>
              <Select value={aggregation} onValueChange={setAggregation}>
                <SelectTrigger id="aggregation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="min">Minimum</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runReport}>
              <Play className="h-4 w-4 mr-2" />
              Run Report
            </Button>
            <Button variant="outline" onClick={saveReport}>
              <Save className="h-4 w-4 mr-2" />
              Save Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report results would appear here */}
      <Card>
        <CardHeader>
          <CardTitle>Report Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure and run the report to see results here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}