// src/lib/types/request.ts
import { ContentType } from './database';

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface FilterParams {
  type?: ContentType;  // Updated to use ContentType
  category?: string;
  status?: 'draft' | 'published' | 'archived';  // Match database types
}

export type RequestParams = PaginationParams & FilterParams;

// Add API specific types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}