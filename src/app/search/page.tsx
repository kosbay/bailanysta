'use client';

import { ArrowLeft, Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PostCard from '@/components/posts/PostCard';
import { PostWithDetails } from '@/types';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const { makeRequest, loading: apiLoading } = useApi();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const searchPosts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPosts([]);
      setHasSearched(false);
      return;
    }

    try {
      const response = await makeRequest<PostWithDetails[]>(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
      );

      if (response.success && response.data) {
        setPosts(response.data);
      } else {
        setPosts([]);
      }
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching posts:', error);
      setPosts([]);
      setHasSearched(true);
    }
  }, [makeRequest]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPosts(query);
  };

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
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find posts by keywords and hashtags
          </p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Search for posts, hashtags... (e.g., #technology, react, coding)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            disabled={apiLoading}
          />
          <Button
            type="submit"
            disabled={!query.trim() || apiLoading}
            isLoading={apiLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {/* Search Tips */}
      {!hasSearched && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Search Tips:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Search for specific words in post content</li>
            <li>• Use hashtags like #technology, #coding, #react</li>
            <li>• Search is case-insensitive</li>
            <li>• Results are ordered by most recent posts</li>
          </ul>
        </div>
      )}

      {/* Loading state */}
      {apiLoading && (
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

      {/* Results */}
      {!apiLoading && hasSearched && (
        <div className="space-y-4">
          {posts.length > 0 ? (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Found {posts.length} post{posts.length !== 1 ? 's' : ''} for &quot;{query}&quot;
              </div>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikeChange={handleLikeChange}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try searching with different keywords or hashtags.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('');
                  setHasSearched(false);
                  setPosts([]);
                }}
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
