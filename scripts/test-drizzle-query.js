// Test what Drizzle returns
import { db } from '../src/server/db/index.js';
import { users } from '../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

async function testDrizzleQuery() {
  try {
    console.log('🔍 Testing Drizzle query...\n');
    
    // Query using Drizzle
    const user = await db.query.users.findFirst({
      where: eq(users.email, 'arthur@pmtool.demo'),
    });
    
    console.log('User object properties:');
    console.log(Object.keys(user));
    
    console.log('\nUser data:');
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      hashedPassword: user.hashedPassword,
      password: user.password,
      role: user.role,
      organizationId: user.organizationId,
    });
    
    console.log('\nDoes user.hashedPassword exist?', user.hashedPassword !== undefined);
    console.log('Does user.password exist?', user.password !== undefined);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDrizzleQuery();