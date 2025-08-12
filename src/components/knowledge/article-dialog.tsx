'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string | null;
  tags: string[];
}

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article | null;
  onSave: () => void;
}

export function ArticleDialog({ open, onOpenChange, article, onSave }: ArticleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const categories = ['Technical', 'Process', 'Documentation', 'Best Practices', 'FAQ'];

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        summary: article.summary || '',
        category: article.category || '',
        tags: article.tags || [],
      });
    } else {
      setFormData({
        title: '',
        content: '',
        summary: '',
        category: '',
        tags: [],
      });
    }
  }, [article]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const method = article ? 'PATCH' : 'POST';
      const body = article 
        ? { ...formData, id: article.id, regenerateEmbedding: true }
        : { ...formData, generateAISummary: !formData.summary };

      const response = await fetch('/api/knowledge/articles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(article ? 'Article updated' : 'Article created');
        onSave();
      } else {
        toast.error('Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!formData.content) {
      toast.error('Content is required to generate summary');
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/knowledge/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formData.content }),
      });

      if (response.ok) {
        const { summary } = await response.json();
        setFormData({ ...formData, summary });
        toast.success('Summary generated');
      } else {
        toast.error('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAutoCategorize = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required for categorization');
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/knowledge/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'categorize',
          title: formData.title,
          content: formData.content,
        }),
      });

      if (response.ok) {
        const { category, tags } = await response.json();
        setFormData({ 
          ...formData, 
          category: category || formData.category,
          tags: tags || formData.tags,
        });
        toast.success('Auto-categorization complete');
      } else {
        toast.error('Failed to auto-categorize');
      }
    } catch (error) {
      console.error('Error auto-categorizing:', error);
      toast.error('Failed to auto-categorize');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {article ? 'Edit Article' : 'Create New Article'}
          </DialogTitle>
          <DialogDescription>
            Share knowledge and documentation with your team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="summary">Summary</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate with AI
              </Button>
            </div>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief summary of the article (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoCategorize}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Auto-categorize
                </Button>
              </div>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tags..."
                />
                <Button type="button" onClick={handleAddTag} variant="secondary">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Article'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}