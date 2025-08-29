import { ApiResponse, PostWithDetails } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/db';

// GET /api/search - Search posts by content and hashtags
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PostWithDetails[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const searchTerm = query.trim().toLowerCase();

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            content: {
              contains: searchTerm,
            }
          },
          {
            hashtags: {
              contains: searchTerm,
            }
          }
        ]
      },
      take: limit,
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
    console.error('Error searching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search posts' },
      { status: 500 }
    );
  }
}
