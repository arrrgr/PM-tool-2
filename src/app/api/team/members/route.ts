import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users, tasks } from '@/server/db/schema';
import { eq, count } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;

    // Get all team members with task counts
    const teamMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .where(eq(users.organizationId, organizationId))
      .orderBy(users.name);

    // Get task counts for each user
    const taskCounts = await db
      .select({
        assigneeId: tasks.assigneeId,
        totalTasks: count(),
      })
      .from(tasks)
      .where(eq(tasks.isArchived, false))
      .groupBy(tasks.assigneeId);

    const taskCountsMap = taskCounts.reduce((acc, { assigneeId, totalTasks }) => {
      if (assigneeId) {
        acc[assigneeId] = totalTasks;
      }
      return acc;
    }, {} as Record<string, number>);

    // Add task counts to team members
    const membersWithTaskCounts = teamMembers.map(member => ({
      ...member,
      taskCount: taskCountsMap[member.id] || 0,
    }));

    return NextResponse.json(membersWithTaskCounts);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}