import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth';

import { ApiResponse } from '@/types';
import OpenAI from 'openai';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ content: string }>>> {
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { prompt, type = 'post' } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let systemMessage = '';
    
    switch (type) {
      case 'post':
        systemMessage = 'You are a creative social media content creator. Generate engaging, authentic social media posts based on the user\'s prompt. Keep posts concise, engaging, and suitable for a social platform. Include relevant hashtags where appropriate.';
        break;
      case 'comment':
        systemMessage = 'You are helping users write thoughtful comments. Generate a meaningful, respectful comment based on the user\'s prompt. Keep it conversational and engaging.';
        break;
      case 'bio':
        systemMessage = 'You are helping users write their social media bio. Create a concise, interesting bio that captures their personality or interests. Keep it under 150 characters.';
        break;
      default:
        systemMessage = 'You are a helpful assistant for social media content creation.';
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const generatedContent = completion.choices[0]?.message?.content?.trim();

    if (!generatedContent) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { content: generatedContent },
      message: 'Content generated successfully'
    });

  } catch (error) {
    console.error('Error generating content:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { success: false, error: 'Invalid OpenAI API key' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
