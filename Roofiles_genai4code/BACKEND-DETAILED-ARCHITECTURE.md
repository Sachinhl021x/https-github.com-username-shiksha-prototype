# Backend Detailed Architecture - GenAI4Code

**Document Version**: 1.0  
**Last Updated**: 2025-12-01  
**Purpose**: Comprehensive reference for backend implementation with complete folder structure, component breakdown, and code examples

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Component Breakdown](#component-breakdown)
3. [Middleware Layer](#middleware-layer)
4. [Services Layer](#services-layer)
5. [Controllers Layer](#controllers-layer)
6. [Routes Layer](#routes-layer)
7. [Background Jobs](#background-jobs)
8. [Type Definitions](#type-definitions)
9. [Utility Functions](#utility-functions)
10. [Key Features](#key-features)

---

## Project Structure

```
backend/
├── src/
│   ├── config/                    # Configuration
│   │   ├── database.ts           # Prisma client
│   │   ├── redis.ts              # Redis client
│   │   ├── ai-models.ts          # AI model configs
│   │   └── environment.ts        # Environment validation
│   │
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.ts    # Login, register, OAuth
│   │   ├── news.controller.ts    # News CRUD operations
│   │   ├── chat.controller.ts    # Chat session management
│   │   ├── user.controller.ts    # User profile management
│   │   └── admin.controller.ts   # Admin operations
│   │
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts       # JWT, password hashing
│   │   ├── news-generation.service.ts  # AI news pipeline
│   │   ├── chat.service.ts       # Chat history & AI calls
│   │   ├── content.service.ts    # Content management
│   │   ├── ai-orchestrator.service.ts  # Multi-provider AI
│   │   ├── usage-tracking.service.ts   # Analytics & limits
│   │   └── notification.service.ts     # Email/webhook alerts
│   │
│   ├── routes/                   # API route definitions
│   │   ├── index.ts              # Main router
│   │   ├── auth.routes.ts        # /api/auth/*
│   │   ├── news.routes.ts        # /api/news/*
│   │   ├── chat.routes.ts        # /api/chat/*
│   │   ├── user.routes.ts        # /api/users/*
│   │   └── admin.routes.ts       # /api/admin/*
│   │
│   ├── middleware/               # Express middleware
│   │   ├── authenticate.ts       # JWT verification
│   │   ├── require-admin.ts      # Admin role check
│   │   ├── rate-limiter.ts       # Tier-based rate limiting
│   │   ├── error-handler.ts      # Global error handling
│   │   ├── validation.ts         # Request validation
│   │   └── logger.ts             # Request logging
│   │
│   ├── jobs/                     # Background jobs (BullMQ)
│   │   ├── news-generation.job.ts
│   │   ├── research-curation.job.ts
│   │   ├── github-monitoring.job.ts
│   │   └── content-audit.job.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── express.d.ts          # Custom Express types
│   │   ├── api.ts                # API request/response types
│   │   ├── database.ts           # Database entity types
│   │   └── ai-models.ts          # AI provider types
│   │
│   ├── utils/                    # Helper functions
│   │   ├── token-utils.ts        # JWT token operations
│   │   ├── password-utils.ts     # Password hashing
│   │   ├── slugify.ts            # URL slug generation
│   │   ├── validators.ts         # Zod validation schemas
│   │   └── cost-calculator.ts    # AI cost tracking
│   │
│   └── app.ts                    # Express app setup
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
│
├── tests/                        # Test suites
│   ├── unit/
│   └── integration/
│
├── scripts/                      # Utility scripts
│   ├── seed.ts                   # Database seeding
│   └── migrate.ts                # Data migration
│
├── Dockerfile                    # Container setup
├── docker-compose.yml            # Local development
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Component Breakdown

### 1. Middleware Layer (Request Hooks)

#### `middleware/authenticate.ts`
JWT authentication middleware that verifies tokens and attaches user to request.

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token-utils';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    tier: 'free' | 'premium' | 'admin';
  };
}

export const authenticate = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }
    
    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};
```

#### `middleware/rate-limiter.ts`
Tier-based rate limiting using Redis.

```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import { AuthenticatedRequest } from './authenticate';

const redis = createClient({ url: process.env.REDIS_URL });

export const rateLimiter = (tier: 'free' | 'premium' | 'admin') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const limits = {
      free: { requests: 100, window: 60 }, // 100 req/min
      premium: { requests: 1000, window: 60 }, // 1000 req/min
      admin: { requests: 10000, window: 60 } // 10000 req/min
    };
    
    const { requests, window } = limits[tier];
    const key = `rate_limit:${req.user.id}:${tier}`;
    
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    if (current > requests) {
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: ttl,
        limit: requests,
        window: `${window} seconds`
      });
    }
    
    res.setHeader('X-RateLimit-Limit', requests);
    res.setHeader('X-RateLimit-Remaining', requests - current);
    res.setHeader('X-RateLimit-Reset', Date.now() + (window * 1000));
    
    next();
  };
};
```

#### `middleware/require-admin.ts`
Admin role verification middleware.

```typescript
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';

export const requireAdmin = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.tier !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  
  next();
};
```

---

### 2. Services Layer (Business Logic)

#### `services/news-generation.service.ts`
Core AI news generation pipeline.

```typescript
import { PrismaClient } from '@prisma/client';
import { AIOrchestratorService } from './ai-orchestrator.service';
import { SearchService } from './search.service';
import { ContentItem } from '../types/database';

const prisma = new PrismaClient();

export interface Angle {
  title: string;
  query: string;
  focus: string;
}

export class NewsGenerationService {
  private aiOrchestrator: AIOrchestratorService;
  private searchService: SearchService;

  constructor() {
    this.aiOrchestrator = new AIOrchestratorService();
    this.searchService = new SearchService();
  }

  async generateNewsStories(count: number = 3): Promise<ContentItem[]> {
    console.log(`[NewsGeneration] Starting pipeline for ${count} articles`);
    
    // 1. Brainstorm unique angles
    const angles = await this.brainstormAngles(count);
    console.log(`[NewsGeneration] Brainstormed ${angles.length} angles`);
    
    // 2. Generate each article
    const articles: ContentItem[] = [];
    for (let i = 0; i < angles.length; i++) {
      try {
        console.log(`[NewsGeneration] Generating article ${i + 1}/${angles.length}`);
        
        // Add delay to avoid rate limits
        if (i > 0) await this.sleep(2000);
        
        const article = await this.generateArticle(angles[i]);
        articles.push(article);
        
      } catch (error) {
        console.error(`[NewsGeneration] Failed article ${i + 1}:`, error);
        continue; // Continue with next article
      }
    }
    
    // 3. Save to database
    const saved = await this.saveArticles(articles);
    console.log(`[NewsGeneration] Saved ${saved.length} articles`);
    
    return saved;
  }

  private async brainstormAngles(count: number): Promise<Angle[]> {
    const today = new Date().toLocaleDateString();
    const prompt = `
      You are the Editor-in-Chief of a top AI Tech Publication.
      Today is ${today}.
      Identify ${count} distinct, high-impact story angles based on likely breaking news or major trends in AI right now.
      Avoid generic "AI is growing" stories. Look for specific model releases, benchmarks, or corporate moves.
      
      Return a JSON object with an "angles" array containing exactly ${count} objects, each with:
      - title: A catchy headline
      - query: A specific search query to find facts for this story
      - focus: What specific details the journalist should look for
      
      Example format: {"angles": [{"title": "DeepSeek V3 Crushes Benchmarks", "query": "DeepSeek V3 benchmark results vs GPT-4", "focus": "Technical specs and coding performance"}, {...}, {...}]}
      
      IMPORTANT: Return exactly ${count} distinct angles.
    `;

    const result = await this.aiOrchestrator.generateStructured(
      prompt, 
      'deepseek-v3.2',
      { responseFormat: 'json_object' }
    );
    
    const parsed = JSON.parse(result);
    return parsed.angles || this.getFallbackAngles(count);
  }

  private async generateArticle(angle: Angle): Promise<ContentItem> {
    // Search for recent sources
    const sources = await this.searchService.search(angle.query);
    
    // Generate article content
    const articleContent = await this.aiOrchestrator.generateArticle(
      angle,
      sources
    );
    
    // Generate image
    const imageUrl = await this.generateImage(
      articleContent.title,
      articleContent.tags
    );
    
    return {
      id: crypto.randomUUID(),
      type: 'news',
      title: articleContent.title,
      slug: this.generateSlug(articleContent.title),
      excerpt: articleContent.excerpt,
      content: articleContent.content,
      author: 'AI Research Agent',
      generated_by: 'deepseek-v3.2',
      status: 'pending',
      tags: articleContent.tags,
      metadata: {
        sources,
        generationParams: {
          model: 'deepseek-v3.2',
          angle: angle.title
        }
      },
      imageUrl,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  private async saveArticles(articles: ContentItem[]): Promise<ContentItem[]> {
    const saved = await prisma.$transaction(
      articles.map(article => 
        prisma.content_items.create({ data: article })
      )
    );
    return saved;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateImage(title: string, tags: string[]): Promise<string> {
    const prompt = `${title}, ${tags.join(', ')}, cinematic lighting, highly detailed, 8k, tech news style, futuristic`;
    const encoded = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000);
    return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`;
  }

  private getFallbackAngles(count: number): Angle[] {
    const fallbacks = [
      {
        title: "AI Model Breakthrough: Latest Advances in Large Language Models",
        query: "latest LLM releases 2025",
        focus: "Model architecture and performance metrics"
      },
      {
        title: "GPU Wars: NVIDIA vs AMD in the AI Acceleration Race",
        query: "NVIDIA AMD AI chips 2025",
        focus: "Hardware specifications and pricing"
      },
      {
        title: "Enterprise AI Adoption Surges: What Companies Are Doing Differently",
        query: "enterprise AI adoption trends 2025",
        focus: "Use cases and ROI data"
      }
    ];
    return fallbacks.slice(0, count);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### `services/ai-orchestrator.service.ts`
Multi-provider AI management with cost optimization.

```typescript
import { OpenAI } from 'openai';

interface AIProvider {
  name: string;
  generateText(prompt: string, options: AIOptions): Promise<AIResult>;
  generateStructured(prompt: string, model: string, options?: AIOptions): Promise<string>;
  calculateCost(tokens: TokenUsage): number;
}

interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
  tier?: 'free' | 'premium';
}

interface AIResult {
  text: string;
  tokens: TokenUsage;
  cost: number;
}

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export class AIOrchestratorService {
  private providers: Map<string, OpenAI>;
  private costs: Map<string, { input: number; output: number }>;

  constructor() {
    // Initialize providers
    this.providers = new Map();
    
    // DeepSeek V3.2 for premium/automation
    this.providers.set('deepseek-v3.2', new OpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY
    }));
    
    // OpenRouter for free tier (Gemini, Llama, etc.)
    this.providers.set('openrouter', new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.SITE_URL,
        'X-Title': 'GenAI4Code'
      }
    }));

    // Cost per 1M tokens
    this.costs = new Map([
      ['deepseek-v3.2', { input: 0.14, output: 0.28 }],
      ['google/gemini-2.0-flash-exp:free', { input: 0, output: 0 }],
      ['anthropic/claude-3.5-sonnet', { input: 3.00, output: 15.00 }]
    ]);
  }

  async generateText(
    prompt: string, 
    options: AIOptions = {}
  ): Promise<AIResult> {
    const provider = this.selectProvider(options);
    const model = this.selectModel(provider, options.tier);
    
    try {
      const completion = await provider.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        response_format: options.responseFormat === 'json_object' 
          ? { type: 'json_object' } 
          : undefined
      });

      const tokens = {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0
      };

      const cost = this.calculateCost(model, tokens);

      return {
        text: completion.choices[0].message.content || '',
        tokens,
        cost
      };
    } catch (error) {
      console.error(`AI generation failed with ${model}:`, error);
      throw error;
    }
  }

  async generateArticle(
    angle: Angle,
    sources: any[]
  ): Promise<GeneratedArticle> {
    const prompt = `
      You are a Senior AI Journalist.
      Write a full news article based on the following research.
      
      Headline: ${angle.title}
      Focus: ${angle.focus}
      Research Data: ${JSON.stringify(sources, null, 2)}
      
      Requirements:
      1. **Format**: Return a JSON object with:
         - "title": Final engaging headline
         - "excerpt": 2-sentence summary
         - "content": Full article in Markdown (at least 500 words). Use ## headers.
         - "tags": Array of 3-5 keywords
         - "slug": URL-friendly slug (e.g., "deepseek-v3-release")
      2. **Style**: Professional, technical, objective. No fluff.
      3. **Citations**: Reference key sources naturally in the text.
    `;

    const result = await this.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 3000,
      responseFormat: 'json_object',
      tier: 'premium' // Use premium for quality
    });

    const parsed = JSON.parse(result.text);
    
    return {
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      tags: parsed.tags || ['AI', 'Tech'],
      slug: parsed.slug || this.generateSlug(parsed.title)
    };
  }

  private selectProvider(options: AIOptions): OpenAI {
    // Free tier uses OpenRouter (free models)
    if (options.tier === 'free') {
      return this.providers.get('openrouter')!;
    }
    
    // Premium tier uses DeepSeek for quality
    return this.providers.get('deepseek-v3.2')!;
  }

  private selectModel(provider: OpenAI, tier?: string): string {
    if (tier === 'free') {
      return 'google/gemini-2.0-flash-exp:free';
    }
    return 'deepseek-chat';
  }

  private calculateCost(model: string, tokens: TokenUsage): number {
    const cost = this.costs.get(model);
    if (!cost) return 0;
    
    const inputCost = (tokens.prompt / 1_000_000) * cost.input;
    const outputCost = (tokens.completion / 1_000_000) * cost.output;
    
    return inputCost + outputCost;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

#### `services/usage-tracking.service.ts`
Analytics and usage limit enforcement.

```typescript
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authenticate';

const prisma = new PrismaClient();

export class UsageTrackingService {
  async trackApiCall(
    userId: string,
    endpoint: string,
    cost?: number,
    tokens?: number
  ) {
    await prisma.analytics_events.create({
      data: {
        user_id: userId,
        event_type: 'api_call',
        endpoint,
        cost: cost || 0,
        tokens_used: tokens || 0,
        timestamp: new Date()
      }
    });

    // Check and enforce limits
    await this.checkUserLimits(userId);
  }

  async trackChatMessage(
    userId: string,
    sessionId: string,
    messageType: 'user' | 'assistant',
    tokens: number,
    cost: number
  ) {
    await prisma.chat_messages.create({
      data: {
        session_id: sessionId,
        role: messageType,
        content: '', // Content stored separately for privacy
        tokens_used: tokens,
        cost: cost,
        timestamp: new Date()
      }
    });

    // Update session
    await prisma.chat_sessions.update({
      where: { id: sessionId },
      data: {
        total_tokens: { increment: tokens },
        total_cost: { increment: cost },
        updated_at: new Date()
      }
    });

    await this.checkChatLimits(userId);
  }

  async checkUserLimits(userId: string): Promise<boolean> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { tier: true }
    });

    if (!user) return false;

    const limits = {
      free: {
        messagesPerDay: 50,
        apiCallsPerMinute: 100,
        maxChatHistory: 10
      },
      premium: {
        messagesPerDay: Infinity,
        apiCallsPerMinute: 1000,
        maxChatHistory: 1000
      },
      admin: {
        messagesPerDay: Infinity,
        apiCallsPerMinute: 10000,
        maxChatHistory: Infinity
      }
    };

    const userLimits = limits[user.tier as keyof typeof limits];

    // Check daily message limit for free tier
    if (user.tier === 'free') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const messageCount = await prisma.chat_messages.count({
        where: {
          session: { user_id: userId },
          timestamp: { gte: today },
          role: 'user'
        }
      });

      if (messageCount >= userLimits.messagesPerDay) {
        throw new Error('DAILY_MESSAGE_LIMIT_EXCEEDED');
      }
    }

    return true;
  }

  async checkChatLimits(userId: string): Promise<boolean> {
    return this.checkUserLimits(userId);
  }

  async getUserUsage(
    userId: string,
    period: 'day' | 'week' | 'month' = 'day'
  ) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const [apiCalls, chatStats, totalCost] = await Promise.all([
      // API call count
      prisma.analytics_events.count({
        where: {
          user_id: userId,
          event_type: 'api_call',
          timestamp: { gte: startDate }
        }
      }),

      // Chat statistics
      prisma.chat_sessions.aggregate({
        where: {
          user_id: userId,
          updated_at: { gte: startDate }
        },
        _sum: {
          total_tokens: true,
          total_cost: true
        },
        _count: { id: true }
      }),

      // Total cost
      prisma.analytics_events.aggregate({
        where: {
          user_id: userId,
          timestamp: { gte: startDate }
        },
        _sum: { cost: true }
      })
    ]);

    return {
      period,
      apiCalls,
      chatSessions: chatStats._count.id,
      totalTokens: chatStats._sum.total_tokens || 0,
      totalCost: (totalCost._sum.cost || 0) + (chatStats._sum.total_cost || 0)
    };
  }

  async getAdminAnalytics(period: 'day' | 'week' | 'month' = 'day') {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const [
      totalUsers,
      activeUsers,
      totalArticles,
      totalCost,
      apiCalls,
      chatSessions
    ] = await Promise.all([
      // Total users
      prisma.users.count(),

      // Active users (made API calls in period)
      prisma.analytics_events.findMany({
        where: {
          event_type: 'api_call',
          timestamp: { gte: startDate }
        },
        distinct: ['user_id']
      }).then(events => events.length),

      // Total articles generated
      prisma.content_items.count({
        where: {
          type: 'news',
          created_at: { gte: startDate }
        }
      }),

      // Total cost
      prisma.analytics_events.aggregate({
        where: {
          timestamp: { gte: startDate }
        },
        _sum: { cost: true }
      }).then(result => result._sum.cost || 0),

      // Total API calls
      prisma.analytics_events.count({
        where: {
          event_type: 'api_call',
          timestamp: { gte: startDate }
        }
      }),

      // Total chat sessions
      prisma.chat_sessions.count({
        where: {
          created_at: { gte: startDate }
        }
      })
    ]);

    return {
      period,
      totalUsers,
      activeUsers,
      totalArticles,
      totalCost,
      apiCalls,
      chatSessions,
      averageCostPerUser: activeUsers > 0 ? totalCost / activeUsers : 0
    };
  }
}
```

---

### 3. Controllers Layer

#### `controllers/news.controller.ts`
News API endpoint handlers.

```typescript
import { Request, Response } from 'express';
import { NewsGenerationService } from '../services/news-generation.service';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authenticate';

const prisma = new PrismaClient();
const newsService = new NewsGenerationService();

export class NewsController {
  // GET /api/news - Get approved news articles
  async getNews(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const tag = req.query.tag as string;

      const whereClause: any = {
        type: 'news',
        status: 'approved'
      };

      if (tag) {
        whereClause.tags = { has: tag };
      }

      const [articles, total] = await Promise.all([
        prisma.content_items.findMany({
          where: whereClause,
          orderBy: { published_at: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.content_items.count({ where: whereClause })
      ]);

      res.json({
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  }

  // GET /api/news/:slug - Get single article
  async getNewsBySlug(req: Request, res: Response) {
    try {
      const article = await prisma.content_items.findUnique({
        where: { 
          slug: req.params.slug,
          type: 'news',
          status: 'approved'
        }
      });

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  }

  // POST /api/news/generate - Trigger news generation (admin only)
  async generateNews(req: AuthenticatedRequest, res: Response) {
    try {
      const { count = 3 } = req.body;

      // Add to BullMQ queue
      const newsQueue = req.app.get('newsQueue');
      const job = await newsQueue.add('generate-news', { count });

      res.json({
        success: true,
        jobId: job.id,
        status: 'queued',
        message: `News generation job ${job.id} queued`
      });
    } catch (error) {
      console.error('Error queuing news generation:', error);
      res.status(500).json({ error: 'Failed to queue news generation' });
    }
  }

  // GET /api/news/pending - Get pending articles (admin only)
  async getPendingNews(req: AuthenticatedRequest, res: Response) {
    try {
      const articles = await prisma.content_items.findMany({
        where: {
          type: 'news',
          status: 'pending'
        },
        orderBy: { created_at: 'desc' }
      });

      res.json(articles);
    } catch (error) {
      console.error('Error fetching pending news:', error);
      res.status(500).json({ error: 'Failed to fetch pending articles' });
    }
  }

  // PUT /api/news/:id/approve - Approve article (admin only)
  async approveNews(req: AuthenticatedRequest, res: Response) {
    try {
      const article = await prisma.content_items.update({
        where: { 
          id: req.params.id,
          type: 'news',
          status: 'pending'
        },
        data: {
          status: 'approved',
          published_at: new Date(),
          updated_at: new Date()
        }
      });

      res.json({
        success: true,
        article,
        message: 'Article approved and published'
      });
    } catch (error) {
      console.error('Error approving article:', error);
      res.status(500).json({ error: 'Failed to approve article' });
    }
  }

  // PUT /api/news/:id/reject - Reject article (admin only)
  async rejectNews(req: AuthenticatedRequest, res: Response) {
    try {
      const { reason } = req.body;

      const article = await prisma.content_items.update({
        where: { 
          id: req.params.id,
          type: 'news',
          status: 'pending'
        },
        data: {
          status: 'rejected',
          metadata: {
            rejectionReason: reason,
            rejectedAt: new Date(),
            rejectedBy: req.user.id
          },
          updated_at: new Date()
        }
      });

      res.json({
        success: true,
        article,
        message: 'Article rejected'
      });
    } catch (error) {
      console.error('Error rejecting article:', error);
      res.status(500).json({ error: 'Failed to reject article' });
    }
  }

  // DELETE /api/news/:id - Delete article (admin only)
  async deleteNews(req: AuthenticatedRequest, res: Response) {
    try {
      await prisma.content_items.delete({
        where: { 
          id: req.params.id,
          type: 'news'
        }
      });

      res.json({
        success: true,
        message: 'Article deleted'
      });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  }
}
```

#### `controllers/chat.controller.ts`
Chat session and message management.

```typescript
import { Response } from 'express';
import { ChatService } from '../services/chat.service';
import { UsageTrackingService } from '../services/usage-tracking.service';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const chatService = new ChatService();
const usageService = new UsageTrackingService();

export class ChatController {
  // POST /api/chat - Create or continue chat
  async createChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { messages, context, mode = 'research' } = req.body;
      const userId = req.user!.id;

      // Check rate limits
      await usageService.checkChatLimits(userId);

      // Get or create session
      const session = await chatService.getOrCreateSession(
        userId,
        mode,
        context
      );

      // Store user message
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        await chatService.storeMessage(
          session.id,
          'user',
          lastMessage.content,
          0, // Tokens will be calculated
          0
        );
      }

      // Generate AI response
      const response = await chatService.generateResponse(
        session.id,
        messages,
        context,
        req.user!.tier
      );

      // Store assistant message
      await chatService.storeMessage(
        session.id,
        'assistant',
        response.content,
        response.tokens.total,
        response.cost
      );

      // Track usage
      await usageService.trackChatMessage(
        userId,
        session.id,
        'assistant',
        response.tokens.total,
        response.cost
      );

      res.json({
        response: response.content,
        sessionId: session.id,
        tokensUsed: response.tokens.total,
        cost: response.cost
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      
      if (error.message === 'DAILY_MESSAGE_LIMIT_EXCEEDED') {
        return res.status(429).json({
          error: 'Daily message limit exceeded',
          code: 'DAILY_LIMIT',
          limit: 50,
          resetAt: new Date().setHours(24, 0, 0, 0)
        });
      }

      res.status(500).json({ error: 'Failed to process chat' });
    }
  }

  // GET /api/chat/history - Get user's chat history
  async getChatHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [sessions, total] = await Promise.all([
        prisma.chat_sessions.findMany({
          where: { user_id: req.user!.id },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
              take: 1 // Only get first message for preview
            }
          },
          orderBy: { updated_at: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.chat_sessions.count({
          where: { user_id: req.user!.id }
        })
      ]);

      res.json({
        sessions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  }

  // GET /api/chat/session/:id - Get specific session
  async getSession(req: AuthenticatedRequest, res: Response) {
    try {
      const session = await prisma.chat_sessions.findFirst({
        where: {
          id: req.params.id,
          user_id: req.user!.id
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  }

  // DELETE /api/chat/session/:id - Delete session
  async deleteSession(req: AuthenticatedRequest, res: Response) {
    try {
      await prisma.chat_sessions.delete({
        where: {
          id: req.params.id,
          user_id: req.user!.id
        }
      });

      res.json({
        success: true,
        message: 'Session deleted'
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
}
```

---

### 4. Routes Layer

#### `routes/news.routes.ts`
News API route definitions.

```typescript
import { Router } from 'express';
import { NewsController } from '../controllers/news.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/require-admin';
import { rateLimiter } from '../middleware/rate-limiter';

const router = Router();
const newsController = new NewsController();

// Public routes (no auth required)
router.get('/', newsController.getNews);
router.get('/:slug', newsController.getNewsBySlug);

// Protected routes (authentication required)
router.use(authenticate);

// Admin-only routes
router.post(
  '/generate',
  requireAdmin,
  rateLimiter('admin'),
  newsController.generateNews
);

router.get(
  '/pending',
  requireAdmin,
  newsController.getPendingNews
);

router.put(
  '/:id/approve',
  requireAdmin,
  newsController.approveNews
);

router.put(
  '/:id/reject',
  requireAdmin,
  newsController.rejectNews
);

router.delete(
  '/:id',
  requireAdmin,
  newsController.deleteNews
);

export default router;
```

#### `routes/chat.routes.ts`
Chat API route definitions.

```typescript
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/authenticate';
import { rateLimiter } from '../middleware/rate-limiter';

const router = Router();
const chatController = new ChatController();

// All routes require authentication
router.use(authenticate);

// Rate limiting based on user tier
router.post(
  '/',
  rateLimiter('free'), // Will check actual user tier in middleware
  chatController.createChat
);

router.get(
  '/history',
  rateLimiter('free'),
  chatController.getChatHistory
);

router.get(
  '/session/:id',
  rateLimiter('free'),
  chatController.getSession
);

router.delete(
  '/session/:id',
  rateLimiter('free'),
  chatController.deleteSession
);

export default router;
```

#### `routes/index.ts`
Main router that combines all route modules.

```typescript
import { Router } from 'express';
import authRoutes from './auth.routes';
import newsRoutes from './news.routes';
import chatRoutes from './chat.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/news', newsRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
```

---

### 5. Background Jobs (BullMQ)

#### `jobs/news-generation.job.ts`
BullMQ job for automated news generation.

```typescript
import { Job } from 'bullmq';
import { NewsGenerationService } from '../services/news-generation.service';
import { PrismaClient } from '@prisma/client';
import { sendNotification } from '../services/notification.service';

const prisma = new PrismaClient();
const newsService = new NewsGenerationService();

export interface NewsJobData {
  count?: number;
  topics?: string[];
  priority?: 'high' | 'normal' | 'low';
}

export const newsGenerationJob = {
  name: 'generate-news',
  
  // Job configuration
  options: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 1000 }
  },

  // Job handler
  handler: async (job: Job<NewsJobData>) => {
    const { count = 3, topics, priority = 'normal' } = job.data;
    
    console.log(`[Job] Starting news generation job ${job.id}`);
    
    // Create log entry
    const log = await prisma.ai_generation_logs.create({
      data: {
        job_type: 'news',
        status: 'in_progress',
        metadata: {
          jobId: job.id,
          count,
          topics,
          priority
        }
      }
    });

    try {
      // Update job progress
      await job.updateProgress(10);
      
      // Generate articles
      const articles = await newsService.generateNewsStories(count);
      
      await job.updateProgress(90);
      
      // Calculate total cost
      const totalCost = articles.reduce((sum, article) => {
        return sum + (article.metadata?.cost || 0);
      }, 0);

      // Update log
      await prisma.ai_generation_logs.update({
        where: { id: log.id },
        data: {
          status: 'success',
          result_count: articles.length,
          total_cost: totalCost,
          completed_at: new Date()
        }
      });

      await job.updateProgress(100);
      
      // Notify admin
      await sendNotification({
        type: 'news_generated',
        data: {
          jobId: job.id,
          articleCount: articles.length,
          totalCost,
          pendingApproval: true
        }
      });

      console.log(`[Job] Completed news generation job ${job.id}`);
      
      return {
        articleCount: articles.length,
        totalCost,
        articleIds: articles.map(a => a.id)
      };
    } catch (error: any) {
      console.error(`[Job] Failed news generation job ${job.id}:`, error);
      
      // Update log with error
      await prisma.ai_generation_logs.update({
        where: { id: log.id },
        data: {
          status: 'failed',
          error_message: error.message,
          failed_at: new Date()
        }
      });

      throw error; // Let BullMQ handle retry
    }
  },

  // On job completion
  onCompleted: async (job: Job, result: any) => {
    console.log(`[Job] News generation completed: ${result.articleCount} articles`);
  },

  // On job failure
  onFailed: async (job: Job, error: Error) => {
    console.error(`[Job] News generation failed after ${job.attemptsMade} attempts:`, error);
    
    // Send alert if all attempts failed
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      await sendNotification({
        type: 'job_failed',
        data: {
          jobId: job.id,
          jobName: job.name,
          error: error.message,
          attempts: job.attemptsMade
        }
      });
    }
  }
};
```

#### `jobs/research-curation.job.ts`
Daily research paper curation job.

```typescript
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { fetchTrendingPapers } from '../services/research.service';

const prisma = new PrismaClient();

export const researchCurationJob = {
  name: 'curate-research',
  
  options: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  },

  handler: async (job: Job) => {
    console.log(`[Job] Starting research curation job ${job.id}`);
    
    try {
      // Fetch trending papers from Hugging Face
      const papers = await fetchTrendingPapers();
      
      // Save to database
      const saved = await prisma.$transaction(
        papers.map(paper => 
          prisma.content_items.upsert({
            where: { 
              id: paper.id 
            },
            update: {
              title: paper.title,
              excerpt: paper.summary,
              metadata: {
                authors: paper.authors,
                url: paper.url,
                codeRepository: paper.codeRepository
              },
              updated_at: new Date()
            },
            create: {
              id: paper.id,
              type: 'research',
              title: paper.title,
              slug: this.generateSlug(paper.title),
              excerpt: paper.summary,
              content: paper.summary,
              author: paper.authors.join(', '),
              status: 'approved', // Research papers auto-approved
              tags: ['research', 'paper', ...paper.categories],
              metadata: {
                authors: paper.authors,
                url: paper.url,
                codeRepository: paper.codeRepository,
                publishedAt: paper.publishedAt
              },
              published_at: new Date()
            }
          })
        )
      );

      console.log(`[Job] Research curation completed: ${saved.length} papers`);
      
      return {
        paperCount: saved.length,
        paperIds: saved.map(p => p.id)
      };
    } catch (error: any) {
      console.error(`[Job] Research curation failed:`, error);
      throw error;
    }
  },

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};
```

---

### 6. Type Definitions

#### `types/api.ts`
API request and response types.

```typescript
// News API Types
export interface GenerateNewsRequest {
  count?: number;
  topics?: string[];
  model?: string;
}

export interface GenerateNewsResponse {
  success: boolean;
  jobId: string;
  status: string;
  message: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  tags: string[];
  readTime?: string;
}

export interface NewsListResponse {
  articles: NewsArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Chat API Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  mode: 'research' | 'learning';
  context?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  totalTokens?: number;
  totalCost?: number;
}

export interface CreateChatRequest {
  messages: ChatMessage[];
  context?: string;
  mode?: 'research' | 'learning';
}

export interface CreateChatResponse {
  response: string;
  sessionId: string;
  tokensUsed: number;
  cost: number;
}

// User API Types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  tier: 'free' | 'premium' | 'admin';
  createdAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  newsletter?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  defaultChatMode?: 'research' | 'learning';
  emailNotifications?: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

// Admin API Types
export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalArticles: number;
  pendingArticles: number;
  totalCost: number;
  apiCalls: number;
  chatSessions: number;
}

export interface ContentApprovalRequest {
  action: 'approve' | 'reject';
  reason?: string;
}

// Error Response Types
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

export interface RateLimitError extends ErrorResponse {
  error: 'Rate limit exceeded';
  code: 'RATE_LIMIT';
  retryAfter: number;
  limit: number;
  window: string;
}
```

#### `types/database.ts`
Database entity types and enums.

```typescript
import type { 
  users as User,
  content_items as ContentItem,
  chat_sessions as ChatSession,
  chat_messages as ChatMessage,
  user_contributions as UserContribution,
  api_keys as ApiKey,
  ai_generation_logs as AIGenerationLog
} from '@prisma/client';

// Re-export Prisma types
export type { 
  User,
  ContentItem,
  ChatSession,
  ChatMessage,
  UserContribution,
  ApiKey,
  AIGenerationLog
};

// Enums
export const ContentType = {
  NEWS: 'news',
  RESEARCH: 'research',
  PRODUCT: 'product',
  COURSE: 'course'
} as const;

export const ContentStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived'
} as const;

export const UserTier = {
  FREE: 'free',
  PREMIUM: 'premium',
  ADMIN: 'admin'
} as const;

export const ChatMode = {
  RESEARCH: 'research',
  LEARNING: 'learning'
} as const;

// Type guards
export function isContentType(value: string): value is typeof ContentType[keyof typeof ContentType] {
  return Object.values(ContentType).includes(value as any);
}

export function isContentStatus(value: string): value is typeof ContentStatus[keyof typeof ContentStatus] {
  return Object.values(ContentStatus).includes(value as any);
}

export function isUserTier(value: string): value is typeof UserTier[keyof typeof UserTier] {
  return Object.values(UserTier).includes(value as any);
}

// Extended types with relations
export interface ContentItemWithRelations extends ContentItem {
  author?: User;
  contributions?: UserContribution[];
}

export interface ChatSessionWithRelations extends ChatSession {
  user: User;
  messages: ChatMessage[];
}

export interface UserWithRelations extends User {
  chatSessions?: ChatSession[];
  contributions?: UserContribution[];
  apiKeys?: ApiKey[];
}
```

#### `types/ai-models.ts`
AI provider and model configurations.

```typescript
// AI Provider Types
export interface AIProviderConfig {
  name: string;
  baseURL: string;
  apiKey: string;
  defaultHeaders?: Record<string, string>;
  models: AIModelConfig[];
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  cost: {
    input: number; // per 1M tokens
    output: number; // per 1M tokens
  };
  capabilities: string[];
  maxTokens: number;
  tier: 'free' | 'premium';
}

// AI Generation Types
export interface AIGenerationOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
  stream?: boolean;
}

export interface AIGenerationResult {
  text: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  model: string;
  duration: number;
}

// News Generation Types
export interface NewsAngle {
  title: string;
  query: string;
  focus: string;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  slug: string;
}

// Chat Generation Types
export interface ChatContext {
  mode: 'research' | 'learning';
  context?: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  model: string;
}

// Model Registry
export const SUPPORTED_MODELS: AIModelConfig[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3.2',
    provider: 'deepseek',
    cost: { input: 0.14, output: 0.28 },
    capabilities: ['text', 'code', 'reasoning'],
    maxTokens: 4096,
    tier: 'premium'
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash',
    provider: 'openrouter',
    cost: { input: 0, output: 0 },
    capabilities: ['text', 'vision'],
    maxTokens: 8192,
    tier: 'free'
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    cost: { input: 3.00, output: 15.00 },
    capabilities: ['text', 'code', 'analysis'],
    maxTokens: 4096,
    tier: 'premium'
  }
];

// Helper functions
export function getModelConfig(modelId: string): AIModelConfig | undefined {
  return SUPPORTED_MODELS.find(model => model.id === modelId);
}

export function calculateCost(modelId: string, tokens: { prompt: number; completion: number }): number {
  const model = getModelConfig(modelId);
  if (!model) return 0;
  
  const inputCost = (tokens.prompt / 1_000_000) * model.cost.input;
  const outputCost = (tokens.completion / 1_000_000) * model.cost.output;
  
  return inputCost + outputCost;
}

export function getModelsByTier(tier: 'free' | 'premium'): AIModelConfig[] {
  return SUPPORTED_MODELS.filter(model => model.tier === tier || tier === 'premium');
}
```

---

### 7. Utility Functions

#### `utils/token-utils.ts`
JWT token operations.

```typescript
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  tier: 'free' | 'premium' | 'admin';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
}

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate access and refresh tokens
 */
export function generateTokens(user: {
  id: string;
  email: string;
  tier: 'free' | 'premium' | 'admin';
}): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      tier: user.tier
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      tier: user.tier,
      type: 'refresh'
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify access token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = jwt.decode(token) as TokenPayload;
    if (!payload.exp) return true;
    
    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiry(token: string): Date | null {
  try {
    const payload = jwt.decode(token) as TokenPayload;
    if (!payload.exp) return null;
    
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
}
```

#### `utils/validators.ts`
Zod validation schemas.

```typescript
import { z } from 'zod';

// User Validation Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  avatar: z.string().url('Invalid URL').optional(),
  preferences: z.object({
    newsletter: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    defaultChatMode: z.enum(['research', 'learning']).optional(),
    emailNotifications: z.boolean().optional()
  }).optional()
});

// News Validation Schemas
export const generateNewsSchema = z.object({
  count: z.number()
    .min(1, 'Must generate at least 1 article')
    .max(10, 'Cannot generate more than 10 articles at once')
    .optional()
    .default(3),
  topics: z.array(z.string())
    .max(5, 'Cannot specify more than 5 topics')
    .optional(),
  model: z.string().optional()
});

export const approveNewsSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional()
});

// Chat Validation Schemas
export const createChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1, 'Message content is required')
  })).min(1, 'At least one message is required'),
  context: z.string().optional(),
  mode: z.enum(['research', 'learning']).optional().default('research')
});

export const chatMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(10000, 'Message too long'),
  sessionId: z.string().uuid('Invalid session ID').optional()
});

