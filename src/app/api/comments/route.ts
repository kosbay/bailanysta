import { ApiResponse, CommentWithAuthor } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth';

import prisma from '@/lib/db';

// POST /api/comments - Add a comment to a post
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<CommentWithAuthor>>> {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { postId, content } = await request.json();

    if (!postId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        postId: postId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    });

    // Create notification if not commenting on own post
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT',
          message: `${user.displayName || user.username} commented on your post`,
          userId: post.authorId
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: comment as CommentWithAuthor,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// GET /api/comments - Get comments for a post
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<CommentWithAuthor[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: comments as CommentWithAuthor[]
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
