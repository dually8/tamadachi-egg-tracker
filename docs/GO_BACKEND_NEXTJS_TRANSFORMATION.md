# Transforming Tamadachi Egg Tracker: Go Backend + Next.js SSG/SPA

## Table of Contents
1. [Current Architecture](#current-architecture)
2. [Proposed Architecture](#proposed-architecture)
3. [Next.js Static Site Generation (SSG) Approach](#nextjs-static-site-generation-ssg-approach)
4. [Next.js Single Page Application (SPA) Approach](#nextjs-single-page-application-spa-approach)
5. [Dependency Reduction Strategy](#dependency-reduction-strategy)
6. [Best Practices for Fetch Requests](#best-practices-for-fetch-requests)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Current Architecture

### Technology Stack
- **Frontend Framework**: Next.js 15 with App Router
- **Rendering Strategy**: Server-Side Rendering (SSR) with `force-dynamic`
- **Database**: SQLite with better-sqlite3 driver
- **ORM**: Drizzle ORM
- **UI Components**: 
  - ag-grid-react (data tables)
  - ag-charts-react (data visualization)
  - shadcn/ui components
  - Tailwind CSS
- **Runtime**: Node.js 22

### Current Data Flow
```
Browser Request → Next.js Server → Database Query (SQLite) → Server Component Render → HTML Response
```

The application currently:
1. Runs database queries directly in server components (`src/app/page.tsx`)
2. Fetches all price data from SQLite on each page load
3. Passes data as props to client components for rendering
4. Uses client-side interactivity for tables, charts, and theme toggling

### Current Dependencies Count
**Production**: 18 dependencies
**Development**: 10 dependencies
**Total**: 28 dependencies

---

## Proposed Architecture

### Technology Stack
- **Backend**: Go with standard library + minimal dependencies
- **Frontend**: Next.js (Static or SPA mode)
- **Database**: SQLite with Go's database/sql
- **Communication**: REST API (JSON over HTTP)

### Proposed Data Flow

**SSG Mode:**
```
Build Time: Go API → SQLite → Next.js Build → Static HTML/JSON
Runtime: Browser → Static Files (CDN/Server) → Client-side JS hydration
```

**SPA Mode:**
```
Browser Request → Static HTML/JS → Client-side API calls → Go Backend → SQLite
```

### Go Backend Components

#### 1. Database Layer
```go
// Use database/sql with mattn/go-sqlite3 or modernc.org/sqlite
type Price struct {
    ID            int       `json:"id"`
    Date          time.Time `json:"date"`
    Price         float64   `json:"price"`
    StoreLocation string    `json:"storeLocation"`
    StoreName     string    `json:"storeName"`
}
```

#### 2. API Endpoints
```
GET  /api/prices           - List all prices (with optional filters)
GET  /api/prices/:id       - Get single price
POST /api/prices           - Create new price
GET  /api/stores           - List unique store names
GET  /api/health           - Health check endpoint
```

#### 3. Minimal Go Dependencies
- **modernc.org/sqlite** - Pure Go SQLite driver (no CGo required)
- OR **github.com/mattn/go-sqlite3** - CGo-based SQLite driver (more mature)

### Frontend Changes
- Remove Drizzle ORM and better-sqlite3 dependencies
- Convert server components to client components or static generation
- Add fetch/SWR for API calls in SPA mode
- Keep existing UI component libraries (ag-grid, ag-charts, shadcn)

---

## Next.js Static Site Generation (SSG) Approach

### Feasibility Analysis

**✅ SSG IS POSSIBLE** for this application with the following caveats:

### Why SSG Works for This Use Case

1. **Read-Heavy Application**: The app displays price data but doesn't have user-specific content
2. **Periodic Updates**: Price data is updated via Playwright tests, not user interactions
3. **Pre-renderable Content**: All pages can be built at build time with known data

### SSG Implementation Strategy

#### Configuration Changes

**next.config.ts:**
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Changed from 'standalone' to 'export'
  // Remove basePath and assetPrefix if not needed for GitHub Pages
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
```

#### Data Fetching at Build Time

**src/app/page.tsx (SSG version):**
```typescript
// Remove 'use client' and force-dynamic
export default async function Home() {
  // Fetch from Go API during build time
  const res = await fetch('http://localhost:8080/api/prices', {
    cache: 'no-store', // Or set appropriate caching strategy
  });
  const prices = await res.json();
  
  // Process data
  const storeNames = Array.from(new Set(prices.map(p => p.storeName))).sort();
  
  return (
    <main>
      <PriceTableAgGrid prices={prices} />
      {storeNames.map(storeName => (
        <PriceHistoryChart
          key={storeName}
          title={storeName}
          data={prices.filter(p => p.storeName === storeName)}
        />
      ))}
    </main>
  );
}
```

#### Build Process

```bash
# 1. Start Go backend
go run main.go &

# 2. Build Next.js static site
npm run build  # or pnpm build

# 3. Output directory: out/
# Contains: HTML, CSS, JS, and JSON files
```

#### Deployment Options

1. **Static Hosting**: 
   - Netlify, Vercel (static), GitHub Pages, AWS S3 + CloudFront
   - No server required for frontend
   - Go backend runs separately

2. **Hybrid Deployment**:
   - Nginx serves static files from `out/`
   - Go backend handles `/api/*` routes
   - Single server, clean separation

### Limitations of SSG for This Application

#### ❌ Dynamic Data Updates
**Problem**: Static sites are built once and don't reflect database changes until rebuilt.

**Solutions**:
1. **Scheduled Rebuilds**: 
   - Trigger rebuilds after Playwright tests update the database
   - Use CI/CD webhooks (GitHub Actions, etc.)
   
2. **Incremental Static Regeneration (ISR)**:
   - **NOT AVAILABLE** in `output: 'export'` mode
   - Would require switching back to `output: 'standalone'` and deploying to Vercel/Node server
   
3. **Client-Side Data Fetching** (Hybrid approach):
   - Static shell with JavaScript that fetches fresh data
   - This becomes more like an SPA (see next section)

#### ❌ No Server-Side API Routes
**Problem**: Next.js API routes in `src/app/api/` don't work with `output: 'export'`

**Solution**: All APIs must be served by the Go backend

#### ❌ Build-Time Requirements
**Problem**: Go backend must be running during `next build`

**Solution**: 
- Start Go server before building
- Or use static JSON files as build-time data source
- Or query SQLite directly during build (requires Node SQLite driver)

### Recommended Approach for SSG

**Use SSG with Client-Side Refresh:**
1. Build static site with initial data
2. Deploy static files to CDN
3. Client-side JavaScript fetches latest data from Go API on page load
4. Provides instant initial render + fresh data

This is effectively a **hybrid SSG/SPA** approach and offers the best of both worlds.

---

## Next.js Single Page Application (SPA) Approach

### Why SPA is Better for This Application

Given the dynamic nature of the data (prices updated by Playwright tests), an SPA provides:

1. **Always Fresh Data**: Fetches from API on every page load
2. **No Build Dependencies**: Frontend and backend are completely decoupled
3. **Simpler Deployment**: Just deploy static files once; updates happen via backend
4. **Better Developer Experience**: No need to rebuild frontend when data changes

### SPA Implementation Strategy

#### Configuration Changes

**next.config.ts (same as SSG):**
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

#### Convert to Client-Side Data Fetching

**src/app/page.tsx (SPA version):**
```typescript
'use client';

import { useEffect, useState } from 'react';
import PriceHistoryChart from '@/components/price-history-chart';
import PriceTableAgGrid from '@/components/price-table-ag-grid';
import { Price } from '@/types';

export default function Home() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prices`);
        if (!res.ok) throw new Error('Failed to fetch prices');
        const data = await res.json();
        setPrices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrices();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const storeNames = Array.from(new Set(prices.map(p => p.storeName))).sort();

  return (
    <main>
      <PriceTableAgGrid prices={prices} />
      {storeNames.map(storeName => (
        <PriceHistoryChart
          key={storeName}
          title={storeName}
          data={prices.filter(p => p.storeName === storeName)}
        />
      ))}
    </main>
  );
}
```

#### Environment Configuration

**.env.local (development):**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**.env.production:**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### Build and Deployment

```bash
# Build the SPA
pnpm build

# Output: out/ directory with static files
# Deploy to any static host (Netlify, Vercel, S3, etc.)
```

### Advantages of SPA Over SSG

1. **No Build-Time Backend Dependency**: Frontend builds independently
2. **Real-Time Data**: Always shows latest database state
3. **Simpler CI/CD**: No need to trigger frontend rebuilds when data changes
4. **Better Separation of Concerns**: Frontend and backend are truly independent

### Disadvantages of SPA

1. **Initial Load Time**: Blank page until JavaScript loads and fetches data
2. **SEO**: Limited SEO without server-side rendering (not critical for this app)
3. **Loading States**: Need to handle loading/error states in UI

### Performance Optimization for SPA

1. **Loading Skeleton**: Show placeholder UI while fetching
2. **Error Boundaries**: Graceful error handling
3. **Data Caching**: Use SWR or React Query for client-side caching
4. **Code Splitting**: Lazy load chart components

---

## Dependency Reduction Strategy

### Current Dependencies to Remove

#### Backend/Database (moved to Go)
- ❌ `@libsql/client` - No longer needed
- ❌ `better-sqlite3` - Moved to Go
- ❌ `drizzle-orm` - Go will handle queries
- ❌ `drizzle-kit` - No longer needed
- ❌ `dotenv` - Use Next.js env variables

**Savings: 5 dependencies**

#### Consider Removing (if willing to customize)
- ⚠️ `ag-grid-react` + `ag-grid-community` - Heavy dependency
  - Alternative: Build custom table with @tanstack/react-table (already installed)
  - Savings: ~500KB bundle size
  
- ⚠️ `ag-charts-react` + `ag-charts-community` - Heavy dependency
  - Alternative: recharts (already installed and lighter)
  - Savings: ~400KB bundle size

**Potential additional savings: 4 dependencies**

### Dependencies to Keep

#### Essential UI
- ✅ `next` - Core framework
- ✅ `react` + `react-dom` - Core UI library
- ✅ `next-themes` - Theme toggling (lightweight)
- ✅ `lucide-react` - Icons (lightweight)

#### Already Minimal
- ✅ `@tanstack/react-table` - Already the best minimal table solution
- ✅ `recharts` - Lighter than ag-charts
- ✅ `dayjs` - Lightweight date library

#### Styling
- ✅ `tailwindcss` - Utility-first CSS
- ✅ `tailwind-merge` + `tailwindcss-animate` - Tailwind utilities
- ✅ `class-variance-authority` + `clsx` - CSS utility helpers

#### shadcn/ui Components
- ✅ Radix UI primitives (minimal, tree-shakeable)

### Recommended Dependency Changes

**Remove immediately (backend moved to Go):**
```json
{
  "dependencies": {
    // REMOVE:
    // "@libsql/client": "^0.15.0",
    // "better-sqlite3": "^12.2.0",
    // "drizzle-orm": "^0.40.1",
    // "dotenv": "^16.4.7"
  },
  "devDependencies": {
    // REMOVE:
    // "drizzle-kit": "^0.30.5"
  }
}
```

**Consider replacing ag-grid/ag-charts:**
```json
{
  "dependencies": {
    // REMOVE (if desired):
    // "ag-grid-community": "^33.1.1",
    // "ag-grid-react": "^33.1.1",
    // "ag-charts-community": "^11.1.1",
    // "ag-charts-react": "^11.1.1",
    
    // KEEP (already have these):
    "@tanstack/react-table": "^8.21.2",
    "recharts": "^2.15.1"
  }
}
```

**Final count after removals:**
- Remove 5 backend dependencies immediately
- Optionally remove 4 more (ag-grid/ag-charts)
- **New total: 18-14 = 4-8 fewer dependencies (22-28% reduction)**

---

## Best Practices for Fetch Requests

### Next.js SSG Fetch Best Practices

#### 1. Build-Time Data Fetching

```typescript
// src/app/page.tsx (SSG)
export default async function Home() {
  // This runs ONLY at build time
  const res = await fetch('http://localhost:8080/api/prices', {
    cache: 'force-cache', // Cache the response
  });
  const prices = await res.json();
  
  return <div>{/* render with prices */}</div>;
}
```

**Key Points:**
- ✅ Use `fetch` in async Server Components (default in Next.js 15)
- ✅ Data is embedded in HTML at build time
- ✅ No runtime API calls
- ❌ Data becomes stale until next build

#### 2. Hybrid SSG with Client-Side Refresh

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function Home({ initialPrices }: { initialPrices: Price[] }) {
  const [prices, setPrices] = useState(initialPrices);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prices`);
      const data = await res.json();
      setPrices(data);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      <button onClick={refreshData} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
      </button>
      {/* render prices */}
    </div>
  );
}
```

**Key Points:**
- ✅ Fast initial load from static HTML
- ✅ Fresh data on demand
- ✅ Best user experience

#### 3. Error Handling in SSG

```typescript
export default async function Home() {
  try {
    const res = await fetch('http://localhost:8080/api/prices');
    if (!res.ok) throw new Error('Failed to fetch');
    const prices = await res.json();
    return <PriceList prices={prices} />;
  } catch (error) {
    // Build will fail if this throws
    console.error('Build-time fetch error:', error);
    return <div>Failed to load prices</div>;
  }
}
```

**Key Points:**
- ⚠️ Fetch errors during build cause build failures
- ✅ Must handle errors gracefully
- ✅ Consider providing fallback data

### Next.js SPA Fetch Best Practices

#### 1. Basic Client-Side Fetching

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prices`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setPrices)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <PriceList prices={prices} />;
}
```

**Key Points:**
- ✅ Handle loading, error, and success states
- ✅ Use environment variables for API URLs
- ✅ Validate response status

#### 2. Using SWR (Recommended for SPAs)

```bash
pnpm add swr
```

```typescript
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  const { data: prices, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/prices`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: true, // Refresh when window gains focus
    }
  );

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <PriceList prices={prices} />;
}
```

**Benefits:**
- ✅ Automatic caching
- ✅ Automatic revalidation
- ✅ Focus revalidation
- ✅ Polling support
- ✅ Optimistic UI updates

#### 3. React Query (Alternative to SWR)

```bash
pnpm add @tanstack/react-query
```

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const { data: prices, isLoading, error } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prices`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 60000, // Consider data fresh for 60 seconds
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error.message} />;
  
  return <PriceList prices={prices} />;
}
```

**Setup Required:**
```typescript
// src/app/layout.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### 4. Error Handling Best Practices

```typescript
'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchPrices() {
      try {
        const res = await fetch(`${API_URL}/api/prices`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        setPrices(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore abort errors
        }
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrices();
    
    return () => controller.abort(); // Cleanup on unmount
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={() => window.location.reload()}
      />
    );
  }
  
  return <PriceList prices={prices} />;
}
```

**Key Points:**
- ✅ Use AbortController for cleanup
- ✅ Specific error messages
- ✅ Retry mechanism
- ✅ Proper TypeScript types

#### 5. CORS Handling

**Go Backend CORS Configuration:**
```go
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        origin := r.Header.Get("Origin")
        
        // Allow specific origins in production
        allowedOrigins := []string{
            "http://localhost:3000",
            "https://yourdomain.com",
        }
        
        for _, allowed := range allowedOrigins {
            if origin == allowed {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                break
            }
        }
        
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        w.Header().Set("Access-Control-Max-Age", "86400")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}
```

**Frontend Fetch Configuration:**
```typescript
fetch(`${API_URL}/api/prices`, {
  credentials: 'include', // Include cookies if needed
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
  },
})
```

#### 6. Request Deduplication

**Problem:** Multiple components fetching the same data

**Solution with SWR:**
```typescript
// Automatic deduplication
const { data } = useSWR('/api/prices', fetcher);
// Multiple components using the same key will share the same request
```

**Manual Deduplication:**
```typescript
const requestCache = new Map<string, Promise<any>>();

