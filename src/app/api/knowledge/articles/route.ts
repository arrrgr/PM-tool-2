import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { knowledgeArticles, knowledgeCategories } from '@/server/db/schema-knowledge';
import { eq, ilike, or, desc, sql } from 'drizzle-orm';
import { generateEmbedding, generateSummary } from '@/lib/openai';

// GET: List articles or search
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let articlesQuery = db
      .select({
        id: knowledgeArticles.id,
        title: knowledgeArticles.title,
        content: knowledgeArticles.content,
        summary: knowledgeArticles.summary,
        category: knowledgeArticles.category,
        tags: knowledgeArticles.tags,
        authorId: knowledgeArticles.authorId,
        viewCount: knowledgeArticles.viewCount,
        createdAt: knowledgeArticles.createdAt,
        updatedAt: knowledgeArticles.updatedAt,
      })
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.isPublished, true));

    // Search by query
    if (query) {
      articlesQuery = articlesQuery.where(
        or(
          ilike(knowledgeArticles.title, `%${query}%`),
          ilike(knowledgeArticles.content, `%${query}%`)
        )
      );
    }

    // Filter by category
    if (category) {
      articlesQuery = articlesQuery.where(eq(knowledgeArticles.category, category));
    }

    // Order and paginate
    const articles = await articlesQuery
      .orderBy(desc(knowledgeArticles.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST: Create new article
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category, tags, projectId, generateAISummary } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate embedding for semantic search
    let embedding: number[] | null = null;
    let summary = body.summary;

    try {
      // Generate embedding
      embedding = await generateEmbedding(`${title}\n\n${content}`);

      // Generate summary if requested
      if (generateAISummary && !summary) {
        summary = await generateSummary(content);
      }
    } catch (error) {
      console.error('OpenAI processing error:', error);
      // Continue without AI features if they fail
    }

    // Create article
    const [article] = await db
      .insert(knowledgeArticles)
      .values({
        title,
        content,
        summary,
        category,
        tags: tags || [],
        embedding,
        authorId: session.user.id,
        projectId,
        aiGenerated: false,
      })
      .returning();

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

// PATCH: Update article
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, category, tags, summary, regenerateEmbedding } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Check if user is author
    const [existingArticle] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id))
      .limit(1);

    if (!existingArticle || existingArticle.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Article not found or unauthorized' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (summary !== undefined) updateData.summary = summary;

    // Regenerate embedding if content changed
    if (regenerateEmbedding && (title || content)) {
      try {
        const fullText = `${title || existingArticle.title}\n\n${content || existingArticle.content}`;
        updateData.embedding = await generateEmbedding(fullText);
      } catch (error) {
        console.error('Error regenerating embedding:', error);
      }
    }

    const [updatedArticle] = await db
      .update(knowledgeArticles)
      .set(updateData)
      .where(eq(knowledgeArticles.id, id))
      .returning();

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE: Delete article
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Check if user is author
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id))
      .limit(1);

    if (!article || article.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Article not found or unauthorized' },
        { status: 404 }
      );
    }

    await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}