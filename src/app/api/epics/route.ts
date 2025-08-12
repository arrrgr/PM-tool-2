import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { tasks, projects, users } from '@/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateId } from 'lucia';

// GET: List all epics in a project
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const epics = await db
      .select({
        id: tasks.id,
        key: tasks.key,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        progress: tasks.progress,
        storyPoints: tasks.storyPoints,
        dueDate: tasks.dueDate,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(
        and(
          eq(tasks.projectId, projectId),
          eq(tasks.isEpic, true),
          eq(tasks.isArchived, false)
        )
      )
      .orderBy(desc(tasks.createdAt));

    // For each epic, get the count of child tasks
    const epicsWithCounts = await Promise.all(
      epics.map(async (epic) => {
        const [taskCount] = await db
          .select({ count: tasks.id })
          .from(tasks)
          .where(
            and(
              eq(tasks.parentTaskId, epic.id),
              eq(tasks.isArchived, false)
            )
          );

        return {
          ...epic,
          taskCount: taskCount?.count || 0,
        };
      })
    );

    return NextResponse.json(epicsWithCounts);
  } catch (error) {
    console.error('Error fetching epics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch epics' },
      { status: 500 }
    );
  }
}

// POST: Create a new epic
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      projectId,
      title,
      description,
      priority,
      assigneeId,
      dueDate,
      storyPoints
    } = body;

    // Get project details for key generation
    const [project] = await db
      .select({ key: projects.key })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Generate epic key (project key + number)
    const [lastTask] = await db
      .select({ key: tasks.key })
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(tasks.createdAt))
      .limit(1);

    let epicNumber = 1;
    if (lastTask) {
      const match = lastTask.key.match(/-(\d+)$/);
      if (match) {
        epicNumber = parseInt(match[1]) + 1;
      }
    }

    const epicKey = `${project.key}-${epicNumber}`;

    // Create epic
    const [newEpic] = await db
      .insert(tasks)
      .values({
        id: generateId(),
        key: epicKey,
        title,
        description,
        projectId,
        isEpic: true,
        type: 'epic',
        status: 'To Do',
        priority: priority || 'medium',
        progress: 0,
        assigneeId,
        reporterId: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        storyPoints,
      })
      .returning();

    return NextResponse.json(newEpic);
  } catch (error) {
    console.error('Error creating epic:', error);
    return NextResponse.json(
      { error: 'Failed to create epic' },
      { status: 500 }
    );
  }
}

// PATCH: Convert task to epic or vice versa
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, convertToEpic } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Check if task has parent (subtasks cannot be converted to epics)
    const [task] = await db
      .select({ parentTaskId: tasks.parentTaskId })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (convertToEpic && task.parentTaskId) {
      return NextResponse.json(
        { error: 'Subtasks cannot be converted to epics' },
        { status: 400 }
      );
    }

    // Update task
    const [updatedTask] = await db
      .update(tasks)
      .set({
        isEpic: convertToEpic,
        type: convertToEpic ? 'epic' : 'task',
        progress: convertToEpic ? 0 : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error converting task:', error);
    return NextResponse.json(
      { error: 'Failed to convert task' },
      { status: 500 }
    );
  }
}