async function fetchWithCache(url: string) {
  if (requestCache.has(url)) {
    return requestCache.get(url);
  }
  
  const promise = fetch(url).then(r => r.json());
  requestCache.set(url, promise);
  
  promise.finally(() => {
    setTimeout(() => requestCache.delete(url), 5000);
  });
  
  return promise;
}
```

#### 7. Optimistic Updates (for mutations)

```typescript
'use client';

import useSWR, { mutate } from 'swr';

export function useAddPrice() {
  const addPrice = async (newPrice: NewPrice) => {
    // Optimistically update UI
    mutate(
      '/api/prices',
      async (currentPrices: Price[]) => {
        // Update local cache immediately
        const optimisticPrice = { ...newPrice, id: Date.now() };
        return [...currentPrices, optimisticPrice];
      },
      false // Don't revalidate immediately
    );
    
    try {
      // Send request to server
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrice),
      });
      
      if (!res.ok) throw new Error('Failed to add price');
      
      // Revalidate to get real data from server
      mutate('/api/prices');
    } catch (error) {
      // Revert on error
      mutate('/api/prices');
      throw error;
    }
  };
  
  return { addPrice };
}
```

### General Fetch Best Practices

#### 1. Type Safety

```typescript
// src/types/price.ts
export interface Price {
  id: number;
  date: string; // ISO 8601 string
  price: number;
  storeLocation: string;
  storeName: string;
}

