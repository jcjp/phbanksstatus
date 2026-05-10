# Research: Philippine Bank Status Monitor

**Date**: 2026-05-10

## Technology Stack Decisions

### Frontend: Nuxt 3 + NuxtUI
**Decision**: Use Nuxt 3 with NuxtUI component library
**Rationale**: Nuxt 3 provides SSR, integrated API routes, and seamless Cloudflare deployment. NuxtUI offers polished Tailwind-based components.
**Alternatives**: Next.js (more complex Cloudflare setup), SvelteKit (smaller ecosystem)

### Database: Cloudflare D1
**Decision**: Use D1 for status history persistence
**Rationale**: Serverless SQLite, integrated with Workers, generous free tier (10k reads/day sufficient for moderate traffic)
**Alternatives**: KV (poor historical query support), Turso/Supabase (external dependency)

### Scheduling: Cloudflare Scheduled Workers
**Decision**: Cron Triggers every 30 minutes
**Rationale**: Built-in, no external cron service needed
**Alternatives**: External cron + Webhook (added complexity)

### Charts: Chart.js
**Decision**: Chart.js 4.x for timeline visualization
**Rationale**: Simple, well-documented, good Vue 3 integration
**Alternatives**: Tremor (newer, less mature), ECharts (heavier)

## Bank Endpoint Discovery

**Status**: Requires manual research during implementation

**Expected Scope Adjustment**: Mobile APIs and third-party integrations likely not publicly accessible. Plan to monitor:
1. Website homepage (public)
2. Internet banking portal login page (public)

**Total**: 2 endpoints × 6 banks = 12 monitored services (down from 24)

## D1 Schema Strategy

**Approach**: 4 tables (banks, endpoints, status_checks, rate_limit_counters)
**Indexes**: (endpoint_id, checked_at DESC) for historical queries
**Retention**: Auto-purge records older than 30 days during health checks

## Health Check Implementation

**Method**: fetch API with 10s timeout, 1 retry
**Error Detection**: DNS failure (TypeError), connection timeout (AbortSignal), HTTP errors (response.status)
**Status Logic**: 1-3 endpoint failures = Degraded, 4 failures = Down

## Circuit Breaker Design

**Trigger**: D1 reads >= 9,600/day OR Worker requests >= 96,000/day
**Action**: Halt health checks, display stale data with timestamp warning
**Reset**: Automatic at daily limit reset (UTC midnight)
