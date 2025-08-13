import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users in the organization
    const orgUsers = await db.query.users.findMany({
      where: eq(users.organizationId, session.user.organizationId),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        organizationId: true,
      },
    });

    return NextResponse.json(orgUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}