import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to create tables if they don't exist (this will be a no-op if they exist)
    await prisma.$executeRaw`SELECT 1`;
    
    // Test if we can query the User table
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Database initialization error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
