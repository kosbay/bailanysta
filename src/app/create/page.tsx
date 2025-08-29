'use client';

import { ArrowLeft, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import React, { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import { CreatePostData } from '@/types';
import Textarea from '@/components/ui/Textarea';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth();
  const { makeRequest, loading: apiLoading } = useApi();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please write something to share');
      return;
    }

    if (content.length > 500) {
      setError('Post content must be 500 characters or less');
      return;
    }

    setError('');

    try {
      const postData: CreatePostData = {
        content: content.trim(),
      };

      const response = await makeRequest('/api/posts', postData, {
        method: 'POST',
      });

      if (response.success) {
        router.push('/feed');
      } else {
        setError(response.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('An unexpected error occurred');
    }
  };

  const generateWithAI = async () => {
    if (!content.trim()) {
      setError('Please provide a prompt for AI generation');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await makeRequest<{ content: string }>('/api/ai/generate-content', {
        prompt: content,
        type: 'post'
      }, {
        method: 'POST',
      });

      if (response.success && response.data) {
        setContent(response.data.content);
      } else {
        setError(response.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content with AI');
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const remainingChars = 500 - content.length;

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
            Create New Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your thoughts with the community
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold">{user.displayName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                @{user.username}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="What's on your mind? Use #hashtags to categorize your post..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError('');
                }}
                error={error}
                rows={6}
                className="resize-none"
                disabled={apiLoading || isGenerating}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateWithAI}
                    disabled={!content.trim() || isGenerating || apiLoading}
                    isLoading={isGenerating}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Write a prompt and click to generate content
                  </p>
                </div>
                <span
                  className={`text-sm ${
                    remainingChars < 0
                      ? 'text-red-500'
                      : remainingChars < 50
                      ? 'text-yellow-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {remainingChars} characters remaining
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={apiLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!content.trim() || content.length > 500 || apiLoading}
                isLoading={apiLoading}
              >
                {apiLoading ? 'Publishing...' : 'Publish Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
