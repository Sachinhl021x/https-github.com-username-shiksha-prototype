# Frontend Architecture & Implementation Guide

## Overview
Complete frontend architecture for GenAI4Code Next.js application with authentication, chat interfaces, content management, and admin dashboard.

---

## 1. Project Structure

```
website/
├── src/
│   ├── app/
│   │   ├── (public)/           # Public routes (no auth required)
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── news/
│   │   │   ├── engineering/
│   │   │   ├── research/
│   │   │   └── products/
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/        # Protected user routes
│   │   │   ├── profile/
│   │   │   ├── chat/
│   │   │   └── contributions/
│   │   └── (admin)/            # Admin routes (role-based)
│   │       ├── admin/
│   │       └── api-keys/
│   ├── components/
│   │   ├── layout/             # Layout components
│   │   ├── auth/               # Auth UI components
│   │   ├── chat/               # Chat interfaces
│   │   ├── content/            # Content display components
│   │   ├── admin/              # Admin dashboard components
│   │   └── shared/             # Reusable UI components
│   ├── lib/
│   │   ├── api-client.ts       # Backend API client
│   │   ├── auth.ts             # Authentication utilities
│   │   └── analytics.ts        # Analytics tracking
│   ├── hooks/
│   │   ├── useAuth.ts          # Auth state management
│   │   ├── useContent.ts       # Content data fetching
│   │   ├── useChat.ts          # Chat state management
│   │   └── useUser.ts          # User data management
│   ├── contexts/
│   │   └── AuthContext.tsx     # Global auth state
│   └── types/
│       └── index.ts            # TypeScript types
├── public/
└── package.json
```

---

## 2. Authentication Implementation

### 2.1 Authentication Flow
```typescript
// lib/auth.ts
import { jwtDecode } from 'jwt-decode';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  tier: 'free' | 'premium';
  interests?: string[];
}

class AuthManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static USER_KEY = 'user';

  // Login with Google
  async loginWithGoogle(redirectUri: string): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: redirectUri }),
    });

    if (!response.ok) throw new Error('Login failed');
    
    const { accessToken, refreshToken, user } = await response.json();
    this.setTokens({ accessToken, refreshToken });
    this.setUser(user);
  }

  // Refresh token
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      return null;
    }

    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    this.setTokens({ accessToken, refreshToken: newRefreshToken });
    return accessToken;
  }

  // Get access token (with auto-refresh)
  async getAccessToken(): Promise<string | null> {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (!token) return null;

    const decoded = jwtDecode(token);
    const isExpired = decoded.exp ? Date.now() >= decoded.exp * 1000 : false;

    if (isExpired) {
      return await this.refreshToken();
    }

    return token;
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/login';
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getUser() && !!this.getAccessToken();
  }
}

export const authManager = new AuthManager();
```

