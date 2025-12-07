// src/app/api/content/route.ts
import { NextRequest } from 'next/server';
import { dynamoDBService } from '@/lib/db/dynamodb';
import { createSuccessResponse, handleApiError } from '@/lib/api/utils';
import { ContentType, QueryOptions } from '@/lib/types/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const type = searchParams.get('type') as ContentType | null;
        const category = searchParams.get('category') || undefined;
        const cursor = searchParams.get('cursor') || undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

        const queryOptions: QueryOptions = {
            category,
            cursor,
            limit,
            filters: {
                status: 'published'
            }
        };

        const result = await dynamoDBService.queryContent({
            type: type || undefined,
            ...queryOptions
        });

        return createSuccessResponse(result);
    } catch (error) {
        return handleApiError(error);
    }
}