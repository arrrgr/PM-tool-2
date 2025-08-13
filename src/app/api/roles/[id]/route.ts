import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { canManageUsers } from '@/lib/permissions';

// This would be connected to your database in production
let customRoles: any[] = [];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageUsers(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // In production, update in database
    const roleIndex = customRoles.findIndex(r => r.id === params.id);
    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    customRoles[roleIndex] = { ...customRoles[roleIndex], ...body };

    return NextResponse.json(customRoles[roleIndex]);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageUsers(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow deletion of system roles
    if (['admin', 'member', 'viewer'].includes(params.id)) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 400 }
      );
    }

    // In production, delete from database
    customRoles = customRoles.filter(r => r.id !== params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}