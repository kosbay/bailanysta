import { Comment, Follow, Like, Notification, NotificationType, Post, User } from '@prisma/client';

// Extended types with relations
export interface UserWithCounts extends User {
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface PostWithDetails extends Post {
  author: User;
  likes: Like[];
  comments: CommentWithAuthor[];
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export interface CommentWithAuthor extends Comment {
  user: User;
}

export interface NotificationWithDetails extends Notification {
  user: User;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  displayName: string;
  password: string;
  bio?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string | null;
  avatar?: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface CreatePostData {
  content: string;
  hashtags?: string[];
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatar?: string;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  hashtag?: string;
  userId?: string;
  limit?: number;
  cursor?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Export Prisma types
export type {
  User,
  Post,
  Like,
  Comment,
  Follow,
  Notification,
  NotificationType,
};
