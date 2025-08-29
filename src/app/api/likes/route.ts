import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth';

import { ApiResponse } from '@/types';
import prisma from '@/lib/db';

// POST /api/likes - Like a post
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
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

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    });

    if (existingLike) {
      return NextResponse.json(
        { success: false, error: 'Post already liked' },
        { status: 409 }
      );
    }

    // Create like
    await prisma.like.create({
      data: {
        userId: user.id,
        postId: postId
      }
    });

    // Create notification if not liking own post
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: 'LIKE',
          message: `${user.displayName || user.username} liked your post`,
          userId: post.authorId
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Post liked successfully'
    });

  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

// DELETE /api/likes - Unlike a post
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    });

    if (!existingLike) {
      return NextResponse.json(
        { success: false, error: 'Like not found' },
        { status: 404 }
      );
    }

    // Delete like
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Post unliked successfully'
    });

  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
