import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/server/auth';
import { db } from '@/server/db';
import { organizationInvitations, users } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find invitation by token
    const invitation = await db.query.organizationInvitations.findFirst({
      where: and(
        eq(organizationInvitations.token, token),
        eq(organizationInvitations.status, 'pending')
      ),
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expiresAt)) {
      // Mark as expired
      await db
        .update(organizationInvitations)
        .set({ status: 'expired' })
        .where(eq(organizationInvitations.id, invitation.id));

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check if user email matches invitation email
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.email !== invitation.email) {
      return NextResponse.json(
        { error: 'Invitation email does not match your account' },
        { status: 400 }
      );
    }

    // Update user's organization and role
    await db
      .update(users)
      .set({
        organizationId: invitation.organizationId,
        role: invitation.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Mark invitation as accepted
    await db
      .update(organizationInvitations)
      .set({
        status: 'accepted',
        acceptedAt: new Date(),
      })
      .where(eq(organizationInvitations.id, invitation.id));

    return NextResponse.json({
      success: true,
      organizationId: invitation.organizationId,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}