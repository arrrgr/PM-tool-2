import { Suspense } from 'react';
import { auth } from '@/server/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { KnowledgeBaseContent } from '@/components/knowledge/knowledge-base-content';

export default async function KnowledgePage() {
  const session = await auth();
  
  if (!session?.user) {
    return <div>Please sign in to access the knowledge base</div>;
  }

  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading knowledge base...</div>}>
        <KnowledgeBaseContent />
      </Suspense>
    </DashboardLayout>
  );
}