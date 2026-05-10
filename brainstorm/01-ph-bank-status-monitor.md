# Brainstorm: Philippine Bank Status Monitor

**Date:** 2026-05-10
**Status:** active

## Problem Framing

Philippine bank customers need visibility into the operational status of their banks' digital services (website, mobile app, internet banking, APIs). Currently, there's no centralized public dashboard showing real-time and historical status across multiple banks. When services go down, customers have no way to quickly check if it's a widespread issue or isolated to specific services.

This project creates a single-page public dashboard that aggregates status across 6 major Philippine banks:
1. UnionBank of the Philippines
2. Security Bank Philippines
3. Bank of the Philippines Island (BPI)
4. Banco De Oro (BDO)
5. Rizal Commercial Banking Corporation (RCBC)
6. EastWest Bank

The dashboard provides multi-state status (Up/Degraded/Down/Maintenance) for each bank's digital services, tracks 7-30 days of historical data, and updates automatically.

## Approaches Considered

### A: Nuxt + D1 + Scheduled Workers (CHOSEN)

**Stack:**
- Nuxt 3 (Vue SSR on Cloudflare Workers)
- NuxtUI for UI components and design system
- Cloudflare D1 (SQLite) for status history persistence
- Scheduled Workers with Cron Triggers for status checks (30min interval)
- Polling or Server-Sent Events (SSE) for live updates on frontend

**Architecture:**
- Scheduled Worker runs every 30 minutes, pings all bank endpoints (4 types × 6 banks = 24 endpoints)
- Worker writes status results to D1 database
- Nuxt frontend queries D1 for current status and historical data
- Single-page dashboard displays timeline charts and current status
- Auto-refresh via client-side polling (simple) or SSE (more elegant)
- Rate-limit protection: Circuit breaker stops checks when 96% of service limits reached (4% safety buffer)

**Pros:**
- Fully Cloudflare-native (no external dependencies)
- D1 SQLite perfect for 30-day rolling history with structured queries
- Built-in Cron scheduling (no external cron service needed)
- Generous free tier (10k D1 reads/day, 100k Worker requests/day)
- Simple architecture, fewer moving parts

**Cons:**
- D1 has query limits on free tier (10k reads/day)
- SSE on Workers requires workarounds (polling is simpler fallback)
- Maintenance state detection requires heuristics or config (no admin UI)

### B: Nuxt + KV + Durable Objects

**Stack:**
- Nuxt 3 + NuxtUI
- Cloudflare KV for current status + sliding time window
- Durable Objects for status checker state coordination
- Scheduled Workers for periodic checks

**Pros:**
- KV extremely fast reads (ultra-low latency for dashboard)
- Durable Objects handle stateful checker logic well
- Real-time updates easier with Durable Object WebSocket support

**Cons:**
- KV not designed for historical queries (schema would be awkward)
- Durable Objects add architectural complexity
- More moving parts to coordinate
- Historical data retrieval inefficient

### C: Nuxt + External DB (Turso/Supabase)

**Stack:**
- Nuxt 3 + NuxtUI
- External database: Turso (edge SQLite) or Supabase (Postgres)
- Scheduled Workers call external DB for persistence

**Pros:**
- Rich SQL querying capabilities for history and analytics
- Familiar database patterns and tooling
- Better GUI tools (migrations, admin dashboards)

**Cons:**
- External dependency introduces latency, cost, and reliability concerns
- Not fully Cloudflare-native (breaks single-platform goal)
- Extra configuration (auth, connection pooling, network egress)
- User specified "deployed on Cloudflare" which implies full-stack Cloudflare

## Decision

**Chosen: Approach A (Nuxt + D1 + Scheduled Workers)**

