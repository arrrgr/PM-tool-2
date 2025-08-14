#!/usr/bin/env node

/**
 * Comprehensive testing script for PM Tool
 * Tests: Task Creation, Team Creation, Drag & Drop, Role Assignment
 */

const BASE_URL = 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(50));
  log(`TEST: ${testName}`, 'cyan');
  console.log('='.repeat(50));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testEndpoint(name, options) {
  try {
    const response = await fetch(`${BASE_URL}${options.path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const status = response.status;
    let responseText = '';
    
    try {
      responseText = await response.text();
    } catch (e) {
      responseText = '<empty response>';
    }

    if (options.expectedStatus && status !== options.expectedStatus) {
      logError(`${name}: Expected status ${options.expectedStatus}, got ${status}`);
      if (responseText) {
        console.log(`  Response: ${responseText.substring(0, 200)}`);
      }
      return false;
    }

    if (status >= 200 && status < 300) {
      logSuccess(`${name}: ${status} - ${options.successMessage || 'Success'}`);
      return true;
    } else if (status === 401) {
      logWarning(`${name}: ${status} - Requires authentication`);
      return null;
    } else {
      logError(`${name}: ${status} - ${responseText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    logError(`${name}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('\n🚀 Starting PM Tool Comprehensive Testing Suite\n', 'magenta');
  
  // Test 1: API Health Check
  logTest('API Health Check');
  await testEndpoint('Health Check', {
    path: '/api/health',
    expectedStatus: 200,
    successMessage: 'API is healthy',
  });

  // Test 2: Task Creation API
  logTest('Task Creation API');
  
  await testEndpoint('Create Task (No Auth)', {
    path: '/api/tasks',
    method: 'POST',
    body: {
      title: 'Test Task',
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      priority: 'medium',
      type: 'task',
      status: 'To Do',
    },
    successMessage: 'Task created successfully',
  });

  // Test 3: Team Creation API
  logTest('Team Creation API');
  
  await testEndpoint('Create Team (No Auth)', {
    path: '/api/organizations/teams',
    method: 'POST',
    body: {
      name: 'Engineering Team',
      description: 'Main engineering team',
    },
    successMessage: 'Team created successfully',
  });

  // Test 4: Get Teams
  logTest('Team Fetching');
  
  await testEndpoint('Get Teams', {
    path: '/api/organizations/teams',
    method: 'GET',
    successMessage: 'Teams fetched successfully',
  });

  // Test 5: Get Team Members
  logTest('Team Members API');
  
  await testEndpoint('Get Team Members', {
    path: '/api/team',
    method: 'GET',
    successMessage: 'Team members fetched successfully',
  });

  // Test 6: Projects API
  logTest('Projects API');
  
  await testEndpoint('Get Projects', {
    path: '/api/projects',
    method: 'GET',
    successMessage: 'Projects fetched successfully',
  });

  // Test 7: Roles API
  logTest('Roles API');
  
  await testEndpoint('Get Roles', {
    path: '/api/roles',
    method: 'GET',
    successMessage: 'Roles fetched successfully',
  });

  await testEndpoint('Create Role (No Auth)', {
    path: '/api/roles',
    method: 'POST',
    body: {
      name: 'Developer',
      description: 'Software Developer Role',
      permissions: ['project:view', 'task:create', 'task:edit'],
    },
    successMessage: 'Role created successfully',
  });

  // Test 8: Knowledge Base API
  logTest('Knowledge Base API');
  
  await testEndpoint('Get KB Articles', {
    path: '/api/knowledge',
    method: 'GET',
    successMessage: 'Knowledge base articles fetched',
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  log('TEST SUITE COMPLETED', 'magenta');
  console.log('='.repeat(50));
  
  log('\n📋 Summary:', 'blue');
  log('• Task Creation: Check authentication requirements', 'yellow');
  log('• Team Creation: Check authentication requirements', 'yellow');
  log('• Drag & Drop: Requires UI testing with authenticated session', 'yellow');
  log('• Role Assignment: Check authentication requirements', 'yellow');
  
  log('\n💡 Recommendations:', 'blue');
  log('1. Ensure database is running and migrations are applied', 'reset');
  log('2. Create test users with proper authentication', 'reset');
  log('3. Test drag & drop functionality in the browser', 'reset');
  log('4. Verify team creation saves to database', 'reset');
}

// Run the tests
runTests().catch(console.error);