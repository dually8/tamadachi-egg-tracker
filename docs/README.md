# Tamadachi Egg Tracker Documentation

## Available Documentation

### [Quick Reference Guide](./QUICK_REFERENCE.md) ⚡

A condensed cheat sheet with commands, configurations, and quick examples for the transformation.

### [Go Backend + Next.js SSG/SPA Transformation Guide](./GO_BACKEND_NEXTJS_TRANSFORMATION.md) 📖

A comprehensive guide for transforming this project from a Next.js full-stack application to a Go backend with Next.js frontend (SSG or SPA).

**Covers:**
- Current architecture analysis
- Proposed Go backend architecture with minimal dependencies
- Next.js Static Site Generation (SSG) approach
  - Why SSG works for this use case
  - Limitations and solutions
  - Implementation strategy
- Next.js Single Page Application (SPA) approach
  - Why SPA is recommended for this project
  - Implementation guide
  - Performance optimization
- Dependency reduction strategy (reduce from 28 to 10-18 dependencies)
- Best practices for fetch requests in both SSG and SPA modes
- Complete implementation roadmap with time estimates

**Quick Summary:**
- **Recommended Approach:** SPA with Go Backend
- **Time Estimate:** 4-5 days
- **Dependency Reduction:** 36-64% reduction possible
- **Benefits:** Better separation of concerns, always fresh data, simpler deployment

## Project Structure

```
tamadachi-egg-tracker/
├── docs/                           # Documentation
│   ├── README.md                   # This file
│   ├── GO_BACKEND_NEXTJS_TRANSFORMATION.md  # Transformation guide
│   └── img/                        # Documentation images
├── src/                            # Current source code
│   ├── app/                        # Next.js app router pages
│   ├── components/                 # React components
│   ├── db/                         # Database layer (Drizzle ORM)
│   └── lib/                        # Utility functions
├── tests/                          # Playwright tests for price scraping
├── drizzle/                        # Database migrations
└── public/                         # Static assets
```

## Quick Links

- [Main README](../README.md) - Getting started guide for current implementation
- [Quick Reference](./QUICK_REFERENCE.md) - ⚡ Quick commands and configurations
- [Transformation Guide](./GO_BACKEND_NEXTJS_TRANSFORMATION.md) - 📖 Complete transformation documentation