**Reasoning:**
- Best balance of simplicity, cost-efficiency, and Cloudflare-native architecture
- D1 SQLite handles 30-day historical data well with structured queries
- Nuxt 3 + NuxtUI provides polished Vue developer experience and component library
- Scheduled Workers are built-in, no external cron service needed
- Fully contained within Cloudflare ecosystem (user's deployment target)
- Free tier sufficient for initial launch and moderate traffic
- Rate-limit safeguards (4% buffer) prevent service disruption

## Key Requirements

### Functional Requirements
1. **Bank Coverage**: Monitor 6 major Philippine banks (UnionBank, Security Bank, BPI, BDO, RCBC, EastWest)
2. **Endpoint Types**: Track 4 service categories per bank:
   - Website (main homepage)
   - Mobile app API
   - Internet banking portal
   - Third-party API integrations
3. **Status States**: Multi-state classification
   - **Up**: All endpoints responding normally
   - **Degraded**: Some endpoints failing, some working (partial failure)
   - **Down**: All endpoints failing or unreachable
   - **Maintenance**: Scheduled/announced maintenance (manual flag or auto-detected)
4. **Data Source Strategy**:
   - Prefer official bank status feeds/APIs if available
   - Fallback to active health checks (HTTP ping) for banks without official feeds
5. **Check Frequency**: 30+ minute interval (conservative, reduces load)
6. **Historical Data**: Store 7-30 days of status change history with timestamps
7. **Dashboard Features**:
   - Single-page public view (no authentication)
   - Current status for all banks and endpoints
   - Timeline charts showing status history
   - Incident duration and start time display
   - Auto-refresh when status changes
8. **Access Model**: View-only public dashboard (no admin interface in v1)

### Technical Requirements
1. **Frontend**: Nuxt 3 (Vue 3 framework) + NuxtUI component library
2. **Styling**: NuxtUI (built on Tailwind CSS)
3. **Backend**: Cloudflare Workers (serverless functions)
4. **Database**: Cloudflare D1 (SQLite-compatible)
5. **Scheduling**: Cloudflare Scheduled Workers (Cron Triggers)
6. **Deployment**: Full-stack on Cloudflare (Workers + Pages)
7. **Rate-Limit Protection**:
   - Track service usage (D1 reads, Worker requests, Cron executions)
   - Circuit breaker logic: halt checks when 96% capacity reached (4% safety buffer)
   - Graceful degradation: display stale data with warning when throttled
   - Auto-resume when limits reset (daily/monthly depending on service)

### Non-Functional Requirements
1. **Performance**: Sub-second page load, low latency dashboard queries
2. **Reliability**: Rate-limit safeguards prevent service exhaustion
3. **Scalability**: Free tier supports moderate traffic, paid tier for growth
4. **Maintainability**: Simple architecture, minimal dependencies
5. **Cost**: Optimize for Cloudflare free tier, minimal external costs

## Open Questions

The following questions should be resolved during the specification phase:

1. **Bank Endpoint Discovery**: Research and identify exact URLs to monitor for each bank and service type (website, mobile API, banking portal, third-party APIs)
2. **Maintenance Detection**: Define heuristics or patterns to auto-detect maintenance mode
   - Specific HTTP status codes (503 Service Unavailable?)
   - Response body patterns (maintenance page HTML signatures?)
   - Configuration file for scheduled maintenance windows?
3. **Status Thresholds**: Define thresholds for Degraded vs Down states
   - How many endpoints must fail to trigger Degraded? (1 of 4? 2 of 4?)
   - Does critical endpoint failure (e.g., internet banking) override other successes?
4. **Rate-Limit Counter Persistence**: Where to store usage counters?
   - D1 metadata table?
   - Cloudflare KV?
   - Durable Objects?
   - Reset schedule (daily at midnight UTC?)
5. **Chart Library**: Choose visualization library for timeline charts
   - Chart.js (simple, popular)
   - Apache ECharts (feature-rich)
   - Tremor (Tailwind-native)
   - Native HTML/CSS (minimal dependencies)
6. **Error Handling**: Define behavior when health check fails vs endpoint is down
   - Retry logic before marking as Down?
   - Timeout thresholds (5s? 10s? 30s?)
   - DNS failure vs connection timeout vs HTTP error distinction?
7. **Historical Data Retention**: Exact retention policy
   - 7 days? 30 days? Configurable?
   - Data compaction strategy (hourly rollup after N days?)
8. **Real-Time Updates**: Polling vs SSE implementation
   - Polling interval (30s? 60s?)
   - SSE feasibility on Cloudflare Workers
   - Fallback strategy if SSE unavailable
