// src/lib/config/aws.ts

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn('AWS credentials not found in environment variables');
}

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true
  }
});

export const TABLES = {
  UPDATES: process.env.DDB_UPDATES_TABLE || 'dev-genai4code-updates',
  ENGINEERING: process.env.DDB_ENGINEERING_TABLE || 'dev-genai4code-engineering',
  RESEARCH: process.env.DDB_RESEARCH_TABLE || 'dev-genai4code-research'
} as const;