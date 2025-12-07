# Backend Implementation Guide

## Overview
Complete Node.js/Express backend implementation for GenAI4Code with authentication, content management, chat system, and admin APIs.

---

## 1. Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── ai.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── content.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── user.controller.ts
│   │   ├── admin.controller.ts
│   │   └── analytics.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── content.service.ts
│   │   ├── chat.service.ts
│   │   ├── ai.service.ts
│   │   ├── recommendation.service.ts
│   │   └── automation.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── content.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── user.routes.ts
│   │   ├── admin.routes.ts
│   │   └── api.routes.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── errors.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## 2. Initial Setup

### 2.1 Initialize Project
```bash
mkdir backend && cd backend
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv
npm install prisma @prisma/client
npm install jsonwebtoken bcryptjs passport passport-google-oauth20
npm install zod joi
npm install bullmq ioredis
npm install axios
npm install winston

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/jsonwebtoken @types/bcryptjs
npm install -D @types/passport @types/passport-google-oauth20
npm install -D nodemon ts-node
npm install -D @types/cors @types/helmet @types/morgan

# Initialize TypeScript
npx tsc --init
```

### 2.2 TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.3 Package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

---

## 3. Database Configuration

### 3.1 Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String?
  avatarUrl   String?
  tier        String   @default("free") // free, premium
  interests   Json?    // Store as JSON array
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  chatSessions ChatSession[]
  contributions UserContribution[]
  feedback      UserFeedback[]
  apiKeys       ApiKey[]
  analytics     AnalyticsEvent[]
}

model ContentItem {
  id          String   @id @default(uuid())
  type        String   // news, engineering, research, product
  title       String
  slug        String   @unique
  excerpt     String?
  content     String?
  author      String?
  category    String?
  tags        Json?    // Store as JSON array
  status      String   @default("draft") // draft, pending, approved, rejected
  featured    Boolean  @default(false)
  metadata    Json?    // Type-specific metadata
  contributorId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  
  // Relations
  contributor User? @relation(fields: [contributorId], references: [id])
  feedback    UserFeedback[]
}

model ChatSession {
  id        String   @id @default(uuid())
  userId    String
  mode      String   // research, learning
  title     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user     User          @relation(fields: [userId], references: [id])
  messages ChatMessage[]
}

model ChatMessage {
  id        String   @id @default(uuid())
  sessionId String
  role      String   // user, assistant
  content   String
  modelUsed String?
  tokensUsed Int?
  createdAt DateTime @default(now())
  
  // Relations
  session ChatSession @relation(fields: [sessionId], references: [id])
}

model UserContribution {
  id        String   @id @default(uuid())
  userId    String
  type      String   // product, tool, feedback
  content   Json     // Store contribution data
  status    String   @default("pending") // pending, approved, rejected
  adminNotes String?
  createdAt DateTime @default(now())
  
  // Relations
  user User @relation(fields: [userId], references: [id])
}

model UserFeedback {
  id        String   @id @default(uuid())
  userId    String
  contentId String?
  pageUrl   String?
  feedbackType String? // like, dislike, suggestion, bug
  comment   String?
  createdAt DateTime @default(now())
  
  // Relations
  user    User         @relation(fields: [userId], references: [id])
  content ContentItem? @relation(fields: [contentId], references: [id])
}

model ApiKey {
  id        String   @id @default(uuid())
  userId    String
  keyHash   String   @unique
  name      String?
  permissions Json?   // Store allowed endpoints
  usageCount Int     @default(0)
  lastUsedAt DateTime?
  createdAt DateTime @default(now())
  expiresAt DateTime?
  
  // Relations
  user User @relation(fields: [userId], references: [id])
}

model AIModel {
  id        String   @id @default(uuid())
  name      String
  provider  String   // deepseek, openrouter
  modelId   String
  config    Json?    // Model-specific config
  isActive  Boolean  @default(true)
  useCase   String?  // automation, chat_research, chat_learning
  costPer1kTokens Float?
  createdAt DateTime @default(now())
}

model AutomationJob {
  id        String   @id @default(uuid())
  jobType   String   // news_generation, content_curation
  status    String   @default("pending") // pending, running, completed, failed
  config    Json?    // Job-specific config
  result    Json?    // Store results
  error     String?
  startedAt DateTime?
  completedAt DateTime?
  createdAt DateTime @default(now())
}

model AnalyticsEvent {
  id        String   @id @default(uuid())
  userId    String?
  eventType String   // page_view, chat_message, content_click
  properties Json?   // Event properties
  createdAt DateTime @default(now())
  
  // Relations
  user User? @relation(fields: [userId], references: [id])
}
```

### 3.2 Database Connection
```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

