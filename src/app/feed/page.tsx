'use client';

import { Plus, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import PostCard from '@/components/posts/PostCard';
import { PostWithDetails } from '@/types';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const { makeRequest, loading: apiLoading } = useApi();
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await makeRequest<PostWithDetails[]>('/api/posts');
      if (response.success && response.data) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsInitialLoad(false);
    }
  }, [makeRequest]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchPosts();
    }
  }, [user, authLoading, fetchPosts]);

  const handleLikeChange = (postId: string, isLiked: boolean) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              _count: {
                ...post._count,
                likes: isLiked ? post._count.likes + 1 : post._count.likes - 1
              }
            }
          : post
      )
    );
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Feed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
                            Discover what&apos;s happening in your network
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            disabled={apiLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${apiLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={() => router.push('/create')}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isInitialLoad && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {!isInitialLoad && (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLikeChange={handleLikeChange}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to share something with the community!
              </p>
              <Button onClick={() => router.push('/create')}>
                Create your first post
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
