import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { canManageUsers } from '@/lib/permissions';

// Since we're using simple role-based permissions, we'll store custom roles in memory
// In production, you'd store these in the database
let customRoles: any[] = [];

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return custom roles (in production, fetch from database)
    return NextResponse.json(customRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageUsers(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !permissions) {
      return NextResponse.json(
        { error: 'Name and permissions are required' },
        { status: 400 }
      );
    }

    // Create the new role (in production, save to database)
    const newRole = {
      id: `custom_${Date.now()}`,
      name,
      description: description || '',
      permissions,
      isSystem: false,
    };

    customRoles.push(newRole);

    return NextResponse.json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}