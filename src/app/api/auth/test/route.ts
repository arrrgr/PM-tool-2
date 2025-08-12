import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Testing auth for:', email);
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found',
        debug: { email }
      });
    }
    
    if (!user.hashedPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'User has no password',
        debug: { email, hasPassword: false }
      });
    }
    
    // Test password
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    
    return NextResponse.json({
      success: isValid,
      debug: {
        email,
        hasPassword: true,
        passwordMatches: isValid,
        userId: user.id,
        organizationId: user.organizationId,
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}