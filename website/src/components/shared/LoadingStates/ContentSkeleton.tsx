// src/components/shared/LoadingStates/ContentSkeleton.tsx

interface ContentSkeletonProps {
    count?: number;
    className?: string;
}

export function ContentSkeleton({ count = 6, className = "" }: ContentSkeletonProps) {
    return (
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}