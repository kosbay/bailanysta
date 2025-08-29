'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';

import Button from '@/components/ui/Button';
import { PostWithDetails } from '@/types';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';

interface PostCardProps {
  post: PostWithDetails;
  onLikeChange?: (postId: string, isLiked: boolean) => void;
}

export default function PostCard({ post, onLikeChange }: PostCardProps) {
  const { user } = useAuth();
  const { makeRequest } = useApi();
  const [isLiked, setIsLiked] = useState(
    post.likes.some(like => like.userId === user?.id)
  );
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    const newIsLiked = !isLiked;
    
    try {
      const response = await makeRequest(
        '/api/likes',
        { postId: post.id },
        { 
          method: newIsLiked ? 'POST' : 'DELETE'
        }
      );

      if (response.success) {
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
        onLikeChange?.(post.id, newIsLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const renderContent = (content: string) => {
    // Simple hashtag highlighting
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-blue-500 hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {post.author.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {post.author.displayName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{post.author.username} · {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {renderContent(post.content)}
          </p>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
              />
              <span className="text-sm">{likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post._count.comments}</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
