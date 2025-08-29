'use client';

import { useCallback, useState } from 'react';

import { ApiResponse } from '@/types';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  includeAuth?: boolean;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async <T = unknown>(
    url: string,
    data?: unknown,
    options: UseApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const { method = 'GET', headers = {}, includeAuth = true } = options;

      // Add auth token if required
      if (includeAuth) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Set content type for non-GET requests
      if (method !== 'GET' && data) {
        headers['Content-Type'] = 'application/json';
      }

      const config: RequestInit = {
        method,
        headers,
      };

      if (method !== 'GET' && data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);
      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        setError(result.error || 'An error occurred');
      }

      return result;
    } catch {
      const errorMessage = 'Network error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    makeRequest,
    clearError,
  };
}
