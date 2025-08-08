import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { tasks, projects } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  type: z.enum(['task', 'feature', 'bug', 'improvement', 'story']).default('task'),
  storyPoints: z.number().min(1).max(100).optional(),
  dueDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, projectId, assigneeId, priority, type, storyPoints, dueDate } = 
      createTaskSchema.parse(body);

    // Verify the project belongs to the user's organization
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.organizationId, session.user.organizationId)
      ),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Generate task key (PROJECT_KEY-NUMBER)
    const existingTasks = await db.query.tasks.findMany({
      where: eq(tasks.projectId, projectId),
      columns: { key: true },
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });

    const taskNumber = existingTasks.length + 1;
    const taskKey = `${project.key}-${taskNumber}`;

    const taskData = {
      id: randomUUID(),
      key: taskKey,
      title,
      description: description || null,
      projectId,
      assigneeId: assigneeId || null,
      reporterId: session.user.id,
      status: 'To Do',
      priority,
      type,
      storyPoints: storyPoints || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    const [task] = await db.insert(tasks).values(taskData).returning();

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}