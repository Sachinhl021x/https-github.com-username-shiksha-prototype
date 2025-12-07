// src/lib/types/content.ts
import { 
    DynamoContent, 
    EngineeringContent, 
    ResearchContent, 
    ContentType 
  } from './database';
  
  export interface ContentFilters {
    category?: string;
    timeframe?: string;
    searchQuery?: string;
    type?: ContentType;  // Using ContentType from database.ts
    isApplied?: boolean;
  }
  
  export interface FetchContentOptions {
    type: ContentType;  // Using ContentType from database.ts
    limit?: number;
    cursor?: string;
    category?: string;
  }
  
  export interface ContentResponse {
    items: DynamoContent[];  // Using DynamoContent instead of ContentItem
    nextCursor?: string;
    total: number;
  }
  
  export interface QueryOptions {
    type?: ContentType;  // Using ContentType from database.ts
    category?: string;
    limit?: number;
    cursor?: string;
    filters?: Partial<ContentFilters>;
  }
  
  export interface QueryResponse {
    items: DynamoContent[];  // Using DynamoContent instead of ContentItem
    nextCursor?: string;
    total: number;
    hasMore?: boolean;
  }
  
  // Type guards updated to use new types
  export function isEngineeringContent(content: DynamoContent): content is EngineeringContent {
    return content.type === 'engineering' && 
           'difficulty' in content && 
           'technologies' in content;
  }
  
  export function isResearchContent(content: DynamoContent): content is ResearchContent {
    return content.type === 'research' && 
           'citations' in content && 
           'readTime' in content;
  }