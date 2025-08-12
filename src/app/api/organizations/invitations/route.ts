import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/server/auth';
import { db } from '@/server/db';
import { organizationInvitations, users } from '@/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 });
    }

    // Get all invitations for the organization
    const invitations = await db
      .select({
        id: organizationInvitations.id,
        email: organizationInvitations.email,
        role: organizationInvitations.role,
        status: organizationInvitations.status,
        expiresAt: organizationInvitations.expiresAt,
        createdAt: organizationInvitations.createdAt,
        invitedBy: users.name,
      })
      .from(organizationInvitations)
      .leftJoin(users, eq(organizationInvitations.invitedBy, users.id))
      .where(eq(organizationInvitations.organizationId, user.organizationId))
      .orderBy(desc(organizationInvitations.createdAt));

    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 });
    }

    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'owner') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists in organization
    const existingUser = await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        eq(users.organizationId, user.organizationId)
      ),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already in organization' },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const existingInvite = await db.query.organizationInvitations.findFirst({
      where: and(
        eq(organizationInvitations.email, email),
        eq(organizationInvitations.organizationId, user.organizationId),
        eq(organizationInvitations.status, 'pending')
      ),
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 400 }
      );
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await db.insert(organizationInvitations).values({
      id: nanoid(),
      organizationId: user.organizationId,
      email,
      role,
      invitedBy: session.user.id,
      token,
      expiresAt,
    }).returning();

    // TODO: Send invitation email
    // For now, we'll return the invitation link
    const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${token}`;

    return NextResponse.json({
      invitation: invitation[0],
      inviteLink, // In production, this would be sent via email
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('id');

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.organizationId || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Cancel the invitation
    await db
      .update(organizationInvitations)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(organizationInvitations.id, invitationId),
          eq(organizationInvitations.organizationId, user.organizationId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}