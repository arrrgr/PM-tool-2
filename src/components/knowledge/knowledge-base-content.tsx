'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Brain, 
  FileText,
  Tag,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { ArticleDialog } from '@/components/knowledge/article-dialog';
import { AskAIDialog } from '@/components/knowledge/ask-ai-dialog';
import { formatDate } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string | null;
  tags: string[];
  viewCount: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export function KnowledgeBaseContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchArticles();
  }, [searchQuery, selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/knowledge/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery) return;

    setLoading(true);
    try {
      const response = await fetch('/api/knowledge/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          query: searchQuery,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.results);
        setActiveTab('ai-search');
      }
    } catch (error) {
      console.error('Error with semantic search:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Technical', 'Process', 'Documentation', 'Best Practices', 'FAQ'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Centralized knowledge and documentation powered by AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAskAIOpen(true)} variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSemanticSearch} variant="secondary">
          AI Search
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Articles</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="ai-search">AI Results</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderArticles(articles)}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {renderArticles(articles.slice(0, 5))}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          {renderArticles(
            [...articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)
          )}
        </TabsContent>

        <TabsContent value="ai-search" className="space-y-4">
          {renderArticles(articles)}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ArticleDialog
        open={createDialogOpen || !!editingArticle}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingArticle(null);
          }
        }}
        article={editingArticle}
        onSave={() => {
          fetchArticles();
          setCreateDialogOpen(false);
          setEditingArticle(null);
        }}
      />

      <AskAIDialog
        open={askAIOpen}
        onOpenChange={setAskAIOpen}
      />
    </div>
  );

  function renderArticles(articleList: Article[]) {
    if (loading) {
      return <div className="text-center py-8">Loading articles...</div>;
    }

    if (articleList.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No articles found</p>
            <Button 
              onClick={() => setCreateDialogOpen(true)} 
              variant="link"
              className="mt-2"
            >
              Create your first article
            </Button>
          </CardContent>
        </Card>
      );
    }

    return articleList.map((article) => (
      <Card 
        key={article.id} 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setEditingArticle(article)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{article.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {article.category && (
                  <Badge variant="secondary">{article.category}</Badge>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.viewCount} views
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(article.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {article.summary || article.content.substring(0, 150) + '...'}
          </p>
          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-1 mt-3 flex-wrap">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    ));
  }
}