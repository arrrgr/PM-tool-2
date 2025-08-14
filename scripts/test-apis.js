// Use native fetch in Node 18+

async function testAPIs() {
  const baseUrl = 'http://localhost:3003';
  
  console.log('Testing API endpoints...\n');
  
  // First, let's check if we can access the API without auth
  console.log('1. Testing /api/projects without auth:');
  try {
    const response = await fetch(`${baseUrl}/api/projects`);
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test task creation directly
  console.log('\n2. Testing /api/tasks POST without auth:');
  try {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Task',
        projectId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
        priority: 'medium',
        type: 'task',
        status: 'To Do'
      })
    });
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test team creation
  console.log('\n3. Testing /api/teams POST without auth:');
  try {
    const response = await fetch(`${baseUrl}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Team',
        description: 'Test team description'
      })
    });
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test role creation
  console.log('\n4. Testing /api/roles POST without auth:');
  try {
    const response = await fetch(`${baseUrl}/api/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Role',
        description: 'Test role description',
        permissions: ['project:view', 'task:view']
      })
    });
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
}

testAPIs().catch(console.error);