export default prisma;
```

---

## 4. Configuration

### 4.1 Environment Configuration
```typescript
// src/config/index.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET!,
  jwtAccessExpiry: '15m',
  jwtRefreshExpiry: '7d',
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  
  // AI Providers
  deepseekApiKey: process.env.DEEPSEEK_API_KEY!,
  openrouterApiKey: process.env.OPENROUTER_API_KEY!,
  
  // Redis
  redisUrl: process.env.REDIS_URL!,
  
  // Rate Limiting
  rateLimitFree: 100, // requests per minute
  rateLimitPremium: 1000,
  rateLimitApiKey: 10000,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
};
```

### 4.2 AI Configuration
```typescript
// src/config/ai.ts
export const aiModels = {
  // DeepSeek for automation
  deepseek: {
    apiKey: config.deepseekApiKey,
    baseURL: 'https://api.deepseek.com/v1',
    models: {
      contentGeneration: 'deepseek-chat',
      summarization: 'deepseek-chat',
    },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 2000,
    },
  },
  
  // OpenRouter for user chat
  openrouter: {
    apiKey: config.openrouterApiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    models: {
      free: 'google/gemini-2.0-flash-exp:free',
      premium: 'anthropic/claude-3.5-sonnet',
    },
    defaultHeaders: {
      'HTTP-Referer': 'https://genai4code.com',
      'X-Title': 'GenAI4Code',
    },
  },
};
```

---

## 5. Authentication Service

### 5.1 JWT Utilities
```typescript
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JWTPayload {
  userId: string;
  email: string;
  tier: string;
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
}

export class JWTManager {
  static generateTokens(payload: JWTPayload): JWTTokens {
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry,
    });

    const refreshToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiry,
    });

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, config.jwtSecret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
```

### 5.2 Auth Service
```typescript
// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { JWTManager, type JWTPayload } from '../utils/jwt';
import { GoogleOAuth } from '../utils/google-oauth';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        // Store hashed password (you'll need to add this field to schema)
        // password: hashedPassword,
      },
    });

    // Generate tokens
    const tokens = JWTManager.generateTokens({
      userId: user.id,
      email: user.email,
      tier: user.tier,
    });

    return { user, tokens };
  }

  static async login(data: LoginData) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password (if using email/password)
    // const isValidPassword = await bcrypt.compare(data.password, user.password);
    // if (!isValidPassword) {
    //   throw new Error('Invalid credentials');
    // }

    // Generate tokens
    const tokens = JWTManager.generateTokens({
      userId: user.id,
      email: user.email,
      tier: user.tier,
    });

    return { user, tokens };
  }

  static async googleLogin(googleCode: string) {
    // Verify Google token and get user info
    const googleUser = await GoogleOAuth.verifyToken(googleCode);
    
    if (!googleUser) {
      throw new Error('Invalid Google token');
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        },
      });
    }

    // Generate tokens
    const tokens = JWTManager.generateTokens({
      userId: user.id,
      email: user.email,
      tier: user.tier,
    });

    return { user, tokens };
  }

  static async refreshToken(refreshToken: string) {
    const payload = JWTManager.verifyToken(refreshToken);
    
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokens = JWTManager.generateTokens({
      userId: user.id,
      email: user.email,
      tier: user.tier,
    });

    return tokens;
  }

  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        tier: true,
        interests: true,
        createdAt: true,
      },
    });
  }
}
```

---

## 6. Content Service

### 6.1 Content Service
```typescript
// src/services/content.service.ts
import { prisma } from '../config/database';

export interface ContentFilters {
  type?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export interface CreateContentData {
  type: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  category?: string;
  tags?: string[];
  metadata?: any;
  contributorId?: string;
}

export class ContentService {
  static async getContent(filters: ContentFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'approved', // Only show approved content to public
    };

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.featured !== undefined) where.featured = filters.featured;

