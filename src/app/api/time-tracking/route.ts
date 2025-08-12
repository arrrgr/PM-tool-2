import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { workLogs, tasks, users } from '@/server/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let conditions = [];
    
    if (taskId) {
      conditions.push(eq(workLogs.taskId, taskId));
    }
    
    if (userId) {
      conditions.push(eq(workLogs.userId, userId));
    }
    
    if (startDate) {
      conditions.push(gte(workLogs.startTime, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(workLogs.endTime, new Date(endDate)));
    }

    const logs = await db
      .select({
        id: workLogs.id,
        taskId: workLogs.taskId,
        userId: workLogs.userId,
        userName: users.name,
        taskTitle: tasks.title,
        timeSpent: workLogs.timeSpent,
        description: workLogs.description,
        startTime: workLogs.startTime,
        endTime: workLogs.endTime,
        createdAt: workLogs.createdAt,
      })
      .from(workLogs)
      .leftJoin(users, eq(workLogs.userId, users.id))
      .leftJoin(tasks, eq(workLogs.taskId, tasks.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(workLogs.createdAt));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching work logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, timeSpent, description, startTime, endTime } = body;

    if (!taskId || !timeSpent) {
      return NextResponse.json(
        { error: 'Task ID and time spent are required' },
        { status: 400 }
      );
    }

    const logId = uuidv4();

    const [newLog] = await db
      .insert(workLogs)
      .values({
        id: logId,
        taskId,
        userId: session.user.id,
        timeSpent,
        description,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
      })
      .returning();

    // Update task's total time spent
    const task = await db
      .select({ timeSpent: tasks.timeSpent })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (task[0]) {
      const currentTimeSpent = task[0].timeSpent || 0;
      await db
        .update(tasks)
        .set({ 
          timeSpent: currentTimeSpent + timeSpent,
          updatedAt: new Date()
        })
        .where(eq(tasks.id, taskId));
    }

    return NextResponse.json(newLog);
  } catch (error) {
    console.error('Error creating work log:', error);
    return NextResponse.json(
      { error: 'Failed to create work log' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');

    if (!logId) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    // Get the log to update task time
    const [log] = await db
      .select()
      .from(workLogs)
      .where(eq(workLogs.id, logId))
      .limit(1);

    if (!log) {
      return NextResponse.json(
        { error: 'Work log not found' },
        { status: 404 }
      );
    }

    // Only allow deletion by the user who created it
    if (log.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this log' },
        { status: 403 }
      );
    }

    // Delete the log
    await db.delete(workLogs).where(eq(workLogs.id, logId));

    // Update task's total time spent
    const task = await db
      .select({ timeSpent: tasks.timeSpent })
      .from(tasks)
      .where(eq(tasks.id, log.taskId))
      .limit(1);

    if (task[0]) {
      const currentTimeSpent = task[0].timeSpent || 0;
      await db
        .update(tasks)
        .set({ 
          timeSpent: Math.max(0, currentTimeSpent - log.timeSpent),
          updatedAt: new Date()
        })
        .where(eq(tasks.id, log.taskId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work log:', error);
    return NextResponse.json(
      { error: 'Failed to delete work log' },
      { status: 500 }
    );
  }
}