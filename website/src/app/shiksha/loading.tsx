import { ContentSkeleton } from '@/components/shared/LoadingStates/ContentSkeleton';
import { FilterSkeleton } from '@/components/shared/LoadingStates/FilterSkeleton';

export default function EngineeringLoading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="space-y-4 mb-8">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>

        <FilterSkeleton />
        <ContentSkeleton count={9} className="mt-8 grid grid-cols-3 gap-6" />
      </div>
    </div>
  );
}