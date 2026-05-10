# Implementation Plan: Philippine Bank Status Monitor

**Branch**: `002-ph-bank-status` | **Date**: 2026-05-10 | **Spec**: [spec.md](./spec.md)

## Summary

Public dashboard monitoring 6 Philippine banks' digital services (UnionBank, Security Bank, BPI, BDO, RCBC, EastWest). Automated health checks every 30 minutes, 4-state status (Up/Degraded/Down/Maintenance), 30-day historical data with timeline visualization. Full Cloudflare stack: Nuxt 3 frontend + D1 database + Scheduled Workers.

## Technical Context

**Language**: TypeScript 5.x, Node.js 18+
**Framework**: Nuxt 3.x, NuxtUI 2.x, Chart.js 4.x
**Storage**: Cloudflare D1 (SQLite)
**Testing**: Vitest, Playwright
**Platform**: Cloudflare Workers + Pages
**Type**: Full-stack web application
**Performance**: <1s page load, <2s historical queries, 30min check interval
**Constraints**: Cloudflare free tier (10k D1 reads/day, 100k Worker requests/day), 96% circuit breaker threshold
**Scale**: 24 monitored endpoints (6 banks × 4 services), 30-day retention, up to 1000 views/day

## Constitution Check

No project constitution file found. Constitutional compliance check skipped.

## Project Structure

Nuxt 3 monorepo with integrated Workers backend:
- server/ - API routes, scheduled workers, D1 utilities
- pages/ - Vue frontend pages
- components/ - Reusable Vue components  
- composables/ - Vue composition functions
- tests/ - Unit and E2E tests

### File Responsibility Mapping

**Database Layer** (server/db/):
- schema.sql: Table definitions (banks, endpoints, status_checks, rate_limit_counters), indexes, 30-day retention constraints
- queries.ts: D1 query utilities (getCurrentStatus, getHistoricalData, insertCheckResult, purgeOldRecords)

**Backend Workers** (server/scheduled/):
- check-banks.ts: Scheduled health check worker (HTTP pings, timeout/retry, status determination, maintenance detection, purge trigger)

**Backend Utilities** (server/utils/):
- circuit-breaker.ts: Rate limit protection (check D1 counters, halt at 96%, return stale data flag)

**API Routes** (server/api/):
- status.get.ts: Current status endpoint for all banks (queries D1, respects circuit breaker)
- history/[bankSlug].get.ts: Historical data endpoint (30-day timeline for single bank)

**Frontend Components** (components/):
- BankStatusCard.vue: Single bank status display (color-coded badges, service breakdown)
- CircuitBreakerBanner.vue: Rate limit warning banner (show when circuit breaker active)
- StatusTimeline.vue: Chart.js historical timeline (30-day status changes, incident tooltips)

**Frontend Composables** (composables/):
- useStatusPoll.ts: Auto-refresh polling logic (60s intervals, fetch /api/status, reactive state)

**Frontend Pages** (pages/):
- index.vue: Main dashboard (layout 6 banks, summary indicator, historical expand/collapse)

**Types** (types/):
- status.ts: Shared TypeScript types (Bank, Endpoint, StatusCheckResult, StatusHistoryRecord)

**Tests** (tests/):
- e2e/dashboard.spec.ts: End-to-end tests (dashboard load, auto-refresh, timeline, circuit breaker)
- performance/: Lighthouse CI, query timing verification

## Phase 0: Research → research.md

1. Bank endpoint discovery (validate public accessibility)
2. D1 schema design (30-day rolling window, query optimization)
3. Nuxt + Cloudflare integration patterns
4. Chart.js + NuxtUI compatibility
5. Health check implementation (timeout, retry, error detection)

## Phase 1: Design → data-model.md, quickstart.md

**Entities**: banks, endpoints, status_checks, rate_limit_counters

**API Routes**:
- GET /api/status → current status for all banks
- GET /api/history/:bankSlug → 30-day historical data

## Phase 2: Tasks → tasks.md (via /speckit-tasks)

Setup, database layer, backend workers, API routes, frontend dashboard, deployment, testing (80%+ coverage)

## Key Risks

| Risk | Mitigation |
|------|------------|
| Mobile/API endpoints not public | Scope to Website + Banking portals only (2/bank) |
| Bot detection blocks requests | Realistic User-Agent, exponential backoff |
| Free tier limits exceeded | Circuit breaker at 96%, display stale data with warning |
