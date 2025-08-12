import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { tasks, projects, users, teams, activityLogs } from '@/server/db/schema';
import { eq, and, count, sql, desc } from 'drizzle-orm';

function generateCSV(data: any[], columns: string[]): string {
  const headers = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const format = searchParams.get('format') || 'csv';

    let exportData: any[] = [];
    
    switch (reportType) {
      case 'summary':
        // Organization Summary Report
        const summary = await db
          .select({
            metric: sql<string>`'Total Tasks'`,
            value: count(tasks.id),
          })
          .from(tasks)
          .where(eq(tasks.organizationId, session.user.organizationId))
          .unionAll(
            db
              .select({
                metric: sql<string>`'Open Tasks'`,
                value: count(tasks.id),
              })
              .from(tasks)
              .where(and(
                eq(tasks.organizationId, session.user.organizationId),
                sql`${tasks.status} != 'Done'`
              ))
          )
          .unionAll(
            db
              .select({
                metric: sql<string>`'Completed Tasks'`,
                value: count(tasks.id),
              })
              .from(tasks)
              .where(and(
                eq(tasks.organizationId, session.user.organizationId),
                eq(tasks.status, 'Done')
              ))
          );

        exportData = summary.map(row => ({
          'Metric': row.metric,
          'Value': row.value,
        }));
        break;

      case 'project-status':
        // Project Status Report
        const projectStatus = await db
          .select({
            projectName: projects.name,
            projectKey: projects.key,
            totalTasks: count(tasks.id),
            completedTasks: sql<number>`SUM(CASE WHEN ${tasks.status} = 'Done' THEN 1 ELSE 0 END)`,
            inProgressTasks: sql<number>`SUM(CASE WHEN ${tasks.status} = 'In Progress' THEN 1 ELSE 0 END)`,
            todoTasks: sql<number>`SUM(CASE WHEN ${tasks.status} = 'To Do' OR ${tasks.status} IS NULL THEN 1 ELSE 0 END)`,
          })
          .from(projects)
          .leftJoin(tasks, eq(projects.id, tasks.projectId))
          .where(eq(projects.organizationId, session.user.organizationId))
          .groupBy(projects.id, projects.name, projects.key);

        exportData = projectStatus.map(row => ({
          'Project': row.projectName,
          'Key': row.projectKey,
          'Total Tasks': row.totalTasks,
          'Completed': row.completedTasks || 0,
          'In Progress': row.inProgressTasks || 0,
          'To Do': row.todoTasks || 0,
          'Completion %': row.totalTasks > 0 
            ? Math.round(((row.completedTasks || 0) / row.totalTasks) * 100) 
            : 0,
        }));
        break;

      case 'team-performance':
        // Team Performance Report
        const teamPerformance = await db
          .select({
            userName: users.name,
            userEmail: users.email,
            assignedTasks: count(tasks.id),
            completedTasks: sql<number>`SUM(CASE WHEN ${tasks.status} = 'Done' THEN 1 ELSE 0 END)`,
            highPriorityTasks: sql<number>`SUM(CASE WHEN ${tasks.priority} = 'high' OR ${tasks.priority} = 'urgent' THEN 1 ELSE 0 END)`,
            avgStoryPoints: sql<number>`AVG(${tasks.storyPoints})`,
          })
          .from(users)
          .leftJoin(tasks, eq(users.id, tasks.assigneeId))
          .where(eq(users.organizationId, session.user.organizationId))
          .groupBy(users.id, users.name, users.email);

        exportData = teamPerformance.map(row => ({
          'Team Member': row.userName || row.userEmail,
          'Email': row.userEmail,
          'Assigned Tasks': row.assignedTasks,
          'Completed Tasks': row.completedTasks || 0,
          'High Priority Tasks': row.highPriorityTasks || 0,
          'Avg Story Points': row.avgStoryPoints ? row.avgStoryPoints.toFixed(1) : '0',
          'Completion Rate': row.assignedTasks > 0 
            ? `${Math.round(((row.completedTasks || 0) / row.assignedTasks) * 100)}%`
            : '0%',
        }));
        break;

      case 'activity':
        // Recent Activity Report
        const activities = await db
          .select({
            timestamp: activityLogs.createdAt,
            user: users.name,
            userEmail: users.email,
            action: activityLogs.action,
            entityType: activityLogs.entityType,
            entityId: activityLogs.entityId,
          })
          .from(activityLogs)
          .leftJoin(users, eq(activityLogs.userId, users.id))
          .where(eq(activityLogs.organizationId, session.user.organizationId))
          .orderBy(desc(activityLogs.createdAt))
          .limit(500);

        exportData = activities.map(row => ({
          'Date': row.timestamp ? new Date(row.timestamp).toISOString() : '',
          'User': row.user || row.userEmail || 'System',
          'Action': row.action,
          'Entity Type': row.entityType,
          'Entity ID': row.entityId,
        }));
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'csv') {
      const csv = generateCSV(exportData, Object.keys(exportData[0] || {}));
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'json') {
      return NextResponse.json(exportData);
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}