// src/lib/types/media.ts

// DynamoDB S3 URL value structure
export interface S3MediaValue {
    S?: string;  // Single S3 URL
    L?: Array<{ S: string }>;  // Array of S3 URLs
  }
  
  // DynamoDB media URLs map structure
  export interface MediaUrls {
    M: {
      [key: string]: S3MediaValue;
    };
  }
  
  // Media types for different content
  export type MediaType = 'image' | 'video' | 'document' | 'code';
  
  // Media file metadata
  export interface MediaMetadata {
    fileName: string;
    contentType: string;
    size: number;
    lastModified: string;
    dimensions?: {
      width: number;
      height: number;
    };
  }
  
  // Content with media fields
  export interface ContentWithMedia {
    id: string;
    // Standard image URLs (thumbnails, covers, etc)
    imageUrls?: MediaUrls;
    // Other media URLs (documents, code samples, etc)
    mediaUrls?: MediaUrls;
    // Allow for additional fields
    [key: string]: any;
  }
  
  // Media upload configuration
  export interface MediaUploadConfig {
    allowedTypes: string[];
    maxSize: number;
    path: string;
  }
  
  // Media configuration by content type
  export const MEDIA_CONFIG: Record<string, MediaUploadConfig> = {
    updates: {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      path: 'updates'
    },
    engineering: {
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'text/plain',
        'text/markdown',
        'application/pdf',
        'application/zip'
      ],
      maxSize: 50 * 1024 * 1024, // 50MB
      path: 'engineering'
    },
    research: {
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 100 * 1024 * 1024, // 100MB
      path: 'research'
    }
  };
  
  // S3 key generation helpers
  export const generateS3Key = (
    contentType: string,
    contentId: string,
    fileName: string,
    mediaType: MediaType
  ): string => {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    return `${contentType}/${contentId}/${mediaType}s/${sanitizedFileName}`;
  };
  
  // Media URL formatting helpers
  export const formatMediaUrl = (
    bucket: string,
    key: string,
    isPublic: boolean = false
  ): string => {
    return isPublic
      ? `https://${bucket}.s3.amazonaws.com/${key}`
      : `s3://${bucket}/${key}`;
  };
  
  // Media type validation
  export const isValidMediaType = (
    contentType: string,
    fileType: string,
    fileSize: number
  ): boolean => {
    const config = MEDIA_CONFIG[contentType];
    if (!config) return false;
  
    return (
      config.allowedTypes.includes(fileType) &&
      fileSize <= config.maxSize
    );
  };