'use client';

import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function EngineeringDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} reset={reset} />;
}