// src/lib/types/api.ts

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ApiErrorResponse {
    message: string;
    code: string;
    status: number;
}

export interface QueryOptions {
    type?: string;
    category?: string;
    limit?: number;
    cursor?: string;
}

export interface FilterParams {
    type?: string;
    category?: string;
    status?: string;
}

export type RequestParams = PaginationParams & FilterParams;

export interface PaginationParams {
    page?: number;
    limit?: number;
    cursor?: string;
}