// Type-safe fetcher
async function fetchPrices(): Promise<Price[]> {
  const res = await fetch(`${API_URL}/api/prices`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // TypeScript knows this is Price[]
}
```

#### 2. Loading States

```typescript
// Create reusable loading skeleton
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
```

#### 3. Error Boundaries

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Implementation Roadmap

### Phase 1: Go Backend Development (1-2 days)

#### 1.1 Setup Go Project
```bash
mkdir backend
cd backend
go mod init github.com/dually8/tamadachi-egg-tracker-go
```

#### 1.2 Implement Database Layer
```go
// internal/db/db.go
package db

import (
    "database/sql"
    _ "modernc.org/sqlite" // Pure Go SQLite
)

func NewDB(dbPath string) (*sql.DB, error) {
    return sql.Open("sqlite", dbPath)
}
```

#### 1.3 Implement Models and Queries
```go
// internal/models/price.go
package models

import "time"

type Price struct {
    ID            int       `json:"id"`
    Date          time.Time `json:"date"`
    Price         float64   `json:"price"`
    StoreLocation string    `json:"storeLocation"`
    StoreName     string    `json:"storeName"`
}
```

```go
// internal/repository/price.go
package repository

func (r *PriceRepository) GetAll() ([]models.Price, error) {
    rows, err := r.db.Query(`
        SELECT id, date, price, storeLocation, storeName 
        FROM EggPrice 
        ORDER BY date DESC
    `)
    // ... handle rows
}
```

#### 1.4 Implement HTTP Handlers
```go
// internal/handlers/prices.go
package handlers

func (h *PriceHandler) GetPrices(w http.ResponseWriter, r *http.Request) {
    prices, err := h.repo.GetAll()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(prices)
}
```

#### 1.5 Setup Server
```go
// cmd/server/main.go
package main

func main() {
    db, err := db.NewDB("local.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    repo := repository.NewPriceRepository(db)
    handler := handlers.NewPriceHandler(repo)
    
    mux := http.NewServeMux()
    mux.HandleFunc("/api/prices", handler.GetPrices)
    mux.HandleFunc("/api/stores", handler.GetStores)
    mux.HandleFunc("/health", handler.Health)
    
    server := &http.Server{
        Addr:    ":8080",
        Handler: corsMiddleware(mux),
    }
    
    log.Println("Server starting on :8080")
    log.Fatal(server.ListenAndServe())
}
```

### Phase 2: Frontend Transformation (1 day)

#### 2.1 Choose SSG or SPA
**Recommendation: SPA** for this use case (dynamic data, Playwright updates)

#### 2.2 Update Configuration
- Modify `next.config.ts` to use `output: 'export'`
- Update `.env` files with API URLs

#### 2.3 Convert Page Components
- Change `src/app/page.tsx` to client component
- Add `useEffect` for data fetching
- Add loading and error states

#### 2.4 Remove Database Dependencies
```bash
pnpm remove @libsql/client better-sqlite3 drizzle-orm dotenv
pnpm remove -D drizzle-kit
```

#### 2.5 Update Types
- Create `src/types/price.ts` with shared types
- Remove Drizzle ORM type imports

#### 2.6 (Optional) Replace ag-grid/ag-charts
- Use `@tanstack/react-table` for tables
- Use `recharts` for charts
- Remove `ag-grid-*` and `ag-charts-*` dependencies

### Phase 3: Integration & Testing (1 day)

#### 3.1 Local Development Setup
```bash
# Terminal 1: Start Go backend
cd backend
go run cmd/server/main.go

# Terminal 2: Start Next.js dev server
pnpm dev
```

#### 3.2 Update Playwright Tests
- Modify tests to use Go API endpoints for data insertion
- Or continue using Node.js script for data generation

#### 3.3 Build and Test
```bash
# Build frontend
pnpm build

# Test static files
npx serve out/
```

### Phase 4: Deployment (1 day)

#### 4.1 Deploy Backend
Options:
- **Railway**: Go support, PostgreSQL/SQLite
- **Fly.io**: Dockerized Go apps
- **DigitalOcean App Platform**: Go apps
- **AWS EC2/Fargate**: Full control

#### 4.2 Deploy Frontend
Options:
- **Netlify**: Free static hosting
- **Vercel**: Free static hosting
- **GitHub Pages**: Free (requires public repo)
- **AWS S3 + CloudFront**: Low cost, scalable

#### 4.3 Configure CORS
Update Go backend CORS middleware with production frontend URL

#### 4.4 Environment Variables
Set `NEXT_PUBLIC_API_URL` in deployment environment

### Total Estimated Time: 4-5 days

---

## Conclusion

### Recommended Approach: **SPA with Go Backend**

**Reasoning:**
1. ✅ Data is frequently updated (Playwright tests)
2. ✅ No SEO requirements (internal tool)
3. ✅ Simpler deployment (no build-time dependencies)
4. ✅ Always shows fresh data
5. ✅ Better separation of concerns

### Next Steps

1. **Start with Go backend development**
   - Use `modernc.org/sqlite` for pure Go (no CGo)
   - Implement REST API with standard library
   - Add CORS support

2. **Transform frontend to SPA**
   - Update `next.config.ts` to `output: 'export'`
   - Convert server components to client components
   - Add fetch logic with SWR or React Query

3. **Remove dependencies**
   - Remove database/ORM dependencies immediately
   - Consider replacing ag-grid/ag-charts for further reduction

4. **Test and deploy**
   - Test locally with both services running
   - Deploy backend to Railway/Fly.io
   - Deploy frontend to Netlify/Vercel

### Dependencies Summary

**Before:** 28 total dependencies  
**After (minimal):** 14-18 dependencies (36-50% reduction)  
**After (aggressive):** 10-14 dependencies (50-64% reduction)

### Architecture Summary

```
┌─────────────┐      HTTP/JSON      ┌──────────────┐      SQL      ┌──────────┐
│   Browser   │ ◄─────────────────► │  Go Backend  │ ◄───────────► │  SQLite  │
│  (Next.js   │                     │   (REST API) │               └──────────┘
│    SPA)     │                     └──────────────┘
└─────────────┘
     Static                              :8080
     Files                               
```

This architecture provides:
- ✅ Clean separation between frontend and backend
- ✅ Minimal dependencies
- ✅ Always fresh data
- ✅ Easy deployment
- ✅ Room for future scaling
