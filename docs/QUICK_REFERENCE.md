# Quick Reference: Go Backend + Next.js Transformation

This is a quick reference guide extracted from the [full transformation documentation](./GO_BACKEND_NEXTJS_TRANSFORMATION.md).

## TL;DR - Recommended Approach

**Use SPA (Single Page Application) with Go Backend**

- ✅ Best for frequently updated data
- ✅ Simpler deployment
- ✅ Always shows fresh data
- ✅ Reduces dependencies by 36-64%

## Quick Start Commands

### Phase 1: Go Backend

```bash
# Create backend directory
mkdir backend && cd backend

# Initialize Go module
go mod init github.com/dually8/tamadachi-egg-tracker-go

# Add SQLite dependency (pure Go, no CGo)
go get modernc.org/sqlite

# Run server
go run cmd/server/main.go
```

### Phase 2: Transform Frontend to SPA

```bash
# Remove database dependencies
pnpm remove @libsql/client better-sqlite3 drizzle-orm dotenv
pnpm remove -D drizzle-kit

# (Optional) Add SWR for better data fetching
pnpm add swr
```

**Update next.config.ts:**
```typescript
const nextConfig: NextConfig = {
  output: 'export', // Changed from 'standalone'
  trailingSlash: true,
  images: { unoptimized: true },
};
```

**Create .env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Phase 3: Development

```bash
# Terminal 1: Start Go backend
cd backend && go run cmd/server/main.go

# Terminal 2: Start Next.js dev
pnpm dev
```

### Phase 4: Build & Deploy

```bash
# Build frontend
pnpm build

# Output: out/ directory
# Deploy to: Netlify, Vercel, GitHub Pages, etc.
```

## Key Configuration Changes

### next.config.ts
```typescript
// BEFORE
const nextConfig: NextConfig = {
  output: 'standalone',
  // ...
};

// AFTER
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
```

### src/app/page.tsx
```typescript
// BEFORE (Server Component)
export const dynamic = 'force-dynamic';
export default async function Home() {
  const prices = await db.select()...;
  return <PriceTableAgGrid prices={prices} />;
}

// AFTER (Client Component - SPA)
'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prices`)
      .then(res => res.json())
      .then(setPrices)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <PriceTableAgGrid prices={prices} />;
}
```

## Minimal Go Backend Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go           # Server entry point
├── internal/
│   ├── db/
│   │   └── db.go             # Database connection
│   ├── models/
│   │   └── price.go          # Data models
│   ├── repository/
│   │   └── price_repo.go     # Database queries
│   └── handlers/
│       └── price_handler.go  # HTTP handlers
├── go.mod
└── go.sum
```

## Go API Endpoints

```go
// Required endpoints
GET  /api/prices    // List all prices
GET  /api/stores    // List unique stores
POST /api/prices    // Create new price (for Playwright)
GET  /health        // Health check
```

## CORS Configuration (Go)

```go
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

## Best Practices: Fetch in SPA

### Option 1: Basic useState + useEffect
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/prices')
    .then(r => r.json())
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```

### Option 2: SWR (Recommended)
```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const { data, error, isLoading } = useSWR('/api/prices', fetcher);
```

### Option 3: React Query
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['prices'],
  queryFn: () => fetch('/api/prices').then(r => r.json()),
});
```

## Dependencies to Remove

```bash
# Remove these immediately (backend moved to Go):
pnpm remove @libsql/client better-sqlite3 drizzle-orm dotenv
pnpm remove -D drizzle-kit
```

## Optional: Replace Heavy Dependencies

```bash
# Remove ag-grid/ag-charts (optional, saves ~900KB)
pnpm remove ag-grid-react ag-grid-community
pnpm remove ag-charts-react ag-charts-community

# Already have these lighter alternatives:
# - @tanstack/react-table (for tables)
# - recharts (for charts)
```

## Time Estimates

| Phase | Task | Time |
|-------|------|------|
| 1 | Go Backend Development | 1-2 days |
| 2 | Frontend Transformation | 1 day |
| 3 | Integration & Testing | 1 day |
| 4 | Deployment | 1 day |
| **Total** | | **4-5 days** |

## Deployment Checklist

### Backend (Go)
- [ ] Choose hosting: Railway, Fly.io, DigitalOcean, AWS
- [ ] Set up database (SQLite file or managed service)
- [ ] Configure CORS for production domain
- [ ] Set up environment variables
- [ ] Deploy and test API endpoints

### Frontend (Next.js SPA)
- [ ] Build: `pnpm build`
- [ ] Test static files: `npx serve out/`
- [ ] Choose hosting: Netlify, Vercel, GitHub Pages, S3
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend
- [ ] Deploy static files
- [ ] Test end-to-end functionality

## Docker Deployment (Quick Reference)

### Multi-Container with Docker Compose (Recommended)

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    ports:
      - "8080:8080"
    environment:
      - DB_FILE_NAME=/data/local.db
    volumes:
      - sqlite-data:/data
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        NEXT_PUBLIC_API_URL: http://backend:8080
    ports:
      - "3000:8080"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  sqlite-data:
```

**Quick Commands:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access: http://localhost:3000
```

### Single Container (Simpler)

**Using unified Dockerfile:**
```bash
# Build image
docker build -t egg-tracker:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -e DB_FILE_NAME=/data/local.db \
  --name egg-tracker \
  egg-tracker:latest

# View logs
docker logs -f egg-tracker

# Stop and remove
docker stop egg-tracker && docker rm egg-tracker
```

### Development with Hot Reload

```yaml
# docker-compose.dev.yml
services:
  backend:
    volumes:
      - ./backend:/app
    command: air  # Go hot reload

  frontend:
    volumes:
      - .:/app
      - /app/node_modules
    command: pnpm dev
    ports:
      - "3000:3000"
```

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up
```

### Docker Build Files Summary

**Backend Dockerfile.backend:**
- Multi-stage build (golang:alpine → alpine)
- Pure Go SQLite driver (CGO_ENABLED=0)
- Non-root user
- Health checks

**Frontend Dockerfile.frontend:**
- Multi-stage build (node:alpine → nginx:alpine)
- Next.js static export
- Nginx for serving files
- Optimized caching

**See full documentation for complete Dockerfiles and configurations.**

## Troubleshooting

### Issue: CORS errors
**Solution:** Update Go backend CORS middleware with frontend URL

### Issue: Fetch fails in production
**Solution:** Check `NEXT_PUBLIC_API_URL` environment variable

### Issue: Build fails with "output: export"
**Solution:** Ensure no server-only features (API routes, ISR, etc.)

### Issue: Images not loading
**Solution:** Add `images: { unoptimized: true }` to next.config.ts

### Issue: Docker container won't start
**Solution:** Check logs with `docker logs <container-name>` and ensure ports are not in use

### Issue: Containers can't communicate
**Solution:** Ensure they're on the same Docker network or use service names in docker-compose

## Further Reading

📖 **[Full Transformation Guide](./GO_BACKEND_NEXTJS_TRANSFORMATION.md)** - Detailed explanations, code examples, and best practices

---

**Questions?** See the [full documentation](./GO_BACKEND_NEXTJS_TRANSFORMATION.md) for in-depth coverage of all topics.
