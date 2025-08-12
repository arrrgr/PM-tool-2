import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { organizations, users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or owner
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description } = body;

    // Validate input
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ 
        error: 'Slug must contain only lowercase letters, numbers, and hyphens' 
      }, { status: 400 });
    }

    // Update organization
    const updatedOrg = await db
      .update(organizations)
      .set({
        name,
        slug,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, session.user.organizationId))
      .returning();

    if (!updatedOrg.length) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      organization: updatedOrg[0] 
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 401 });
    }

    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, session.user.organizationId),
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}