'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  TrendingUp,
  Users,
  HardDrive,
  Activity,
  Download,
  Calendar,
} from 'lucide-react';

export function BillingTab() {
  const [billingInfo] = useState({
    plan: 'Pro',
    status: 'active',
    currentPeriodEnd: '2024-02-29',
    monthlyActiveUsers: 25,
    maxUsers: 50,
    storageUsedMb: 2048,
    maxStorageMb: 10240,
    apiCallsCount: 15000,
    maxApiCalls: 100000,
  });

  const usagePercentage = {
    users: (billingInfo.monthlyActiveUsers / billingInfo.maxUsers) * 100,
    storage: (billingInfo.storageUsedMb / billingInfo.maxStorageMb) * 100,
    api: (billingInfo.apiCallsCount / billingInfo.maxApiCalls) * 100,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            <Badge className="text-lg px-4 py-1" variant="default">
              {billingInfo.plan} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Billing Cycle</span>
                <span className="text-sm font-medium">Monthly</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Billing Date</span>
                <span className="text-sm font-medium">{billingInfo.currentPeriodEnd}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment Method
              </Button>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>
            Monitor your organization's resource usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {billingInfo.monthlyActiveUsers} / {billingInfo.maxUsers}
              </span>
            </div>
            <Progress value={usagePercentage.users} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {(billingInfo.storageUsedMb / 1024).toFixed(1)} GB /{' '}
                {(billingInfo.maxStorageMb / 1024).toFixed(0)} GB
              </span>
            </div>
            <Progress value={usagePercentage.storage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">API Calls</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {billingInfo.apiCallsCount.toLocaleString()} /{' '}
                {billingInfo.maxApiCalls.toLocaleString()}
              </span>
            </div>
            <Progress value={usagePercentage.api} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { date: '2024-01-01', amount: '$99.00', status: 'paid' },
              { date: '2023-12-01', amount: '$99.00', status: 'paid' },
              { date: '2023-11-01', amount: '$99.00', status: 'paid' },
            ].map((invoice, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{invoice.date}</p>
                    <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}