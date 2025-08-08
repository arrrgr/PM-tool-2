import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { projects } from '@/server/db/schema';
import { generateProjectKey } from '@/lib/auth';

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, priority } = createProjectSchema.parse(body);

    const projectKey = generateProjectKey(name);

    const projectData = {
      id: randomUUID(),
      name,
      key: projectKey,
      description: description || null,
      organizationId: session.user.organizationId,
      leaderId: session.user.id,
      status: 'active',
      priority,
      settings: {
        taskStatuses: ['To Do', 'In Progress', 'In Review', 'Done'],
        workflow: 'kanban',
        permissions: {
          admin: ['create', 'read', 'update', 'delete'],
          member: ['create', 'read', 'update'],
        },
      },
    };

    const [project] = await db.insert(projects).values(projectData).returning();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationProjects = await db.query.projects.findMany({
      where: (projects, { eq, and }) => and(
        eq(projects.organizationId, session.user.organizationId),
        eq(projects.isArchived, false)
      ),
      with: {
        leader: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });

    return NextResponse.json(organizationProjects);
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}