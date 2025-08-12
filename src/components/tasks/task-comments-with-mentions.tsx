'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, Send, AtSign } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  mentions?: string[];
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface TaskCommentsWithMentionsProps {
  taskId: string;
  teamMembers?: TeamMember[];
}

export function TaskCommentsWithMentions({ taskId, teamMembers = [] }: TaskCommentsWithMentionsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    // Extract mentions from the comment
    const mentionRegex = /@(\w+)/g;
    const mentions = [...newComment.matchAll(mentionRegex)].map(match => match[1]);

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          mentions,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const position = e.target.selectionStart;
    setNewComment(text);
    setCursorPosition(position);

    // Check if we're typing a mention
    const beforeCursor = text.slice(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const afterAt = beforeCursor.slice(lastAtIndex + 1);
      // Check if there's no space after @
      if (!afterAt.includes(' ')) {
        setMentionSearch(afterAt.toLowerCase());
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member: TeamMember) => {
    const beforeCursor = newComment.slice(0, cursorPosition);
    const afterCursor = newComment.slice(cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeAt = newComment.slice(0, lastAtIndex);
      const username = member.name?.replace(/\s+/g, '') || member.email.split('@')[0];
      const newText = `${beforeAt}@${username} ${afterCursor}`;
      setNewComment(newText);
      setShowMentions(false);
      
      // Focus back on textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = lastAtIndex + username.length + 2;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const name = member.name?.toLowerCase() || '';
    const email = member.email.toLowerCase();
    return name.includes(mentionSearch) || email.includes(mentionSearch);
  });

  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMentions = (content: string, mentions?: string[]) => {
    // Highlight @mentions in the content
    let formattedContent = content;
    
    // Replace @mentions with highlighted spans
    formattedContent = formattedContent.replace(
      /@(\w+)/g,
      (match, username) => {
        // Find if this username matches any team member
        const member = teamMembers.find(m => {
          const memberUsername = m.name?.replace(/\s+/g, '') || m.email.split('@')[0];
          return memberUsername.toLowerCase() === username.toLowerCase();
        });
        
        if (member) {
          return `<span class="inline-flex items-center px-1 rounded bg-blue-100 text-blue-700 font-medium">@${username}</span>`;
        }
        return `<span class="text-blue-600 font-medium">${match}</span>`;
      }
    );
    
    return formattedContent;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Comment Form */}
      {session && (
        <form onSubmit={handleSubmit} className="space-y-2 relative">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleTextChange}
              placeholder="Add a comment... Type @ to mention someone"
              rows={3}
              className="resize-none pr-10"
            />
            <AtSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            
            {/* Mentions Dropdown */}
            {showMentions && filteredMembers.length > 0 && (
              <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto">
                <div className="p-1">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => insertMention(member)}
                      className="w-full flex items-center space-x-2 p-2 hover:bg-accent rounded text-left"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image || ''} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {member.name || member.email}
                        </div>
                        {member.name && (
                          <div className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || isSubmitting}
            >
              <Send className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <Card className="p-4">
            <div className="text-center text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.image || ''} />
                  <AvatarFallback className="text-xs">
                    {getInitials(comment.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.author.name || comment.author.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                    {comment.isInternal && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                        Internal
                      </span>
                    )}
                  </div>
                  <div
                    className="text-sm text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: formatMentions(comment.content, comment.mentions),
                    }}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}