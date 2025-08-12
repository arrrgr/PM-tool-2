import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { tasks, projects, users } from '@/server/db/schema';
import { eq, and, or, gte, lte, desc, asc } from 'drizzle-orm';

function generateCSV(data: any[], columns: string[]): string {
  const headers = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col];
      // Escape quotes and wrap in quotes if contains comma or newline
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
    const format = searchParams.get('format') || 'csv';
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query filters
    const conditions = [eq(tasks.organizationId, session.user.organizationId)];
    
    if (projectId) conditions.push(eq(tasks.projectId, projectId));
    if (assigneeId) conditions.push(eq(tasks.assigneeId, assigneeId));
    if (status) conditions.push(eq(tasks.status, status));
    if (priority) conditions.push(eq(tasks.priority, priority));
    if (startDate) conditions.push(gte(tasks.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(tasks.createdAt, new Date(endDate)));

    // Fetch tasks with related data
    const tasksData = await db
      .select({
        key: tasks.key,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        type: tasks.type,
        storyPoints: tasks.storyPoints,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        projectName: projects.name,
        projectKey: projects.key,
        assigneeName: users.name,
        assigneeEmail: users.email,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt));

    // Format data for export
    const exportData = tasksData.map(task => ({
      'Task Key': task.key,
      'Title': task.title,
      'Description': task.description || '',
      'Project': task.projectName || '',
      'Status': task.status || 'To Do',
      'Priority': task.priority || 'Medium',
      'Type': task.type || 'Task',
      'Story Points': task.storyPoints || '',
      'Assignee': task.assigneeName || task.assigneeEmail || 'Unassigned',
      'Due Date': task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      'Created': task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : '',
      'Updated': task.updatedAt ? new Date(task.updatedAt).toISOString().split('T')[0] : '',
    }));

    if (format === 'csv') {
      const csv = generateCSV(exportData, Object.keys(exportData[0] || {}));
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="tasks-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'json') {
      return NextResponse.json(exportData);
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting tasks:', error);
    return NextResponse.json(
      { error: 'Failed to export tasks' },
      { status: 500 }
    );
  }
}