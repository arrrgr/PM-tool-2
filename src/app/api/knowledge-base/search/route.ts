import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { kbArticles, kbSearchHistory } from '@/server/db/schema-knowledge-base';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Simple text search function
async function textSearch(query: string, limit = 10) {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  if (searchTerms.length === 0) {
    return [];
  }

  // Create search conditions for title, content, and summary
  const searchConditions = searchTerms.map(term => 
    or(
      ilike(kbArticles.title, `%${term}%`),
      ilike(kbArticles.content, `%${term}%`),
      ilike(kbArticles.summary, `%${term}%`)
    )
  );

  const results = await db
    .select({
      id: kbArticles.id,
      title: kbArticles.title,
      slug: kbArticles.slug,
      summary: kbArticles.summary,
      type: kbArticles.type,
      tags: kbArticles.tags,
      metadata: kbArticles.metadata,
      createdAt: kbArticles.createdAt,
      relevanceScore: sql<number>`
        (
          CASE WHEN LOWER(${kbArticles.title}) LIKE LOWER('%${query}%') THEN 10 ELSE 0 END +
          CASE WHEN LOWER(${kbArticles.summary}) LIKE LOWER('%${query}%') THEN 5 ELSE 0 END +
          CASE WHEN LOWER(${kbArticles.content}) LIKE LOWER('%${query}%') THEN 3 ELSE 0 END
        )
      `.as('relevance_score'),
    })
    .from(kbArticles)
    .where(
      and(
        eq(kbArticles.status, 'published'),
        or(...searchConditions)
      )
    )
    .orderBy(desc(sql`relevance_score`))
    .limit(limit);

  return results;
}

// AI-enhanced search using embeddings (mock implementation)
async function semanticSearch(query: string, limit = 10) {
  // In a real implementation, this would:
  // 1. Generate an embedding for the query using OpenAI/Anthropic
  // 2. Compare with stored embeddings using vector similarity
  // 3. Return the most similar articles
  
  // For now, fall back to text search
  return textSearch(query, limit);
}

// Generate AI answer based on found articles
async function generateAIAnswer(query: string, articles: any[]) {
  if (articles.length === 0) {
    return {
      answer: "I couldn't find any relevant information in the knowledge base for your query. Please try rephrasing your question or contact support for assistance.",
      confidence: 0,
      sources: []
    };
  }

  // Extract relevant snippets from articles
  const snippets = articles.slice(0, 3).map(article => {
    const content = article.summary || article.content?.substring(0, 500) || '';
    return {
      articleId: article.id,
      title: article.title,
      snippet: content
    };
  });

  // In a real implementation, this would call an AI API (OpenAI/Anthropic)
  // to generate a comprehensive answer based on the snippets
  const answer = `Based on the knowledge base, here's what I found about "${query}":

${snippets.map((s, i) => `${i + 1}. From "${s.title}": ${s.snippet.substring(0, 200)}...`).join('\n\n')}

For more detailed information, please refer to the source articles below.`;

  return {
    answer,
    confidence: articles[0].relevanceScore > 10 ? 0.9 : 0.7,
    sources: snippets.map(s => ({
      articleId: s.articleId,
      title: s.title,
      snippet: s.snippet.substring(0, 200)
    }))
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, searchType = 'hybrid', generateAnswer = false } = body;

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Query must be at least 3 characters long' }, { status: 400 });
    }

    let searchResults: any[] = [];

    // Perform search based on type
    switch (searchType) {
      case 'text':
        searchResults = await textSearch(query);
        break;
      case 'semantic':
        searchResults = await semanticSearch(query);
        break;
      case 'hybrid':
      default:
        // Combine text and semantic search results
        const textResults = await textSearch(query, 5);
        const semanticResults = await semanticSearch(query, 5);
        
        // Merge and deduplicate results
        const resultMap = new Map();
        [...textResults, ...semanticResults].forEach(result => {
          if (!resultMap.has(result.id)) {
            resultMap.set(result.id, result);
          }
        });
        searchResults = Array.from(resultMap.values());
        break;
    }

    // Generate AI answer if requested
    let aiAnswer = null;
    if (generateAnswer && searchResults.length > 0) {
      aiAnswer = await generateAIAnswer(query, searchResults);
    }

    // Log search for analytics
    await db.insert(kbSearchHistory).values({
      id: nanoid(),
      query,
      results: searchResults.map(r => ({ articleId: r.id, score: r.relevanceScore || 0 })),
      userId: session.user.id,
      searchType,
    });

    return NextResponse.json({
      query,
      results: searchResults,
      aiAnswer,
      totalResults: searchResults.length,
    });
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get popular/recent searches
    const recentSearches = await db
      .select({
        query: kbSearchHistory.query,
        count: sql<number>`COUNT(*)`.as('search_count'),
      })
      .from(kbSearchHistory)
      .where(eq(kbSearchHistory.userId, session.user.id))
      .groupBy(kbSearchHistory.query)
      .orderBy(desc(sql`search_count`))
      .limit(10);

    return NextResponse.json({
      recentSearches: recentSearches.map(s => s.query),
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}