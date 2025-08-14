// Script to create a test user and login for testing

const { chromium } = require('playwright');

async function createSessionAndTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🚀 Starting browser test...\n');
  
  try {
    // 1. Navigate to the app
    console.log('1️⃣ Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 2. Check if we need to login
    const currentUrl = page.url();
    console.log('   Current URL:', currentUrl);
    
    if (currentUrl.includes('/auth/signin') || currentUrl.includes('/login')) {
      console.log('   Need to authenticate first');
      
      // Look for demo/test login options
      const demoButton = await page.$('button:has-text("Continue with Demo")');
      if (demoButton) {
        console.log('   Found demo login button');
        await demoButton.click();
        await page.waitForNavigation();
      }
    }
    
    // 3. Test task creation
    console.log('\n2️⃣ Testing task creation...');
    await page.goto('http://localhost:3000/projects');
    await page.waitForTimeout(1000);
    
    // Click on first project if exists
    const projectCard = await page.$('.cursor-pointer');
    if (projectCard) {
      await projectCard.click();
      await page.waitForTimeout(1000);
      
      // Try to create a task
      const createButton = await page.$('button:has-text("Create Task")');
      if (createButton) {
        console.log('   Found Create Task button');
        await createButton.click();
        await page.waitForTimeout(500);
        
        // Fill in task details
        await page.fill('input[id="title"]', 'Test Task from Script');
        await page.fill('textarea[id="description"]', 'This is a test task');
        
        // Submit
        const submitButton = await page.$('button:has-text("Create Task"):not([disabled])');
        if (submitButton) {
          await submitButton.click();
          console.log('   ✅ Task creation attempted');
        }
      }
    }
    
    // 4. Test drag and drop
    console.log('\n3️⃣ Testing drag and drop...');
    // This would need actual tasks to exist
    
    // 5. Test team creation
    console.log('\n4️⃣ Testing team creation...');
    await page.goto('http://localhost:3000/organization?tab=teams');
    await page.waitForTimeout(1000);
    
    const createTeamButton = await page.$('button:has-text("Create Team")');
    if (createTeamButton) {
      console.log('   Found Create Team button');
      await createTeamButton.click();
      await page.waitForTimeout(500);
      
      await page.fill('input[id="team-name"]', 'Test Team from Script');
      await page.fill('textarea', 'Test team description');
      
      const createButton = await page.$('button:has-text("Create Team"):not([disabled])');
      if (createButton) {
        await createButton.click();
        console.log('   ✅ Team creation attempted');
      }
    }
    
    console.log('\n✅ Browser test completed - check the browser window for results');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
  
  // Keep browser open for manual inspection
  console.log('\n👀 Browser will stay open for manual inspection...');
  console.log('Press Ctrl+C to close');
}

createSessionAndTest().catch(console.error);