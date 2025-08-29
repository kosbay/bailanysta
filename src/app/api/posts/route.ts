import { ApiResponse, CreatePostData, PostWithDetails } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { extractHashtags, stringifyHashtags } from '@/utils/hashtags';
import { extractToken, verifyToken } from '@/lib/auth';

import prisma from '@/lib/db';

// GET /api/posts - Get all posts with pagination
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PostWithDetails[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const cursor = searchParams.get('cursor');
    const userId = searchParams.get('userId');

    const whereClause = userId ? { authorId: userId } : {};

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        },
        likes: {
          select: {
            userId: true,
          }
        },
        comments: {
          take: 3,
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: posts as PostWithDetails[]
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<PostWithDetails>>> {
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

    const body: CreatePostData = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Extract hashtags from content
    const hashtags = extractHashtags(content);

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        hashtags: hashtags.length > 0 ? stringifyHashtags(hashtags) : null,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        },
        likes: {
          select: {
            userId: true,
          }
        },
        comments: {
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: post as PostWithDetails,
      message: 'Post created successfully'
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
