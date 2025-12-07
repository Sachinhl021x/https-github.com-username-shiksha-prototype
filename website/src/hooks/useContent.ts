// src/hooks/useContent.ts

import { useState, useEffect } from 'react';
import { ContentType, ContentWithMedia } from '@/lib/types/database';

interface UseContentOptions {
  type: ContentType;
  category?: string;
  limit?: number;
  revalidate?: number;
}

interface UseContentReturn {
  content: ContentWithMedia[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useContent({
  type,
  category,
  limit = 10,
  revalidate = 60
}: UseContentOptions): UseContentReturn {
  const [content, setContent] = useState<ContentWithMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  const fetchContent = async (append = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        limit: limit.toString()
      });

      if (category) {
        params.append('category', category);
      }
      
      if (cursor && append) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/content?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const { success, data, error } = await response.json();
      
      if (!success) {
        throw new Error(error || 'Failed to fetch content');
      }

      setContent(prev => append ? [...prev, ...data.items] : data.items);
      setCursor(data.cursor);
      setHasMore(!!data.cursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();

    // Set up revalidation if enabled
    if (revalidate > 0) {
      const interval = setInterval(() => fetchContent(), revalidate * 1000);
      return () => clearInterval(interval);
    }
  }, [type, category]);

  const loadMore = async () => {
    if (!isLoading && hasMore) {
      await fetchContent(true);
    }
  };

  return {
    content,
    isLoading,
    error,
    hasMore,
    loadMore
  };
}