    const [content, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          slug: true,
          excerpt: true,
          author: true,
          category: true,
          tags: true,
          featured: true,
          metadata: true,
          publishedAt: true,
        },
      }),
      prisma.contentItem.count({ where }),
    ]);

    return {
      content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getContentById(id: string) {
    return prisma.contentItem.findUnique({
      where: { id },
      include: {
        contributor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async getContentBySlug(slug: string) {
    return prisma.contentItem.findUnique({
      where: { slug },
      include: {
        contributor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async createContent(data: CreateContentData) {
    // Generate slug if not provided
    const slug = data.slug || this.generateSlug(data.title);

    // Check if slug already exists
    const existing = await prisma.contentItem.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error('Content with this slug already exists');
    }

    return prisma.contentItem.create({
      data: {
        type: data.type,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        category: data.category,
        tags: data.tags,
        metadata: data.metadata,
        contributorId: data.contributorId,
        status: 'pending', // All new content needs approval
      },
    });
  }

  static async updateContentStatus(id: string, status: string, adminNotes?: string) {
    return prisma.contentItem.update({
      where: { id },
      data: {
        status,
        // Store admin notes in metadata or separate field
        metadata: {
          update: {
            adminNotes,
            reviewedAt: new Date().toISOString(),
          },
        },
      },
    });
  }

  static async getPendingContent(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      prisma.contentItem.findMany({
        where: { status: 'pending' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.contentItem.count({ where: { status: 'pending' } }),
    ]);

    return {
      content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

---

## 7. Chat Service

### 7.1 Chat Service
```typescript
// src/services/chat.service.ts
import { prisma } from '../config/database';
import { AIService } from './ai.service';
import { config } from '../config';

export interface CreateSessionData {
  userId: string;
  mode: 'research' | 'learning';
  title?: string;
}

export interface SendMessageData {
  sessionId: string;
  userId: string;
  content: string;
  context?: string; // Content context (e.g., research paper)
}

export class ChatService {
  static async createSession(data: CreateSessionData) {
    // Check user tier limits
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Free tier: Check daily message limit
    if (user.tier === 'free') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const messageCount = await prisma.chatMessage.count({
        where: {
          session: {
            userId: data.userId,
          },
          createdAt: {
            gte: today,
          },
        },
      });

      if (messageCount >= 50) {
        throw new Error('Daily message limit reached. Upgrade to Premium for unlimited messages.');
      }
    }

    return prisma.chatSession.create({
      data: {
        userId: data.userId,
        mode: data.mode,
        title: data.title || 'New Chat',
      },
    });
  }

  static async getUserSessions(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.chatSession.count({ where: { userId } }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getSession(sessionId: string, userId: string) {
    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  static async sendMessage(data: SendMessageData) {
    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: data.sessionId,
        userId: data.userId,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Check user tier limits
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Free tier: Check daily message limit
    if (user.tier === 'free') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const messageCount = await prisma.chatMessage.count({
        where: {
          session: {
            userId: data.userId,
          },
          createdAt: {
            gte: today,
          },
        },
      });

      if (messageCount >= 50) {
        throw new Error('Daily message limit reached. Upgrade to Premium for unlimited messages.');
      }
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: data.sessionId,
        role: 'user',
        content: data.content,
      },
    });

    // Get chat history for context
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: data.sessionId },
      orderBy: { createdAt: 'asc' },
      take: -10, // Last 10 messages
    });

    // Build context
    const context = this.buildContext(history, data.context);

    // Get AI response
    const aiResponse = await AIService.generateChatResponse(
      session.mode,
      context,
      user.tier
    );

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: data.sessionId,
        role: 'assistant',
        content: aiResponse.content,
        modelUsed: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed,
      },
    });

    // Update session updatedAt
    await prisma.chatSession.update({
      where: { id: data.sessionId },
      data: { updatedAt: new Date() },
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  static buildContext(
    history: any[],
    contentContext?: string
  ): string {
    let context = '';

    // Add content context if available (e.g., research paper)
    if (contentContext) {
      context += `Content Context:\n${contentContext}\n\n`;
    }

    // Add chat history
    context += 'Chat History:\n';
    history.forEach((msg) => {
      context += `${msg.role}: ${msg.content}\n`;
    });

    return context;
  }

  static async deleteSession(sessionId: string, userId: string) {
    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return prisma.chatSession.delete({
      where: { id: sessionId },
    });
  }
}
```

---

## 8. AI Service

### 8.1 AI Service
```typescript
// src/services/ai.service.ts
import axios from 'axios';
import { config } from '../config';

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
}

export class AIService {
  static async generateChatResponse(
    mode: 'research' | 'learning',
    context: string,
    userTier: string
  ): Promise<AIResponse> {
    // Select model based on user tier
    const model = userTier === 'premium'
      ? config.aiModels.openrouter.models.premium
      : config.aiModels.openrouter.models.free;

    try {
      const response = await axios.post(
        `${config.aiModels.openrouter.baseURL}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(mode),
            },
            {
              role: 'user',
              content: context,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.aiModels.openrouter.apiKey}`,
            ...config.aiModels.openrouter.defaultHeaders,
          },
        }
      );

      return {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        tokensUsed: response.data.usage.total_tokens,
      };
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  static async generateContent(
    type: string,
    prompt: string
  ): Promise<AIResponse> {
    try {
      const response = await axios.post(
        `${config.aiModels.deepseek.baseURL}/chat/completions`,
        {
          model: config.aiModels.deepseek.models.contentGeneration,
          messages: [
            {
              role: 'system',
              content: `You are a content generation assistant. Generate high-quality ${type} content.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.aiModels.deepseek.apiKey}`,
          },
        }
      );

      return {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        tokensUsed: response.data.usage.total_tokens,
      };
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error('Failed to generate content');
    }
  }

  static getSystemPrompt(mode: 'research' | 'learning'): string {
    if (mode === 'research') {
      return `You are an AI research assistant. Help users understand research papers, explain complex concepts, and provide insights. Be concise, accurate, and cite specific parts of the paper when relevant.`;
    }

    return `You are an AI learning assistant. Help users understand engineering concepts, explain code, and guide them through learning materials. Be patient, clear, and provide practical examples.`;
  }
}
```

---

## 9. Middleware

### 9.1 Authentication Middleware
```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTManager } from '../utils/jwt';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tier: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = JWTManager.verifyToken(token);

    if (!payload) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      tier: user.tier,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const requirePremium = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.tier !== 'premium') {
    return res.status(403).json({ error: 'Premium subscription required' });
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.tier !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### 9.2 Rate Limiting Middleware
```typescript
// src/middleware/rateLimit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { config } from '../config';
import { prisma } from '../config/database';

const redis = new Redis(config.redisUrl);

export const rateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = options.keyGenerator
        ? options.keyGenerator(req)
        : `ratelimit:${req.ip}`;

      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, options.windowMs / 1000);
      }

      if (current > options.maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: await redis.ttl(key),
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next(); // Continue on error
    }
  };
};

export const rateLimitByTier = () => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userTier = req.user?.tier || 'free';
      const limits = {
        free: config.rateLimitFree,
        premium: config.rateLimitPremium,
        admin: config.rateLimitPremium,
      };

      const key = `ratelimit:${userTier}:${req.user?.id || req.ip}`;
      const maxRequests = limits[userTier as keyof typeof limits];

      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, 60); // 1 minute window
      }

      if (current > maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `You have exceeded the ${maxRequests} requests per minute limit for ${userTier} tier`,
        });
      }

      next();
    } catch (error) {
      console.error('Tier rate limit error:', error);
      next();
    }
  };
};
```

---

## 10. Routes

### 10.1 Main Router
```typescript
// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import contentRoutes from './content.routes';
import chatRoutes from './chat.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import apiKeyRoutes from './api.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/chat', chatRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/api-keys', apiKeyRoutes);

