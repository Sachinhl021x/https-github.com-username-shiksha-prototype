import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function createSuccessResponse<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
  });
}

export function createErrorResponse(error: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return createErrorResponse(message);
}