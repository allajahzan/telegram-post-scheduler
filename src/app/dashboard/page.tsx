'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navbar } from '@/components/layout/navbar';
import { usePosts, Post } from '@/hooks/use-posts';
import { useUser } from '@/hooks/use-auth';
import { PostCard } from '@/components/posts/post-card';
import { CreatePostModal } from '@/components/posts/create-post-modal';
import { EditPostModal } from '@/components/posts/edit-post-modal';
import { DeleteConfirmModal } from '@/components/posts/delete-confirm-modal';
import { Button } from '@/components/ui/button';
import { Plus, Inbox, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const { data: posts, isLoading: isPostsLoading } = usePosts();
  const { data: userData, isLoading: isUserLoading } = useUser();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  const quota = userData?.quota || { used: 0, limit: 3, next_reset_at: null };
  const isLimitReached = quota.used >= quota.limit;
  
  // Format the next reset time if available
  let nextResetText = '';
  if (isLimitReached && quota.next_reset_at) {
    const resetDate = new Date(quota.next_reset_at);
    const hoursLeft = Math.max(0, Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60)));
    
    if (hoursLeft > 24) {
      const days = Math.floor(hoursLeft / 24);
      nextResetText = `Quota resets in ${days} ${days === 1 ? 'day' : 'days'}`;
    } else {
      nextResetText = `Quota resets in ${hoursLeft} ${hoursLeft === 1 ? 'hour' : 'hours'}`;
    }
  }

  const isLoading = isPostsLoading || isUserLoading;
  const activePostCount = posts?.length || 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Posts</h1>
              <p className="text-muted-foreground mt-1">
                Manage your scheduled LinkedIn posts ({quota.used}/{quota.limit} used in last 3 days)
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                disabled={isLimitReached}
                className="gap-2 shadow-sm"
              >
                <Plus className="size-4" />
                Create New Post
              </Button>
              {isLimitReached && (
                <span className="text-xs text-destructive font-medium">
                  {nextResetText || 'You have reached the 3-post limit.'}
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {activePostCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/30">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Inbox className="size-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    Create your first post to start automating your LinkedIn workflow.
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)} disabled={isLimitReached} className="gap-2">
                    <Plus className="size-4" />
                    Create New Post
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts?.map((post) => (
                    <PostCard 
                      key={post._id}
                      post={post}
                      onEdit={setEditingPost}
                      onDelete={setDeletingPost}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <CreatePostModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
        
        <EditPostModal 
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
        />
        
        <DeleteConfirmModal
          post={deletingPost}
          isOpen={!!deletingPost}
          onClose={() => setDeletingPost(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
