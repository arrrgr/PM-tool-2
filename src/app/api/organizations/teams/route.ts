import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { teams, teamMembers } from '@/server/db/schema-organization';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;

    // Get all teams for the organization with member counts
    const allTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        parentTeamId: teams.parentTeamId,
        leaderId: teams.leaderId,
        leaderName: users.name,
        isActive: teams.isActive,
        createdAt: teams.createdAt,
      })
      .from(teams)
      .leftJoin(users, eq(teams.leaderId, users.id))
      .where(eq(teams.organizationId, organizationId));

    // Get member counts for each team
    const teamMemberCounts = await db
      .select({
        teamId: teamMembers.teamId,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(teamMembers)
      .groupBy(teamMembers.teamId);

    // Combine teams with member counts
    const teamsWithCounts = allTeams.map(team => ({
      ...team,
      memberCount: teamMemberCounts.find(tm => tm.teamId === team.id)?.count || 0,
    }));

    return NextResponse.json(teamsWithCounts);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    // Check if user has permission to create teams
    if (user?.role !== 'admin' && user?.role !== 'owner') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, parentTeamId, leaderId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Create the team
    const team = await db.insert(teams).values({
      id: nanoid(),
      organizationId,
      name,
      description,
      parentTeamId,
      leaderId,
    }).returning();

    // If leader is specified, add them as a team member
    if (leaderId) {
      await db.insert(teamMembers).values({
        teamId: team[0].id,
        userId: leaderId,
        role: 'lead',
      }).onConflictDoNothing();
    }

    return NextResponse.json(team[0]);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (user?.role !== 'admin' && user?.role !== 'owner') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, leaderId, isActive } = body;

    // Update the team
    const updatedTeam = await db
      .update(teams)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(leaderId !== undefined && { leaderId }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teams.id, teamId),
          eq(teams.organizationId, organizationId)
        )
      )
      .returning();

    return NextResponse.json(updatedTeam[0]);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (user?.role !== 'admin' && user?.role !== 'owner') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Soft delete by setting isActive to false
    await db
      .update(teams)
      .set({ isActive: false })
      .where(
        and(
          eq(teams.id, teamId),
          eq(teams.organizationId, organizationId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}