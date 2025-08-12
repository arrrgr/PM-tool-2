import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { knowledgeArticles, aiQueries, knowledgeCategories } from '@/server/db/schema-knowledge';
import { sql, desc } from 'drizzle-orm';
import { 
  generateEmbedding, 
  answerQuestion, 
  suggestCategorization,
  cosineSimilarity 
} from '@/lib/openai';

// POST: Semantic search using embeddings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'search':
        return handleSemanticSearch(body, session.user.id);
      case 'ask':
        return handleAskQuestion(body, session.user.id);
      case 'categorize':
        return handleCategorization(body);
      case 'related':
        return handleRelatedArticles(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI endpoint error:', error);
    return NextResponse.json(
      { error: 'AI processing failed' },
      { status: 500 }
    );
  }
}

// Semantic search using embeddings
async function handleSemanticSearch(body: any, userId: string) {
  const { query, limit = 5 } = body;

  if (!query) {
    return NextResponse.json(
      { error: 'Query is required' },
      { status: 400 }
    );
  }

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Get all articles with embeddings
    const articles = await db
      .select({
        id: knowledgeArticles.id,
        title: knowledgeArticles.title,
        summary: knowledgeArticles.summary,
        content: knowledgeArticles.content,
        category: knowledgeArticles.category,
        tags: knowledgeArticles.tags,
        embedding: knowledgeArticles.embedding,
      })
      .from(knowledgeArticles)
      .where(sql`${knowledgeArticles.embedding} IS NOT NULL`);

    // Calculate similarity scores
    const scoredArticles = articles
      .map(article => {
        const similarity = article.embedding 
          ? cosineSimilarity(queryEmbedding, article.embedding as number[])
          : 0;
        return {
          ...article,
          similarity,
          embedding: undefined, // Remove embedding from response
        };
      })
      .filter(article => article.similarity > 0.7) // Threshold for relevance
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return NextResponse.json({
      query,
      results: scoredArticles,
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// Answer questions based on knowledge base
async function handleAskQuestion(body: any, userId: string) {
  const { question, useContext = true } = body;

  if (!question) {
    return NextResponse.json(
      { error: 'Question is required' },
      { status: 400 }
    );
  }

  const startTime = Date.now();

  try {
    let context: string[] = [];
    let referencedArticles: any[] = [];

    if (useContext) {
      // Find relevant articles for context
      const searchResult = await handleSemanticSearch(
        { query: question, limit: 3 },
        userId
      );
      
      const searchData = await searchResult.json();
      if (searchData.results) {
        context = searchData.results.map((article: any) => 
          `Title: ${article.title}\n${article.summary || article.content.substring(0, 500)}`
        );
        referencedArticles = searchData.results.map((article: any) => ({
          id: article.id,
          title: article.title,
        }));
      }
    }

    // Get AI answer
    const { answer, tokens } = await answerQuestion(question, context);

    // Log the query for analytics
    await db.insert(aiQueries).values({
      userId,
      query: question,
      response: answer,
      context: { referencedArticles },
      tokens,
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json({
      question,
      answer,
      referencedArticles,
      tokens,
    });
  } catch (error) {
    console.error('Question answering error:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
}

// Auto-categorize content
async function handleCategorization(body: any) {
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: 'Title and content are required' },
      { status: 400 }
    );
  }

  try {
    // Get available categories
    const categories = await db
      .select({ name: knowledgeCategories.name })
      .from(knowledgeCategories);

    const categoryNames = categories.map(c => c.name);
    if (categoryNames.length === 0) {
      categoryNames.push('General', 'Technical', 'Process', 'Documentation');
    }

    const suggestion = await suggestCategorization(title, content, categoryNames);

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('Categorization error:', error);
    return NextResponse.json(
      { error: 'Failed to categorize' },
      { status: 500 }
    );
  }
}

// Find related articles
async function handleRelatedArticles(body: any) {
  const { articleId, limit = 5 } = body;

  if (!articleId) {
    return NextResponse.json(
      { error: 'Article ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get the article and its embedding
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(sql`${knowledgeArticles.id} = ${articleId}`)
      .limit(1);

    if (!article || !article.embedding) {
      return NextResponse.json(
        { error: 'Article not found or has no embedding' },
        { status: 404 }
      );
    }

    // Get all other articles with embeddings
    const otherArticles = await db
      .select({
        id: knowledgeArticles.id,
        title: knowledgeArticles.title,
        summary: knowledgeArticles.summary,
        category: knowledgeArticles.category,
        embedding: knowledgeArticles.embedding,
      })
      .from(knowledgeArticles)
      .where(sql`${knowledgeArticles.id} != ${articleId} AND ${knowledgeArticles.embedding} IS NOT NULL`);

    // Calculate similarity scores
    const relatedArticles = otherArticles
      .map(other => {
        const similarity = other.embedding
          ? cosineSimilarity(article.embedding as number[], other.embedding as number[])
          : 0;
        return {
          id: other.id,
          title: other.title,
          summary: other.summary,
          category: other.category,
          similarity,
        };
      })
      .filter(other => other.similarity > 0.75)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return NextResponse.json(relatedArticles);
  } catch (error) {
    console.error('Related articles error:', error);
    return NextResponse.json(
      { error: 'Failed to find related articles' },
      { status: 500 }
    );
  }
}