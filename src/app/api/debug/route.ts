import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      hasSession: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        organizationId: session.user.organizationId,
        role: session.user.role,
      } : null,
      message: 'Debug endpoint for checking session',
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Error checking session', details: String(error) },
      { status: 500 }
    );
  }
}