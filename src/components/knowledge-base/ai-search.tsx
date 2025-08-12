'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, Book, ChevronRight, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  type: string;
  tags: string[];
  metadata: any;
  relevanceScore?: number;
}

interface AIAnswer {
  answer: string;
  confidence: number;
  sources: Array<{
    articleId: string;
    title: string;
    snippet: string;
  }>;
}

export function AIKnowledgeSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'hybrid' | 'text' | 'semantic'>('hybrid');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiAnswer, setAIAnswer] = useState<AIAnswer | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAIAnswer, setShowAIAnswer] = useState(true);

  useEffect(() => {
    fetchRecentSearches();
  }, []);

  const fetchRecentSearches = async () => {
    try {
      const response = await fetch('/api/knowledge-base/search');
      if (response.ok) {
        const data = await response.json();
        setRecentSearches(data.recentSearches || []);
      }
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    }
  };

  const performSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim() || finalQuery.length < 3) return;

    setLoading(true);
    setResults([]);
    setAIAnswer(null);

    try {
      const response = await fetch('/api/knowledge-base/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalQuery,
          searchType,
          generateAnswer: showAIAnswer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setAIAnswer(data.aiAnswer);
        
        // Update recent searches
        if (!recentSearches.includes(finalQuery)) {
          setRecentSearches([finalQuery, ...recentSearches.slice(0, 9)]);
        }
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    // In a real implementation, this would send feedback to the server
    console.log('Feedback:', helpful ? 'helpful' : 'not helpful');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'default';
      case 'faq': return 'secondary';
      case 'reference': return 'outline';
      case 'tutorial': return 'success';
      case 'troubleshooting': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search the knowledge base... (e.g., 'How to create a project?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4"
              disabled={loading}
            />
          </div>
          <Button 
            onClick={() => performSearch()} 
            disabled={loading || query.length < 3}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Search
              </>
            )}
          </Button>
        </div>
        
        {/* Search Options */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search Type:</span>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="hybrid">Hybrid (Recommended)</option>
              <option value="text">Text Search</option>
              <option value="semantic">Semantic Search</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAIAnswer}
              onChange={(e) => setShowAIAnswer(e.target.checked)}
            />
            Generate AI Answer
          </label>
        </div>
      </div>

      {/* Recent Searches */}
      {!loading && results.length === 0 && recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(search);
                    performSearch(search);
                  }}
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Searching knowledge base...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && (results.length > 0 || aiAnswer) && (
        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList>
            {aiAnswer && (
              <TabsTrigger value="ai">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Answer
              </TabsTrigger>
            )}
            <TabsTrigger value="articles">
              <Book className="h-4 w-4 mr-2" />
              Articles ({results.length})
            </TabsTrigger>
          </TabsList>

          {aiAnswer && (
            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle>AI Generated Answer</CardTitle>
                    </div>
                    <Badge variant="outline">
                      Confidence: {Math.round(aiAnswer.confidence * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{aiAnswer.answer}</p>
                  </div>

                  {aiAnswer.sources.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Sources:</h4>
                      <div className="space-y-2">
                        {aiAnswer.sources.map((source, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground">{index + 1}.</span>
                            <div className="flex-1">
                              <Link 
                                href={`/knowledge-base/article/${source.articleId}`}
                                className="font-medium hover:underline text-primary"
                              >
                                {source.title}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1">
                                {source.snippet}...
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Was this answer helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(true)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(false)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="articles" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link 
                            href={`/knowledge-base/article/${result.slug}`}
                            className="hover:underline"
                          >
                            <CardTitle className="text-base">{result.title}</CardTitle>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getTypeColor(result.type)} className="text-xs">
                              {result.type}
                            </Badge>
                            {result.relevanceScore && (
                              <Badge variant="outline" className="text-xs">
                                Score: {result.relevanceScore}
                              </Badge>
                            )}
                            {result.tags?.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    {result.summary && (
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {result.summary}
                        </CardDescription>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && !aiAnswer && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse the knowledge base categories.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}