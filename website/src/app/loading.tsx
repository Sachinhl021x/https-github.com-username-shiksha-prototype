import { ContentSkeleton } from '@/components/shared/LoadingStates/ContentSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen">
      <ContentSkeleton />
    </div>
  );
}