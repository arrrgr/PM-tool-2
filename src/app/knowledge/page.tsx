import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Brain, FileText } from 'lucide-react';

export default function KnowledgePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">
            AI-powered documentation and knowledge management for your organization.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Documentation</span>
              </CardTitle>
              <CardDescription>
                Create and manage project documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Badge variant="secondary">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Rich text editor with markdown support
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Smart Search</span>
              </CardTitle>
              <CardDescription>
                AI-powered search across all content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Badge variant="secondary">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Find information instantly with AI
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Assistant</span>
              </CardTitle>
              <CardDescription>
                Get intelligent suggestions and answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Badge variant="secondary">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  GPT-4 powered knowledge assistance
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Features</CardTitle>
            <CardDescription>
              Advanced knowledge management capabilities coming in Phase 3.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">🤖 AI-Powered</Badge>
                <span>Automatic document summarization and tagging</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">🔍 Smart Search</Badge>
                <span>Semantic search with vector embeddings</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">📝 Rich Editor</Badge>
                <span>Collaborative editing with real-time sync</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">🔗 Integration</Badge>
                <span>Link tasks and projects to documentation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">📊 Analytics</Badge>
                <span>Track document usage and engagement</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}