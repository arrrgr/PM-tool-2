#!/usr/bin/env node

/**
 * Test login with known credentials
 */

async function testLogin() {
  console.log('🔐 Testing login with admin@test.com / admin123\n');
  
  try {
    // 1. Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const { csrfToken } = await csrfResponse.json();
    console.log('   Got CSRF token:', csrfToken.substring(0, 20) + '...');
    
    // 2. Attempt login
    console.log('\n2️⃣ Attempting login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@test.com',
        password: 'admin123',
        csrfToken: csrfToken,
        callbackUrl: 'http://localhost:3000/dashboard',
        json: 'true',
      }),
      redirect: 'manual',
    });
    
    console.log('   Status:', loginResponse.status);
    console.log('   Headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginResult = await loginResponse.text();
    console.log('   Response:', loginResult);
    
    // Get session cookie
    const setCookie = loginResponse.headers.get('set-cookie');
    if (setCookie) {
      console.log('\n✅ Login successful! Session cookie received.');
      
      // Extract session token
      const sessionMatch = setCookie.match(/authjs.session-token=([^;]+)/);
      if (sessionMatch) {
        const sessionToken = sessionMatch[1];
        console.log('   Session token:', sessionToken.substring(0, 30) + '...');
        
        // 3. Test authenticated request
        console.log('\n3️⃣ Testing authenticated request to /api/debug...');
        const debugResponse = await fetch('http://localhost:3000/api/debug', {
          headers: {
            'Cookie': `authjs.session-token=${sessionToken}`,
          },
        });
        
        const debugData = await debugResponse.json();
        console.log('   Debug response:', JSON.stringify(debugData, null, 2));
        
        if (debugData.hasSession && debugData.user) {
          console.log('\n🎉 SUCCESS! Authentication is working.');
          console.log('   User ID:', debugData.user.id);
          console.log('   Organization ID:', debugData.user.organizationId);
          
          // 4. Test task creation
          console.log('\n4️⃣ Testing task creation...');
          
          // First get a project
          const projectsResponse = await fetch('http://localhost:3000/api/projects', {
            headers: {
              'Cookie': `authjs.session-token=${sessionToken}`,
            },
          });
          
          if (projectsResponse.ok) {
            const projects = await projectsResponse.json();
            if (projects.length > 0) {
              const projectId = projects[0].id;
              console.log('   Using project:', projects[0].name);
              
              const taskResponse = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie': `authjs.session-token=${sessionToken}`,
                },
                body: JSON.stringify({
                  title: 'Test Task from Script',
                  projectId: projectId,
                  priority: 'medium',
                  type: 'task',
                  status: 'To Do',
                }),
              });
              
              console.log('   Task creation status:', taskResponse.status);
              if (taskResponse.ok) {
                const task = await taskResponse.json();
                console.log('   ✅ Task created:', task.key, '-', task.title);
              } else {
                const error = await taskResponse.text();
                console.log('   ❌ Task creation failed:', error);
              }
            } else {
              console.log('   No projects found to test with');
            }
          }
        }
      }
    } else {
      console.log('\n❌ Login failed - no session cookie received');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin().catch(console.error);