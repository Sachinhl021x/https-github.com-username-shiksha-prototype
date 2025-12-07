# GenAI4Code - Separate Node.js/Express Backend Architecture

## 🎯 Executive Summary

This document outlines a **separate Node.js/Express backend architecture** for GenAI4Code, providing maximum scalability, flexibility, and clean separation between frontend and backend concerns.

**Architecture Type**: Microservices (Frontend + Backend API)
**Backend Framework**: Node.js + Express + TypeScript
**Database**: PostgreSQL (Supabase/Neon)
**Estimated Cost**: $5-25/month total

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer (Vercel - Free)"
        A[Next.js 15<br/>genai4code.com]
        B[Static Assets<br/>CDN Cached]
        C[API Client<br/>/lib/api-client.ts]
    end

    subgraph "Backend API (Render/Railway - $7-20/mo)"
        D[Express.js Server<br/>api.genai4code.com]
        E[API Routes<br/>/api/v1/*]
        F[Authentication<br/>JWT + Passport.js]
        G[Rate Limiting<br/>Redis]
        H[Background Jobs<br/>Bull Queue]
    end

    subgraph "Database Layer (Supabase - Free tier)"
        I[PostgreSQL<br/>Primary DB]
        J[Row Level Security<br/>RLS Policies]
        K[Storage Buckets<br/>S3-compatible]
    end

    subgraph "External Services"
        L[OpenRouter AI<br/>Free tier]
        M[DuckDuckGo Search<br/>Free]
        N[ArXiv API<br/>Free]
        O[GitHub API<br/>Free]
    end

    subgraph "Automation (Vercel Cron + Backend)"
        P[Vercel Cron Jobs<br/>Triggers]
        Q[Backend Workers<br/>Bull Queue]
        R[Supabase Edge<br/>Lightweight tasks]
    end

    subgraph "Monitoring"
        S[Logflare<br/>API logging]
        T[Uptime Robot<br/>Health checks]
        U[Render Metrics<br/>Performance]
    end

    A --> C
    C --> D
    D --> I
    D --> L
    Q --> I
    Q --> L
    Q --> M
    Q --> N
    Q --> O
    P --> Q
    D --> S
    D --> G
```

---

## 📁 Project Structure

```
genai4code/
├── website/                    # Next.js Frontend (Vercel)
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React Components
│   │   ├── lib/
│   │   │   └── api-client.ts  # API client for backend
│   │   └── types/             # Shared TypeScript types
│   ├── package.json
│   └── next.config.js
│
├── backend/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── jobs/              # Background jobs
│   │   ├── types/             # TypeScript types
│   │   └── app.ts             # Express app setup
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── shared/                     # Shared types and utilities
│   ├── types/
│   └── constants/
│
└── scripts/                    # Deployment and automation scripts
```

---

## 🔧 Backend Architecture Details

### Core Technology Stack

```json
{
  "runtime": "Node.js 20+",
  "framework": "Express.js 4.18+",
  "language": "TypeScript 5.3+",
  "database": {
    "primary": "PostgreSQL 15+",
    "orm": "Prisma 5+",
    "migration": "Prisma Migrate"
  },
  "authentication": {
    "primary": "Passport.js",
    "jwt": "jsonwebtoken",
    "strategies": ["jwt", "google", "github"]
  },
  "background_jobs": {
    "queue": "BullMQ",
    "redis": "Upstash Redis"
  },
  "validation": "Zod",
  "api_docs": "Swagger/OpenAPI",
  "testing": "Jest + Supertest"
}
```

### Backend API Structure

```typescript
// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import contentRoutes from './content';
import newsRoutes from './news';
import researchRoutes from './research';
import adminRoutes from './admin';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/news', newsRoutes);
router.use('/research', researchRoutes);

// Protected routes
router.use('/user', authenticateJWT, userRoutes);
router.use('/admin', authenticateJWT, requireAdmin, adminRoutes);

export default router;
```

### API Endpoints Specification

```yaml
# Public APIs (No authentication required)
GET    /api/v1/health              # Health check
POST   /api/v1/auth/register       # User registration
POST   /api/v1/auth/login          # User login
POST   /api/v1/auth/refresh        # Refresh token
GET    /api/v1/content             # List content (paginated)
GET    /api/v1/content/:slug       # Get single content
GET    /api/v1/news                # Get AI news
GET    /api/v1/research/papers     # Get research papers
GET    /api/v1/research/trending   # Get trending papers

# Protected APIs (JWT authentication required)
GET    /api/v1/user/profile        # Get user profile
PUT    /api/v1/user/profile        # Update profile
GET    /api/v1/user/preferences    # Get preferences
PUT    /api/v1/user/preferences    # Update preferences
POST   /api/v1/content/:id/like    # Like content
POST   /api/v1/content/:id/bookmark # Bookmark content
GET    /api/v1/user/bookmarks      # Get bookmarks

# Admin APIs (Admin role required)
GET    /api/v1/admin/users         # List all users
PUT    /api/v1/admin/users/:id     # Update user role
POST   /api/v1/admin/content       # Create content
PUT    /api/v1/admin/content/:id   # Update content
DELETE /api/v1/admin/content/:id   # Delete content
GET    /api/v1/admin/analytics     # Get analytics
POST   /api/v1/admin/automation    # Trigger automation

# Internal APIs (Service-to-service, API key required)
POST   /api/v1/internal/cron/news-generation   # Trigger news generation
POST   /api/v1/internal/cron/research-sync     # Sync research papers
POST   /api/v1/internal/webhooks/github        # GitHub webhooks
```

---

## 🔐 Authentication Architecture

### JWT-Based Authentication Flow

```mermaid
sequenceDiagram
    participant Client as Frontend (Next.js)
    participant API as Backend API (Express)
    participant DB as PostgreSQL
    participant Redis as Redis Cache

    Client->>API: POST /auth/register (email, password)
    API->>DB: Create user
    DB-->>API: User created
    API->>API: Hash password
    API->>API: Generate JWT tokens
    API->>Redis: Store refresh token
    API-->>Client: { accessToken, refreshToken, user }

    Client->>API: POST /auth/login (email, password)
    API->>DB: Find user
    DB-->>API: User data
    API->>API: Verify password
    API->>API: Generate JWT tokens
    API->>Redis: Store refresh token
    API-->>Client: { accessToken, refreshToken, user }

    Client->>API: GET /user/profile
    Note over Client,API: Authorization: Bearer <accessToken>
    API->>API: Verify JWT
    API->>DB: Fetch user profile
    DB-->>API: Profile data
    API-->>Client: User profile

    Client->>API: POST /auth/refresh
    Note over Client,API: { refreshToken }
    API->>Redis: Verify refresh token
    Redis-->>API: Token valid
    API->>API: Generate new accessToken
    API-->>Client: { accessToken }
```

### Token Structure

```typescript
// Access Token (Short-lived: 15 minutes)
interface AccessToken {
  sub: string;          // User ID
  email: string;
  role: string;         // user, admin, contributor
  tier: string;         // free, pro, enterprise
  iat: number;          // Issued at
  exp: number;          // Expires at (15 min)
}

// Refresh Token (Long-lived: 7 days)
interface RefreshToken {
  sub: string;          // User ID
  jti: string;          // Unique token ID
  iat: number;
  exp: number;          // Expires at (7 days)
}
```

---

## 💾 Database Architecture

### PostgreSQL Schema (Prisma)

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model (extends Supabase Auth)
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  role          Role      @default(USER)
  subscription  SubscriptionTier @default(FREE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  profile       UserProfile?
  preferences   UserPreferences?
  apiKeys       ApiKey[]
  interactions  UserInteraction[]
  comments      Comment[]
  bookmarks     Bookmark[]
  
  @@map("users")
}

model UserProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  username    String?  @unique
  fullName    String?
  avatarUrl   String?
  bio         String?
  website     String?
  location    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_profiles")
}

model UserPreferences {
  id                  String   @id @default(uuid())
  userId              String   @unique
  theme               String   @default("light")
  notificationsEnabled Boolean @default(true)
  emailDigest         Boolean  @default(true)
  preferredCategories String[] // Array of category slugs
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_preferences")
}

model ContentItem {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  type        ContentType
  category    String?
  content     String   @db.Text
  excerpt     String?
  author      String?
  authorId    String?
  status      ContentStatus @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  metadata    Json?    // Flexible metadata storage
  viewCount   Int      @default(0)
  likeCount   Int      @default(0)
  shareCount  Int      @default(0)
  
  tags        ContentTag[]
  comments    Comment[]
  interactions UserInteraction[]
  bookmarks   Bookmark[]
  
  @@index([type, status])
  @@index([publishedAt])
  @@map("content_items")
}

model ContentTag {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?
  createdAt   DateTime @default(now())
  
  contents    ContentItem[]
  
  @@map("content_tags")
}

model UserInteraction {
  id        String           @id @default(uuid())
  userId    String
  contentId String
  type      InteractionType
  createdAt DateTime         @default(now())
  
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  content   ContentItem      @relation(fields: [contentId], references: [id], onDelete: Cascade)
  
  @@unique([userId, contentId, type])
  @@map("user_interactions")
}

model Bookmark {
  id        String      @id @default(uuid())
  userId    String
  contentId String
  createdAt DateTime    @default(now())
  
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  content   ContentItem @relation(fields: [contentId], references: [id], onDelete: Cascade)
  
  @@unique([userId, contentId])
  @@map("bookmarks")
}

model Comment {
  id        String   @id @default(uuid())
  contentId String
  userId    String
  parentId  String?
  content   String   @db.Text
  status    CommentStatus @default(APPROVED)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  content   ContentItem @relation(fields: [contentId], references: [id], onDelete: Cascade)
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  
  @@map("comments")
}

model AutomationJob {
  id          String        @id @default(uuid())
  jobType     String        // news_generation, research_sync, etc.
  status      JobStatus     @default(PENDING)
  parameters  Json?
  result      Json?
  errorMessage String?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime      @default(now())
  
  @@index([status, createdAt])
  @@map("automation_jobs")
}

model ApiKey {
  id          String   @id @default(uuid())
  userId      String
  name        String
  keyHash     String   @unique
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("api_keys")
}

// Enums
enum Role {
  USER
  CONTRIBUTOR
  ADMIN
}

enum SubscriptionTier {
  FREE
  PRO
  ENTERPRISE
}

enum ContentType {
  NEWS
  ENGINEERING
  RESEARCH
  PRODUCT
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum InteractionType {
  VIEW
  LIKE
  SHARE
}

enum CommentStatus {
  APPROVED
  PENDING
  SPAM
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

---

## 🤖 Automation & Background Jobs

### Bull Queue Architecture

```typescript
// src/jobs/queue.ts
import Queue from 'bull';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);

// Job queues
export const newsGenerationQueue = new Queue('news-generation', {
  redis: { client: redisClient }
});

export const researchSyncQueue = new Queue('research-sync', {
  redis: { client: redisClient }
});

export const githubSyncQueue = new Queue('github-sync', {
  redis: { client: redisClient }
});

// Job processors
newsGenerationQueue.process(async (job) => {
  const { angles } = job.data;
  const results = [];
  
  for (const angle of angles) {
    try {
      // Search for sources
      const sources = await searchDuckDuckGo(angle.query);
      
      // Generate article
      const article = await generateArticle(angle, sources);
      
      // Save to database
      await saveArticle(article);
      
      results.push(article);
    } catch (error) {
      console.error(`Failed to generate article for ${angle.title}:`, error);
    }
  }
  
  return results;
});

// Cron job triggers (called from Vercel Cron)
export async function triggerNewsGeneration() {
  const angles = await generateStoryAngles();
  
  await newsGenerationQueue.add({
    angles,
    timestamp: new Date().toISOString()
  });
}
```

---

## 🚀 Deployment Architecture

### Backend Deployment Options

#### Option 1: Render.com (Recommended)
```yaml
Service: Render Web Service
Cost: $7-25/month
Plan: Starter ($7/mo) or Standard ($25/mo)

Features:
  - Automatic GitHub deployment
  - Custom domains with SSL
  - PostgreSQL managed database
  - Redis for caching/queues
  - Cron job support
  - Metrics and logging
  - Zero-downtime deployments

Configuration:
  Build Command: npm run build
  Start Command: npm start
  Environment Variables:
    - DATABASE_URL
    - REDIS_URL
    - JWT_SECRET
    - OPENROUTER_API_KEY
    - CORS_ORIGIN=https://genai4code.com
```

#### Option 2: Railway.app
```yaml
Service: Railway.app
Cost: $5-20/month
Plan: Starter ($5/mo) or Pro ($20/mo)

Features:
  - GitHub integration
  - Automatic deployments
  - Managed PostgreSQL
  - Redis support
  - Cron jobs via GitHub Actions
  - Metrics dashboard

Configuration:
  Similar to Render, with slightly different pricing
```

#### Option 3: Fly.io
```yaml
Service: Fly.io
Cost: $5-30/month (usage-based)
Features:
  - Global edge deployment
  - PostgreSQL clusters
  - Upstash Redis
  - Very cost-effective for small apps
  - Automatic scaling
```

### Frontend Deployment (Vercel)
```yaml
Service: Vercel Hobby Plan
Cost: $0/month
Configuration:
  Framework: Next.js
  Build Command: npm run build
  Environment Variables:
    - NEXT_PUBLIC_API_URL=https://api.genai4code.com
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 🔒 Security Architecture

### API Security Layers

```typescript
// src/middleware/security.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });

// Rate limiting
export const apiLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

export const authLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000,
  max: 5, // stricter limit for auth endpoints
  message: 'Too many authentication attempts'
});

// API Key authentication for internal services
export function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Verify API key in database
  const keyRecord = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiKey(apiKey) }
  });
  
  if (!keyRecord || (keyRecord.expiresAt && keyRecord.expiresAt < new Date())) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }
  
  // Update last used
  await prisma.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() }
  });
  
  req.user = { id: keyRecord.userId };
  next();
}

// CORS configuration
export const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};
```

---

## 📊 Updated Cost Analysis

### Monthly Cost Breakdown (Separate Backend)

| Service | Free Tier | Paid Tier (Recommended) | When to Upgrade |
|---------|-----------|------------------------|-----------------|
| **Vercel Frontend** | $0 (Hobby) | $20/month (Pro) | >100GB bandwidth or team features |
| **Render Backend** | N/A | $7/month (Starter) | Required for Node.js backend |
| **PostgreSQL** | $0 (Supabase) | $25/month (Supabase Pro) | >500MB data or need backups |
| **Redis** | $0 (Upstash) | $5/month (Upstash) | >10k commands/day |
| **Monitoring** | $0 (Logflare) | $15/month (Logflare) | >1M events/month |
| **OpenRouter** | $0 (Free models) | Pay-per-use | Need premium models |
| **Total** | **$7/month** | **$72/month** | Scale based on usage |

### Cost Optimization Strategies

1. **Start with**: Render Starter ($7) + Supabase Free + Upstash Free
2. **Scale to**: Render Standard ($25) when needing more performance
3. **Database**: Upgrade to Supabase Pro ($25) when hitting 500MB limit
4. **Monitoring**: Stay on free tiers until 1M+ events/month

---

## 🛠️ Implementation Roadmap

### Phase 1: Backend Foundation (Week 1-2)

**Week 1: Setup & Database**
- [ ] Initialize Node.js/Express project with TypeScript
- [ ] Set up Prisma with PostgreSQL schema
- [ ] Create basic Express server structure
- [ ] Implement health check endpoint
- [ ] Set up development environment with Docker

**Week 2: Authentication**
- [ ] Implement Passport.js with JWT strategy
- [ ] Create auth routes (register, login, refresh)
- [ ] Add password hashing with bcrypt
- [ ] Implement token refresh mechanism
- [ ] Set up Redis for token storage

### Phase 2: Core API (Week 3-4)

**Week 3: Content Management**
- [ ] Implement content CRUD endpoints
- [ ] Add pagination and filtering
- [ ] Create tag management system
- [ ] Implement search functionality
- [ ] Add content validation with Zod

**Week 4: User Features**
- [ ] Implement user profile endpoints
- [ ] Add preferences management
- [ ] Create bookmark system
- [ ] Implement user interactions (likes, views)
- [ ] Add comment system

### Phase 3: Automation & Integration (Week 5-6)

**Week 5: Background Jobs**
- [ ] Set up BullMQ with Redis
- [ ] Implement news generation job
- [ ] Create research paper sync job
- [ ] Add GitHub repository monitoring
- [ ] Implement job status tracking

**Week 6: AI Integration**
- [ ] Integrate OpenRouter API
- [ ] Implement DuckDuckGo search
- [ ] Add ArXiv API integration
- [ ] Create GitHub API client
- [ ] Add API cost tracking

### Phase 4: Security & Deployment (Week 7-8)

**Week 7: Security & Monitoring**
- [ ] Implement rate limiting
- [ ] Add API key authentication
- [ ] Set up CORS policies
- [ ] Implement request logging
- [ ] Add error tracking

**Week 8: Deployment & Testing**
- [ ] Deploy to Render.com
- [ ] Set up CI/CD pipeline
- [ ] Configure environment variables
- [ ] Add API documentation (Swagger)
- [ ] Write integration tests

---

## 📝 API Documentation (Swagger)

```yaml
openapi: 3.0.0
info:
  title: GenAI4Code API
  version: 1.0.0
  description: Backend API for GenAI4Code platform

servers:
  - url: https://api.genai4code.com
    description: Production server
  - url: http://localhost:3001
    description: Development server

paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: Service is healthy

  /auth/register:
    post:
      summary: User registration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                username:
                  type: string
                  minLength: 3
      responses:
        '201':
          description: User created successfully
        '400':
          description: Invalid input

  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                  refreshToken:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /content:
    get:
      summary: List content
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: type
          in: query
          schema:
            type: string
            enum: [news, engineering, research, product]
      responses:
        '200':
          description: Content list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Content'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        role:
          type: string
          enum: [user, contributor, admin]
        createdAt:
          type: string
          format: date-time
    
    Content:
      type: object
      properties:
        id:
          type: string
          format: uuid
        slug:
          type: string
        title:
          type: string
        type:
          type: string
        content:
          type: string
        excerpt:
          type: string
        author:
          type: string
        publishedAt:
          type: string
          format: date-time
        tags:
          type: array
          items:
            type: string
    
    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        pages:
          type: integer
```

---

## 🔄 Frontend Integration

### API Client Implementation

```typescript
// website/src/lib/api-client.ts
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const session = await getSession();
    const token = session?.accessToken;

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Public APIs
  async getContent(filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/v1/content?${params}`);
  }

  async getContentBySlug(slug: string) {
    return this.request(`/api/v1/content/${slug}`);
  }

  async getNews() {
    return this.request('/api/v1/news');
  }

  async getResearchPapers() {
    return this.request('/api/v1/research/papers');
  }

  // Protected APIs
  async getUserProfile() {
    return this.request('/api/v1/user/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/api/v1/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async likeContent(contentId: string) {
    return this.request(`/api/v1/content/${contentId}/like`, {
      method: 'POST',
    });
  }

  async bookmarkContent(contentId: string) {
    return this.request(`/api/v1/content/${contentId}/bookmark`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
```

### NextAuth.js Configuration

```typescript
// website/src/lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { 'Content-Type': 'application/json' }
        });

        const user = await res.json();

        if (res.ok && user) {
          return {
            id: user.id,
            email: user.email,
            name: user.username,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
};

export default NextAuth(authOptions);
```

---

## 🎯 Benefits of This Architecture

### ✅ Advantages

1. **Clear Separation of Concerns**
   - Frontend: Pure presentation layer
   - Backend: Business logic and data management
   - Database: Data persistence

2. **Scalability**
   - Scale frontend and backend independently
   - Backend can handle heavy processing without affecting frontend
   - Database can be optimized separately

3. **Flexibility**
   - Backend can serve multiple clients (web, mobile, CLI)
   - Easy to swap frontend frameworks if needed
   - Can use different hosting providers for each service

4. **Development Experience**
   - Separate development servers
   - Independent deployment pipelines
   - Clear API contract between services

5. **Performance**
   - Backend can be optimized for API performance
   - Frontend can be optimized for user experience
   - Redis caching for frequently accessed data

6. **Security**
   - Clear authentication boundaries
   - API keys for service-to-service communication
   - Rate limiting at multiple levels

### ⚠️ Considerations

1. **Complexity**: More moving parts than monolithic approach
2. **Latency**: Additional network hop between frontend and backend
3. **CORS**: Need to configure cross-origin requests
4. **Deployment**: Need to manage two separate deployments

---

## 🚀 Getting Started

### Quick Start Commands

```bash
# Clone repository
git clone <repository-url>
cd genai4code

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:push  # Push schema to database
npm run dev      # Start backend server

# Setup frontend (in new terminal)
cd ../website
npm install
cp .env.example .env.local
# Edit .env.local with API URL
npm run dev      # Start frontend server
```

### Environment Variables

```bash
# Backend .env
DATABASE_URL="postgresql://user:password@host:5432/genai4code"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
OPENROUTER_API_KEY="your-openrouter-key"
CORS_ORIGIN="http://localhost:3000,https://genai4code.com"
PORT=3001
NODE_ENV=development

# Frontend .env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 📈 Scaling Strategy

### Phase 1: Initial Launch (0-100 users)
- Render Starter ($7/month)
- Supabase Free tier
- Upstash Free tier
- **Total: $7/month**

### Phase 2: Growing (100-1000 users)
- Render Standard ($25/month)
- Supabase Pro ($25/month)
- Upstash Paid ($5/month)
- **Total: $55/month**

### Phase 3: Scaling (1000-10000 users)
- Render Standard + additional instances
- Supabase Pro with read replicas
- Upstash Pro ($20/month)
- Cloudflare for CDN
- **Total: $150-300/month**

---

**This architecture provides maximum flexibility, scalability, and maintainability while keeping costs low during the initial phases. The clear separation between frontend and backend allows for independent scaling and optimization of each service.**