// Content Contribution Schemas
export const userContributionSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(500, 'Title must be less than 500 characters'),
  content: z.string()
    .min(100, 'Content must be at least 100 characters')
    .max(50000, 'Content must be less than 50000 characters'),
  type: z.enum(['news', 'product', 'research']),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Cannot have more than 10 tags'),
  sourceUrl: z.string().url('Invalid source URL').optional()
});

// API Key Schemas
export const createApiKeySchema = z.object({
  name: z.string()
    .min(1, 'Key name is required')
    .max(50, 'Key name must be less than 50 characters'),
  permissions: z.array(z.enum(['read', 'write', 'admin'])),
  expiresIn: z.number()
    .min(86400, 'Must be at least 1 day') // 1 day in seconds
    .max(31536000, 'Cannot exceed 1 year') // 1 year in seconds
    .optional()
});

// Query Parameter Schemas
export const paginationSchema = z.object({
  page: z.string()
    .transform(val => parseInt(val))
    .pipe(z.number().min(1).default(1)),
  limit: z.string()
    .transform(val => parseInt(val))
    .pipe(z.number().min(1).max(100).default(20))
});

export const filterSchema = z.object({
  tag: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

// Type inference helpers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GenerateNewsInput = z.infer<typeof generateNewsSchema>;
export type CreateChatInput = z.infer<typeof createChatSchema>;
export type UserContributionInput = z.infer<typeof userContributionSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
```

#### `utils/password-utils.ts`
Password hashing and verification utilities.

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Failed to verify password');
  }
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Check if password meets security requirements
 */
export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): number {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  return Math.min(score, 4);
}

/**
 * Mask password for logging (show only first and last char)
 */
export function maskPassword(password: string): string {
  if (password.length <= 2) return '*'.repeat(password.length);
  return password[0] + '*'.repeat(password.length - 2) + password[password.length - 1];
}
```

---

## Key Features

### 1. **Separation of Concerns**
- **Middleware**: Handles cross-cutting concerns (auth, rate limiting, logging)
- **Services**: Contains business logic and external integrations
- **Controllers**: Handle HTTP requests/responses
- **Routes**: Define API endpoints and apply middleware
- **Jobs**: Background processing with BullMQ
- **Types**: TypeScript definitions for type safety
- **Utils**: Reusable helper functions

### 2. **Type Safety**
- Full TypeScript coverage with strict mode
- Zod validation for all API inputs
- Prisma-generated database types
- Custom type definitions for business logic

### 3. **Scalability**
- Stateless design for horizontal scaling
- Redis for distributed rate limiting and caching
- BullMQ for background job processing
- Connection pooling with Prisma
- Async/await throughout for non-blocking I/O

### 4. **Security**
- JWT authentication with refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Rate limiting by user tier
- Admin role-based access control
- Input validation with Zod
- SQL injection prevention via Prisma

### 5. **Observability**
- Structured logging with Winston
- Error tracking and alerting
- Performance monitoring
- Usage analytics and cost tracking
- Admin dashboard for monitoring

### 6. **Cost Optimization**
- Multi-provider AI orchestration (DeepSeek + OpenRouter)
- Smart model selection based on tier and use case
- Token usage tracking per user
- Rate limiting to prevent abuse
- Caching with Redis

### 7. **Developer Experience**
- Clear folder structure
- Consistent naming conventions
- Comprehensive error handling
- Detailed JSDoc comments
- Example code for all components
- Type inference helpers

---

## Implementation Notes

### Database Schema (Prisma)
The architecture assumes the following Prisma schema:

```prisma
// See BACKEND-IMPLEMENTATION.md for full schema
// Key tables: users, content_items, chat_sessions, chat_messages,
// user_contributions, api_keys, ai_generation_logs, analytics_events
```

### Environment Variables
Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# AI Providers
DEEPSEEK_API_KEY="sk-..."
OPENROUTER_API_KEY="sk-..."

# App
PORT=3000
NODE_ENV="development"
SITE_URL="https://genai4code.com"
```

### Testing Strategy
- Unit tests for services and utils
- Integration tests for API endpoints
- Mock external services (AI providers, Redis)
- Test database with Prisma

### Deployment
- Backend: Render.com or Railway
- Database: Supabase PostgreSQL
- Redis: Upstash
- Monitoring: Logflare, Uptime Robot
- CI/CD: GitHub Actions

---

## Next Steps

1. **Setup**: Initialize Node.js project with TypeScript
2. **Database**: Create Prisma schema and run migrations
3. **Core**: Implement authentication and user management
4. **Services**: Build AI orchestration and news generation
5. **API**: Create routes and controllers
6. **Jobs**: Setup BullMQ and background processing
7. **Admin**: Build admin dashboard
8. **Integration**: Connect frontend to new backend
9. **Testing**: Write comprehensive tests
10. **Deployment**: Deploy to production

This architecture provides a solid foundation for a production-ready backend that can handle authentication, AI-generated content, user management, and admin operations at scale.