// Set env vars before importing anything
process.env.DATABASE_URL = "postgresql://localhost:5432/pmtool";
process.env.NEXTAUTH_SECRET = "dev-secret-key-123";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.SKIP_ENV_VALIDATION = "true";

const bcrypt = require('bcryptjs');

async function testDrizzleAuth() {
  try {
    // Import after setting env vars
    const { db } = require('../src/server/db');
    const { users } = require('../src/server/db/schema');
    const { eq } = require('drizzle-orm');
    
    const email = 'test@test.com';
    const password = 'test123';
    
    console.log('🔍 Testing Drizzle ORM authentication...');
    console.log('Email:', email);
    console.log('Password:', password);
    
    // Query user using Drizzle (same as auth.ts)
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (!user) {
      console.log('❌ User not found via Drizzle!');
      
      // List all users via Drizzle
      const allUsers = await db.query.users.findMany();
      console.log('\nUsers found via Drizzle:');
      allUsers.forEach(u => {
        console.log(`  • ${u.email} (has password: ${!!u.hashedPassword})`);
      });
      return;
    }
    
    console.log('\n✅ User found via Drizzle:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Has hashedPassword:', !!user.hashedPassword);
    console.log('  Organization ID:', user.organizationId);
    console.log('  Role:', user.role);
    
    if (!user.hashedPassword) {
      console.log('\n❌ User has no password!');
      return;
    }
    
    // Test password (same as auth.ts)
    console.log('\n🔐 Testing bcrypt.compare...');
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    console.log('Result:', passwordMatch ? '✅ MATCH' : '❌ NO MATCH');
    
    // Test the exact auth flow
    console.log('\n📋 Simulating exact auth.ts flow:');
    if (!user || !user.hashedPassword) {
      console.log('Would return null (no user or password)');
    } else {
      const match = await bcrypt.compare(password, user.hashedPassword);
      if (!match) {
        console.log('Would return null (password mismatch)');
      } else {
        console.log('✅ Would return user object - AUTH SHOULD WORK!');
        console.log('Returned user:', {
          id: user.id,
          name: user.name,
          email: user.email,
          organizationId: user.organizationId,
          role: user.role ?? 'member',
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDrizzleAuth();