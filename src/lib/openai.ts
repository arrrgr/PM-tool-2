import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embeddings for semantic search
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Generate article summary
export async function generateSummary(content: string, maxLength: number = 150): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries of technical documentation. Keep summaries clear and under " + maxLength + " words."
        },
        {
          role: "user",
          content: `Please summarize the following content:\n\n${content}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    });
    
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

// Answer questions based on context
export async function answerQuestion(
  question: string,
  context: string[]
): Promise<{ answer: string; tokens: number }> {
  try {
    const contextText = context.join('\n\n---\n\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful project assistant. Answer questions based on the provided context. If the answer isn't in the context, say so. Be concise and specific."
        },
        {
          role: "user",
          content: `Context:\n${contextText}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });
    
    return {
      answer: response.choices[0].message.content || 'Unable to generate answer.',
      tokens: response.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error('Error answering question:', error);
    throw new Error('Failed to answer question');
  }
}

// Auto-categorize content
export async function suggestCategorization(
  title: string,
  content: string,
  availableCategories: string[]
): Promise<{ category: string; tags: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a content categorization assistant. Based on the title and content, suggest the most appropriate category from the available options and up to 5 relevant tags. Available categories: ${availableCategories.join(', ')}`
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content.substring(0, 1000)}`
        }
      ],
      functions: [
        {
          name: "categorize_content",
          description: "Categorize content and suggest tags",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "The suggested category",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Suggested tags (max 5)",
              },
            },
            required: ["category", "tags"],
          },
        },
      ],
      function_call: { name: "categorize_content" },
      temperature: 0.3,
    });
    
    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.arguments) {
      return JSON.parse(functionCall.arguments);
    }
    
    return {
      category: availableCategories[0] || 'General',
      tags: [],
    };
  } catch (error) {
    console.error('Error suggesting categorization:', error);
    return {
      category: availableCategories[0] || 'General',
      tags: [],
    };
  }
}

// Find similar articles using cosine similarity
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}