export default router;
```

### 10.2 Auth Routes
```typescript
// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { user, tokens } = await AuthService.register(req.body);
    res.json({ user, tokens });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { user, tokens } = await AuthService.login(req.body);
    res.json({ user, tokens });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Google Login
router.post('/google', async (req, res) => {
  try {
    const { code } = req.body;
    const { user, tokens } = await AuthService.googleLogin(code);
    res.json({ user, tokens });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

// Get Current User
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await AuthService.getUserById(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;
```

---

## 11. Main Application

### 11.1 Express App
```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { rateLimit } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // limit each IP to 1000 requests per windowMs
}));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

export default app;
```

---

## 12. Environment Variables

### 12.1 .env.example
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/genai4code?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Providers
DEEPSEEK_API_KEY="sk-your-deepseek-api-key"
OPENROUTER_API_KEY="sk-or-your-openrouter-api-key"

# Redis
REDIS_URL="redis://localhost:6379"

# CORS
CORS_ORIGIN="http://localhost:3000,https://genai4code.com"
```

---

## 13. Deployment

### 13.1 Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start app
CMD ["node", "dist/index.js"]
```

### 13.2 Render Deployment
```yaml
# render.yaml
services:
  - type: web
    name: genai4code-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: DEEPSEEK_API_KEY
        sync: false
      - key: OPENROUTER_API_KEY
        sync: false
      - key: REDIS_URL
        sync: false
```

---

## 14. Testing

### 14.1 Test Setup
```bash
npm install -D jest @types/jest ts-jest supertest

# jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
```

### 14.2 Example Test
```typescript
// src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';

describe('Auth API', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({});
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.tokens).toBeDefined();
  });
});
```

---

## 15. Next Steps

1. **Set up database**: Run `prisma migrate dev`
2. **Configure environment variables**: Copy `.env.example` to `.env`
3. **Test locally**: Run `npm run dev`
4. **Deploy to Render**: Use the provided `render.yaml`
5. **Set up CI/CD**: GitHub Actions for automated deployment

**Ready to implement the admin dashboard? Check the admin implementation guide next.**