### 2.2 Auth Context Provider
```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth';
import type { User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check auth on mount
    const initAuth = async () => {
      const token = await authManager.getAccessToken();
      const userData = authManager.getUser();
      
      if (token && userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { accessToken, refreshToken, user } = await response.json();
      authManager.setTokens({ accessToken, refreshToken });
      authManager.setUser(user);
      setUser(user);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (code: string) => {
    setLoading(true);
    try {
      await authManager.loginWithGoogle(code);
      const userData = authManager.getUser();
      setUser(userData);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authManager.logout();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    const token = await authManager.getAccessToken();
    if (!token) return;

    const response = await fetch(`${API_BASE}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.ok) {
      const userData = await response.json();
      authManager.setUser(userData);
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## 3. API Client Implementation

### 3.1 API Client Class
```typescript
// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

class APIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await authManager.getAccessToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        authManager.logout();
        throw new Error('Unauthorized');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async googleLogin(code: string) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Content
  async getContent(filters: {
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined)
    );
    return this.request(`/content?${params}`);
  }

  async getContentDetail(id: string) {
    return this.request(`/content/${id}`);
  }

  async submitContribution(data: {
    type: 'product' | 'tool' | 'feedback';
    content: Record<string, any>;
  }) {
    return this.request('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Chat
  async getChatSessions() {
    return this.request('/chat/sessions');
  }

  async createChatSession(mode: 'research' | 'learning') {
    return this.request('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  }

  async getChatSession(id: string) {
    return this.request(`/chat/sessions/${id}`);
  }

  async sendMessage(sessionId: string, content: string) {
    return this.request(`/chat/sessions/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // User
  async getProfile() {
    return this.request('/user/profile');
  }

  async updatePreferences(preferences: {
    interests?: string[];
    notifications?: boolean;
  }) {
    return this.request('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getUserContributions() {
    return this.request('/user/contributions');
  }

  // API Keys (Premium only)
  async getApiKeys() {
    return this.request('/api-keys');
  }

  async createApiKey(name: string) {
    return this.request('/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }
}

export const apiClient = new APIClient();
```

---

## 4. Chat Interface Implementation

### 4.1 Chat Hook
```typescript
// hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  mode: 'research' | 'learning';
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export function useChat(sessionId?: string) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  const loadSession = async (id: string) => {
    try {
      setIsLoading(true);
      const sessionData = await apiClient.getChatSession(id);
      setSession(sessionData);
      setMessages(sessionData.messages || []);
    } catch (err) {
      setError('Failed to load chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId) throw new Error('No session ID');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.sendMessage(sessionId, content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to send message');
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const createSession = async (mode: 'research' | 'learning') => {
    try {
      setIsLoading(true);
      const newSession = await apiClient.createChatSession(mode);
      setSession(newSession);
      setMessages([]);
      return newSession;
    } catch (err) {
      setError('Failed to create session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    messages,
    isLoading,
    error,
    sendMessage,
    createSession,
    loadSession,
  };
};
```

### 4.2 Chat UI Component
```typescript
// components/chat/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';

interface ChatInterfaceProps {
  mode: 'research' | 'learning';
  contentId?: string;
  initialContext?: string;
}

export default function ChatInterface({ mode, contentId, initialContext }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { session, messages, isLoading, error, sendMessage, createSession } = useChat(sessionId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create or load session
  useEffect(() => {
    if (!user) return;

    const initSession = async () => {
      // Check if session exists for this content
      if (contentId) {
        // Load existing session or create new one
        const sessions = await apiClient.getChatSessions();
        const existingSession = sessions.find(
          s => s.mode === mode && s.contentId === contentId
        );
        
        if (existingSession) {
          setSessionId(existingSession.id);
        } else {
          const newSession = await createSession(mode);
          setSessionId(newSession.id);
        }
      } else {
        const newSession = await createSession(mode);
        setSessionId(newSession.id);
      }
    };

    initSession();
  }, [user, mode, contentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !sessionId) return;

    await sendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please sign in to use chat</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="font-semibold text-gray-900">
            {mode === 'research' ? 'Research Assistant' : 'Learning Assistant'}
          </h3>
          <p className="text-sm text-gray-500">
            {user.tier === 'free' ? '50 messages/day' : 'Unlimited messages'}
          </p>
        </div>
        <button
          onClick={() => setSessionId(null)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">
              {mode === 'research'
                ? 'Ask questions about this research paper'
                : 'Ask questions about this guide'}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <ReactMarkdown className="prose prose-sm max-w-none">
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 5. Content Contribution System

### 5.1 Contribution Form Component
```typescript
// components/content/ContributionForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface ContributionFormProps {
  type: 'product' | 'tool' | 'feedback';
  contentId?: string;
  onSuccess?: () => void;
}

export default function ContributionForm({ type, contentId, onSuccess }: ContributionFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    category: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to contribute');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.submitContribution({
        type,
        content: {
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()),
          contentId,
        },
      });

      setSuccess(true);
      onSuccess?.();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        url: '',
        category: '',
        tags: '',
      });
    } catch (err) {
      setError('Failed to submit contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please sign in to contribute</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">
        {type === 'product' ? 'Submit AI Product' :
         type === 'tool' ? 'Submit Tool' : 'Submit Feedback'}
      </h2>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">Thank you! Your contribution has been submitted for review.</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Product or tool name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what it does and why it's useful"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL *
          </label>
          <input
            type="url"
            required
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Code Generation, Design, Productivity"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="AI, Machine Learning, Open Source"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Your contribution will be reviewed by our team before being published.
      </p>
    </div>
  );
}
```

---

## 6. Admin Dashboard Architecture

### 6.1 Admin Layout
```typescript
// app/(admin)/layout.tsx
import { redirect } from 'next/navigation';
import { authManager } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = authManager.getUser();
  
  // Check if user is admin
  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <nav className="px-4">
          <AdminNavLink href="/admin">Dashboard</AdminNavLink>
          <AdminNavLink href="/admin/content">Content</AdminNavLink>
          <AdminNavLink href="/admin/users">Users</AdminNavLink>
          <AdminNavLink href="/admin/ai">AI Config</AdminNavLink>
          <AdminNavLink href="/admin/analytics">Analytics</AdminNavLink>
          <AdminNavLink href="/admin/automation">Automation</AdminNavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 mb-1"
    >
      {children}
    </a>
  );
}
```

### 6.2 Content Approval Queue
```typescript
// app/(admin)/admin/content/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface PendingContent {
  id: string;
  type: string;
  title: string;
  contributor: {
    name: string;
    email: string;
  };
  submittedAt: string;
  content: any;
}

export default function ContentApprovalPage() {
  const [pending, setPending] = useState<PendingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPendingContent();
  }, []);

  const loadPendingContent = async () => {
    try {
      const response = await apiClient.request('/admin/content/pending');
      setPending(response);
    } catch (err) {
      console.error('Failed to load pending content');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await apiClient.request(`/admin/content/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' }),
      });
      setPending(pending.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to approve content');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await apiClient.request(`/admin/content/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' }),
      });
      setPending(pending.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to reject content');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Content Approval Queue</h1>

      {pending.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No pending content to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted by {item.contributor.name} ({item.contributor.email})
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Pending
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Content Preview:</h4>
                <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
                  {JSON.stringify(item.content, null, 2)}
                </pre>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(item.id)}
                  disabled={processing === item.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processing === item.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  disabled={processing === item.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 7. Frontend Migration Plan

### 7.1 Current API Routes to Migrate
```typescript
// These Next.js API routes should be REMOVED and moved to backend
website/src/app/api/
├── chat/route.ts              → Move to backend: POST /api/chat/sessions/:id/messages
├── course-chat/route.ts       → Move to backend: POST /api/chat/sessions/:id/messages
├── content/route.ts           → Move to backend: GET /api/content
├── featured/route.ts          → Move to backend: GET /api/content?featured=true
├── news/                      → Move to backend: GET /api/content?type=news
├── research/                  → Move to backend: GET /api/content?type=research
└── [other routes]             → All move to backend
```

### 7.2 Frontend Components to Update
```typescript
// Components that need API client updates
website/src/components/
├── research/ChatInterface.tsx    → Update to use apiClient
├── engineering/CourseChatbot.tsx → Update to use apiClient
├── engineering/FloatingChatbot.tsx → Update to use apiClient
└── home/Leaderboard.tsx          → Update to use apiClient

// Hooks that need updating
website/src/hooks/
├── useContent.ts                 → Update to use apiClient
└── [new hooks needed]            → useAuth, useChat, useUser
```

### 7.3 Migration Steps
1. **Phase 1**: Create backend API endpoints
2. **Phase 2**: Update API client in frontend
3. **Phase 3**: Replace direct API calls with apiClient
4. **Phase 4**: Remove old API routes
5. **Phase 5**: Test all functionality

---

## 8. Environment Configuration

### 8.1 Frontend Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001  # Development
NEXT_PUBLIC_API_URL=https://api.genai4code.com  # Production
NEXT_PUBLIC_SITE_URL=https://genai4code.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics
```

### 8.2 Development Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 9. Key Implementation Notes

### 9.1 Authentication State
- Use `AuthContext` for global auth state
- Wrap root layout with `AuthProvider`
- Check auth on protected routes
- Auto-refresh tokens before expiry

### 9.2 API Error Handling
- 401 errors trigger logout
- 429 errors show rate limit message
- Network errors show retry option
- Server errors show user-friendly message

### 9.3 Performance Optimizations
- Use React Query for data caching
- Implement pagination for content lists
- Lazy load chat components
- Debounce search inputs
- Use Next.js Image component

### 9.4 Security Considerations
- Never expose API keys in frontend
- Validate all user inputs
- Sanitize markdown content
- Implement CSP headers
- Use HTTPS only

---

## 10. Testing Strategy

### 10.1 Unit Tests
```bash
# Test components
npm test -- --testPathPattern=components

# Test hooks
npm test -- --testPathPattern=hooks

# Test utilities
npm test -- --testPathPattern=lib
```

### 10.2 Integration Tests
```bash
# Test API client
npm test -- --testPathPattern=api-client

# Test auth flow
npm test -- --testPathPattern=auth
```

### 10.3 E2E Tests
```bash
# Test user journey
npx playwright test user-journey.spec.ts

# Test chat functionality
npx playwright test chat.spec.ts

# Test admin workflow
npx playwright test admin.spec.ts
```

---

## 11. Deployment Checklist

- [ ] Update API URL environment variables
- [ ] Configure Google OAuth credentials
- [ ] Set up Vercel deployment
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Test all user flows
- [ ] Test admin functionality
- [ ] Performance audit
- [ ] Security audit
- [ ] Backup strategy

---

## 12. Next Steps

1. **Set up backend API** (see backend architecture doc)
2. **Implement authentication** using AuthContext
3. **Create API client** and replace direct fetch calls
4. **Build chat interfaces** with useChat hook
5. **Create admin dashboard** pages
6. **Test end-to-end** user flows
7. **Deploy to production**

**Ready to start implementation? Switch to Code Mode and begin with the backend setup.**