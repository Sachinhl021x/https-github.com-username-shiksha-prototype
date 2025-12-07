// src/components/shared/ContentList.tsx

import { useContent } from '@/hooks/useContent';
import { ContentType, ContentWithMedia } from '@/lib/types/database';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ContentListProps {
  type: ContentType;
  category?: string;
  render: (item: ContentWithMedia) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function ContentList({
  type,
  category,
  render,
  emptyMessage = 'No content available.',
  className = ''
}: ContentListProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  });

  const {
    content,
    isLoading,
    error,
    hasMore,
    loadMore
  } = useContent({
    type,
    category,
    limit: 12
  });

  useEffect(() => {
    if (inView && hasMore) {
      loadMore();
    }
  }, [inView, hasMore]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load content. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (!content.length && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => render(item))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {hasMore && (
        <div 
          ref={ref} 
          className="h-20 flex items-center justify-center"
        >
          {isLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          )}
        </div>
      )}
    </div>
  );
}