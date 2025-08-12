import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { tasks, projects, workLogs } from '@/server/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total tasks count
    const taskCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks);

    // Get active projects count
    const projectCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.status, 'active'));

    // Get time tracked this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const timeTracked = await db
      .select({ total: sql<number>`sum(${workLogs.timeSpent})` })
      .from(workLogs)
      .where(gte(workLogs.createdAt, startOfMonth));

    // Calculate team velocity (placeholder)
    const velocity = 87; // Would calculate from sprint data

    return NextResponse.json({
      totalTasks: Number(taskCount[0]?.count) || 0,
      activeProjects: Number(projectCount[0]?.count) || 0,
      timeTracked: Number(timeTracked[0]?.total) || 0,
      teamVelocity: velocity,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}