import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { workLogs } from '@/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Get active timer for a task
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Find active timer (has startTime but no endTime)
    const [activeTimer] = await db
      .select()
      .from(workLogs)
      .where(
        and(
          eq(workLogs.taskId, taskId),
          eq(workLogs.userId, session.user.id),
          isNull(workLogs.endTime)
        )
      )
      .limit(1);

    if (activeTimer) {
      // Calculate elapsed time
      const startTime = new Date(activeTimer.startTime!);
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      
      return NextResponse.json({
        isRunning: true,
        logId: activeTimer.id,
        startTime: activeTimer.startTime,
        elapsed
      });
    }

    return NextResponse.json({ isRunning: false });
  } catch (error) {
    console.error('Error fetching timer status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer status' },
      { status: 500 }
    );
  }
}

// Start timer
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Check if timer is already running
    const [existingTimer] = await db
      .select()
      .from(workLogs)
      .where(
        and(
          eq(workLogs.taskId, taskId),
          eq(workLogs.userId, session.user.id),
          isNull(workLogs.endTime)
        )
      )
      .limit(1);

    if (existingTimer) {
      return NextResponse.json(
        { error: 'Timer is already running for this task' },
        { status: 400 }
      );
    }

    const logId = uuidv4();
    const startTime = new Date();

    const [newLog] = await db
      .insert(workLogs)
      .values({
        id: logId,
        taskId,
        userId: session.user.id,
        timeSpent: 0,
        startTime,
        description: 'Timer session',
      })
      .returning();

    return NextResponse.json({
      logId: newLog.id,
      startTime: newLog.startTime,
      isRunning: true
    });
  } catch (error) {
    console.error('Error starting timer:', error);
    return NextResponse.json(
      { error: 'Failed to start timer' },
      { status: 500 }
    );
  }
}

// Stop timer
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { logId, description } = body;

    if (!logId) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    // Get the log
    const [log] = await db
      .select()
      .from(workLogs)
      .where(
        and(
          eq(workLogs.id, logId),
          eq(workLogs.userId, session.user.id)
        )
      )
      .limit(1);

    if (!log) {
      return NextResponse.json(
        { error: 'Timer not found' },
        { status: 404 }
      );
    }

    if (log.endTime) {
      return NextResponse.json(
        { error: 'Timer is already stopped' },
        { status: 400 }
      );
    }

    const endTime = new Date();
    const startTime = new Date(log.startTime!);
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Update the log
    const [updatedLog] = await db
      .update(workLogs)
      .set({
        endTime,
        timeSpent,
        description: description || log.description,
      })
      .where(eq(workLogs.id, logId))
      .returning();

    // Update task's total time spent
    const { tasks } = await import('@/server/db/schema');
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
          timeSpent: currentTimeSpent + timeSpent,
          updatedAt: new Date()
        })
        .where(eq(tasks.id, log.taskId));
    }

    return NextResponse.json({
      ...updatedLog,
      isRunning: false
    });
  } catch (error) {
    console.error('Error stopping timer:', error);
    return NextResponse.json(
      { error: 'Failed to stop timer' },
      { status: 500 }
    );
  }
}