export function DetailSkeleton() {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }