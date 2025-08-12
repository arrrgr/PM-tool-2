// Test auto-categorization feature
async function testCategorize() {
  const response = await fetch('http://localhost:3000/api/knowledge/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'categorize',
      title: 'How to implement OAuth 2.0 authentication',
      content: 'This guide explains how to implement OAuth 2.0 authentication in a Node.js application using Passport.js. We will cover the setup process, configuration, and best practices for secure authentication flow.'
    })
  });

  const result = await response.json();
  console.log('Categorization result:', result);
}

testCategorize().catch(console.error);