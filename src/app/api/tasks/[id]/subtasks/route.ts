import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { tasks, users } from '@/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

// GET: Get subtasks of a task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subtasks = await db
      .select({
        id: tasks.id,
        key: tasks.key,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        type: tasks.type,
        storyPoints: tasks.storyPoints,
        dueDate: tasks.dueDate,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
        progress: tasks.progress,
        isEpic: tasks.isEpic,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(
        and(
          eq(tasks.parentTaskId, params.id),
          eq(tasks.isArchived, false)
        )
      );

    return NextResponse.json(subtasks);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' },
      { status: 500 }
    );
  }
}

// POST: Create a subtask
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, assigneeId, priority, dueDate } = body;

    // Get parent task details
    const [parentTask] = await db
      .select({ 
        projectId: tasks.projectId,
        key: tasks.key 
      })
      .from(tasks)
      .where(eq(tasks.id, params.id))
      .limit(1);

    if (!parentTask) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 404 });
    }

    // Generate subtask key
    const [lastSubtask] = await db
      .select({ key: tasks.key })
      .from(tasks)
      .where(eq(tasks.parentTaskId, params.id))
      .orderBy(tasks.createdAt)
      .limit(1);

    let subtaskNumber = 1;
    if (lastSubtask) {
      const match = lastSubtask.key.match(/-(\d+)$/);
      if (match) {
        subtaskNumber = parseInt(match[1]) + 1;
      }
    }

    const subtaskKey = `${parentTask.key}-${subtaskNumber}`;

    // Get organization ID from parent task
    const [parentFullTask] = await db
      .select({ organizationId: tasks.organizationId, isEpic: tasks.isEpic })
      .from(tasks)
      .where(eq(tasks.id, params.id))
      .limit(1);

    // Mark parent as epic if it isn't already
    if (!parentFullTask.isEpic) {
      await db
        .update(tasks)
        .set({ isEpic: true, updatedAt: new Date() })
        .where(eq(tasks.id, params.id));
    }

    // Create subtask
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [newSubtask] = await db
      .insert(tasks)
      .values({
        id: taskId,
        title,
        description,
        key: subtaskKey,
        projectId: parentTask.projectId,
        parentTaskId: params.id,
        assigneeId,
        reporterId: session.user.id,
        priority: priority || 'medium',
        status: 'To Do',
        type: 'sub-task',
        dueDate: dueDate ? new Date(dueDate) : null,
        organizationId: parentFullTask.organizationId,
      })
      .returning();

    // Update parent task progress if needed
    await updateParentProgress(params.id);

    return NextResponse.json(newSubtask);
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    );
  }
}

// Helper function to update parent task progress
async function updateParentProgress(parentId: string) {
  const subtasks = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(
      and(
        eq(tasks.parentTaskId, parentId),
        eq(tasks.isArchived, false)
      )
    );

  if (subtasks.length === 0) return;

  const completedCount = subtasks.filter(t => t.status === 'Done').length;
  const progress = Math.round((completedCount / subtasks.length) * 100);

  await db
    .update(tasks)
    .set({ progress, updatedAt: new Date() })
    .where(eq(tasks.id, parentId));
}