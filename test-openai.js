// Test OpenAI integration directly
const { config } = require('dotenv');
config({ path: '.env.local' });

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key not found');
    return;
  }

  console.log('Testing OpenAI API...');
  console.log('API Key starts with:', apiKey.substring(0, 10) + '...');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You categorize content. Available categories: Technical, Process, Documentation, Best Practices, FAQ'
          },
          {
            role: 'user',
            content: 'Title: How to implement OAuth 2.0\nContent: Guide for OAuth implementation'
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return;
    }

    const result = await response.json();
    console.log('OpenAI Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error calling OpenAI:', error.message);
  }
}

testOpenAI();