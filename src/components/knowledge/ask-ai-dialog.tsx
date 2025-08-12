'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Brain, Loader2, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AskAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIResponse {
  answer: string;
  referencedArticles: Array<{
    id: string;
    title: string;
  }>;
  tokens?: number;
}

export function AskAIDialog({ open, onOpenChange }: AskAIDialogProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/knowledge/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask',
          question,
          useContext: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
      } else {
        toast.error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    // In a real implementation, this would send feedback to the server
    toast.success(`Thank you for your feedback!`);
  };

  const handleReset = () => {
    setQuestion('');
    setResponse(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Ask AI Assistant
          </DialogTitle>
          <DialogDescription>
            Get intelligent answers based on your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!response ? (
            <>
              <div className="space-y-2">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to know? Ask about project processes, technical details, best practices..."
                  rows={4}
                  className="text-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAsk} disabled={loading || !question.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
              </div>

              {/* Sample Questions */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sample questions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'How do I handle payment errors?',
                    'What is our deployment process?',
                    'Best practices for code reviews?',
                    'How to optimize database queries?',
                  ].map((sample) => (
                    <Badge
                      key={sample}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => setQuestion(sample)}
                    >
                      {sample}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Question */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm">You</span>
                    </div>
                    <p className="flex-1 text-sm">{question}</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Response */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm whitespace-pre-wrap">{response.answer}</p>
                      
                      {/* Referenced Articles */}
                      {response.referencedArticles && response.referencedArticles.length > 0 && (
                        <div className="space-y-2 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">Referenced articles:</p>
                          <div className="space-y-1">
                            {response.referencedArticles.map((article) => (
                              <div key={article.id} className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-primary hover:underline cursor-pointer">
                                  {article.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      <div className="flex items-center gap-4 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">Was this helpful?</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFeedback(true)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFeedback(false)}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                        {response.tokens && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {response.tokens} tokens
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  Ask Another Question
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}