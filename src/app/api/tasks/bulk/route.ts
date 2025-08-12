import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { tasks, activityLogs } from '@/server/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskIds, action, data } = body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'No tasks selected' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    let updatedTasks;
    
    switch (action) {
      case 'updateStatus':
        if (!data?.status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }
        updatedTasks = await db
          .update(tasks)
          .set({ 
            status: data.status,
            updatedAt: new Date()
          })
          .where(inArray(tasks.id, taskIds))
          .returning();
        break;

      case 'updateAssignee':
        if (!data?.assigneeId) {
          return NextResponse.json({ error: 'Assignee is required' }, { status: 400 });
        }
        updatedTasks = await db
          .update(tasks)
          .set({ 
            assigneeId: data.assigneeId,
            updatedAt: new Date()
          })
          .where(inArray(tasks.id, taskIds))
          .returning();
        break;

      case 'updatePriority':
        if (!data?.priority) {
          return NextResponse.json({ error: 'Priority is required' }, { status: 400 });
        }
        updatedTasks = await db
          .update(tasks)
          .set({ 
            priority: data.priority,
            updatedAt: new Date()
          })
          .where(inArray(tasks.id, taskIds))
          .returning();
        break;

      case 'addLabels':
        if (!data?.labels || !Array.isArray(data.labels)) {
          return NextResponse.json({ error: 'Labels are required' }, { status: 400 });
        }
        
        // Get existing tasks
        const existingTasks = await db
          .select()
          .from(tasks)
          .where(inArray(tasks.id, taskIds));
        
        // Update each task with merged labels
        updatedTasks = [];
        for (const task of existingTasks) {
          const existingLabels = task.labels || [];
          const mergedLabels = [...new Set([...existingLabels, ...data.labels])];
          
          const [updated] = await db
            .update(tasks)
            .set({ 
              labels: mergedLabels,
              updatedAt: new Date()
            })
            .where(eq(tasks.id, task.id))
            .returning();
          
          updatedTasks.push(updated);
        }
        break;

      case 'moveToProject':
        if (!data?.projectId) {
          return NextResponse.json({ error: 'Project is required' }, { status: 400 });
        }
        updatedTasks = await db
          .update(tasks)
          .set({ 
            projectId: data.projectId,
            updatedAt: new Date()
          })
          .where(inArray(tasks.id, taskIds))
          .returning();
        break;

      case 'archive':
        updatedTasks = await db
          .update(tasks)
          .set({ 
            isArchived: true,
            updatedAt: new Date()
          })
          .where(inArray(tasks.id, taskIds))
          .returning();
        break;

      case 'delete':
        // Soft delete by archiving
        updatedTasks = await db
          .update(tasks)
          .set({ 
            isArchived: true,
            updatedAt: new Date()
          })
          .where(inArray(tasks.id, taskIds))
          .returning();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the bulk operation
    if (updatedTasks && updatedTasks.length > 0) {
      const firstTask = updatedTasks[0];
      if (firstTask?.organizationId) {
        await db.insert(activityLogs).values({
          id: nanoid(),
          entityType: 'task',
          entityId: 'bulk',
          action: `bulk_${action}`,
          userId: session.user.id,
          organizationId: firstTask.organizationId,
          metadata: {
            taskCount: updatedTasks.length,
            taskIds,
            action,
            data
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedTasks?.length || 0,
      tasks: updatedTasks
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}