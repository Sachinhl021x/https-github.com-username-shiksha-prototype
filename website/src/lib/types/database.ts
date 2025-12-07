// src/lib/types/database.ts

// Base content interface
export interface BaseContent {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// DynamoDB specific structure
export interface DynamoContent extends BaseContent {
  PK: string;
  SK: string;
  category?: string;
  type: ContentType;
  version: number;
  priority: number;
  tags?: string[];
  content?: string;
  slug?: string; // Added slug as it's used in route
  imageUrl?: string; // Added imageUrl
}

// Alias for backward compatibility
export type ContentItem = DynamoContent;

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Type-specific content interfaces
export interface UpdateContent extends DynamoContent {
  source?: {
    name: string;
    publishedAt: string;
    url: string;
    author: {
      name: string;
      organization: string;
    };
  };
}

export interface EngineeringContent extends DynamoContent {
  difficulty: string;
  timeToComplete: string;
  technologies: string[];
}

export interface ResearchContent extends DynamoContent {
  citations: number;
  readTime: string;
  topics: string[];
  abstract?: string;
  institution?: string;
  author?: string;
}

// S3 Media structures (keep existing)
export interface S3MediaValue {
  S?: string;
  L?: Array<{ S: string }>;
}

export interface MediaUrls {
  M: {
    [key: string]: S3MediaValue;
  };
}

// Combined content with media
export interface ContentWithMedia extends DynamoContent {
  imageUrls?: MediaUrls;
  mediaUrls?: MediaUrls;
}

// Content types
export type ContentType = 'updates' | 'engineering' | 'research';

// Query options
export interface QueryOptions {
  category?: string;
  cursor?: string;
  limit?: number;
  filters?: Record<string, any>;
}

// Response types
export interface QueryResponse {
  items: DynamoContent[];
  cursor?: string;
  total: number;
}
