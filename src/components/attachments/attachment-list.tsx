'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, Eye, File, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
  uploadedBy: string;
}

interface AttachmentListProps {
  taskId?: string;
  commentId?: string;
  refresh?: number;
}

export function AttachmentList({ taskId, commentId, refresh = 0 }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAttachments();
  }, [taskId, commentId, refresh]);

  const fetchAttachments = async () => {
    try {
      const params = new URLSearchParams();
      if (taskId) params.append('taskId', taskId);
      if (commentId) params.append('commentId', commentId);

      const response = await fetch(`/api/attachments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    setDeleting(attachmentId);
    try {
      const response = await fetch(`/api/attachments?id=${attachmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Attachment deleted');
        setAttachments(attachments.filter(a => a.id !== attachmentId));
      } else {
        toast.error('Failed to delete attachment');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (attachment: Attachment) => {
    if (attachment.mimeType.startsWith('image/')) {
      setPreviewUrl(attachment.url);
      setPreviewName(attachment.originalName);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground p-4">
        No attachments yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              {attachment.mimeType.startsWith('image/') ? (
                <div 
                  className="w-10 h-10 rounded overflow-hidden cursor-pointer"
                  onClick={() => handlePreview(attachment)}
                >
                  <img 
                    src={attachment.url} 
                    alt={attachment.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                  {getFileIcon(attachment.mimeType)}
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium">{attachment.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.fileSize)} • {formatDate(attachment.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {attachment.mimeType.startsWith('image/') && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handlePreview(attachment)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => handleDownload(attachment)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => handleDelete(attachment.id)}
                disabled={deleting === attachment.id}
              >
                {deleting === attachment.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewName}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="relative w-full flex justify-center">
              <img 
                src={previewUrl} 
                alt={previewName}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}