'use client';

import { ArrowLeft, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { PostWithDetails, UserWithCounts } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import PostCard from '@/components/posts/PostCard';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { makeRequest, loading: apiLoading } = useApi();
  const [profileUser, setProfileUser] = useState<UserWithCounts | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [error, setError] = useState('');

  const username = params.username as string;
  const isOwnProfile = currentUser?.username === username;

  const fetchProfile = useCallback(async () => {
    try {
      const response = await makeRequest<{ user: UserWithCounts; posts: PostWithDetails[] }>(
        `/api/users/${username}`
      );

      if (response.success && response.data) {
        setProfileUser(response.data.user);
        setPosts(response.data.posts);
      } else {
        setError(response.error || 'Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    }
  }, [makeRequest, username]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser && username) {
      fetchProfile();
    }
  }, [currentUser, username, fetchProfile]);

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

  if (authLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={() => router.push('/feed')}>
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  if (apiLoading || !profileUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="h-20 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
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
            {profileUser.displayName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {posts.length} posts
          </p>
        </div>
      </div>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {profileUser.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {profileUser.displayName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    @{profileUser.username}
                  </p>
                </div>
                
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/create')}
                  >
                    New Post
                  </Button>
                )}
              </div>
              
              {profileUser.bio && (
                <p className="text-gray-900 dark:text-white mb-3">
                  {profileUser.bio}
                </p>
              )}
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {formatDate(profileUser.createdAt)}
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-900 dark:text-white">
                  <strong>{profileUser._count.posts}</strong>{' '}
                  <span className="text-gray-500 dark:text-gray-400">Posts</span>
                </span>
                <span className="text-gray-900 dark:text-white">
                  <strong>{profileUser._count.following}</strong>{' '}
                  <span className="text-gray-500 dark:text-gray-400">Following</span>
                </span>
                <span className="text-gray-900 dark:text-white">
                  <strong>{profileUser._count.followers}</strong>{' '}
                  <span className="text-gray-500 dark:text-gray-400">Followers</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
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
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isOwnProfile 
                ? "You haven't created any posts yet. Share your first thought!"
                : `${profileUser.displayName} hasn't shared anything yet.`
              }
            </p>
            {isOwnProfile && (
              <Button onClick={() => router.push('/create')}>
                Create your first post
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
