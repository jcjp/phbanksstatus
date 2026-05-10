# Brainstorm: Philippine Bank Status Monitor

**Date:** 2026-05-10
**Status:** ✅ **Completed** (Implementation in specs/001-ph-bank-status)
**PRs:** [#1](https://github.com/jcjp/phbanksstatus/pull/1) (closed), [#2](https://github.com/jcjp/phbanksstatus/pull/2) (merged)

## Problem Framing

Philippine bank customers need visibility into the operational status of their banks' digital services (website, mobile app, internet banking, APIs). Currently, there's no centralized public dashboard showing real-time and historical status across multiple banks. When services go down, customers have no way to quickly check if it's a widespread issue or isolated to specific services.

This project creates a single-page public dashboard that aggregates status across 6 major Philippine banks:
1. UnionBank of the Philippines
2. Security Bank Philippines
3. Bank of the Philippines Island (BPI)
4. Banco De Oro (BDO)
5. Rizal Commercial Banking Corporation (RCBC)
6. EastWest Bank

The dashboard provides multi-state status (up/degraded/down/maintenance) for each bank's digital services, tracks 30 days of historical data, and updates automatically.

## Decision

**Chosen: Nuxt 3 + Cloudflare D1 + Scheduled Workers**

**Stack:**
- Nuxt 3 (Vue SSR on Cloudflare Workers)
- NuxtUI for UI components and design system
- Cloudflare D1 (SQLite) for status history persistence
- Scheduled Workers with Cron Triggers for status checks (30min interval)
- Client-side polling for auto-refresh (60s interval)
- Rate-limit protection: Circuit breaker at 96% threshold

**Architecture:**
- Scheduled Worker runs every 30 minutes, pings monitored endpoints
- Worker writes status results to D1 database
- Nuxt frontend queries D1 for current status and historical data
- Single-page dashboard displays timeline charts and current status
- Auto-refresh via client-side polling
- Circuit breaker stops checks when approaching Cloudflare limits

## Implementation Summary

### Completed Features (PR #2)
- ✅ Real-time monitoring for 6 banks (12 endpoints: website + internet banking)
- ✅ BPI official system status integration (9 systems from official API)
- ✅ Circuit breaker pattern for rate limiting (96% threshold)
- ✅ 30-day historical data with uptime visualization
- ✅ Auto-refresh dashboard (60s polling)
- ✅ Color-coded status badges (up/degraded/down/maintenance)
- ✅ API endpoints: `/api/status`, `/api/history/:bankSlug`, `/api/bpi-official`
- ✅ 2-column grid layout for BPI systems
- ✅ Unit and E2E tests
- ✅ TypeScript strict mode with comprehensive types

### Schema Fixes (Post-PR #2)
Fixed 8 review issues from Gemini/Codex:
- ✅ Status enum casing normalized (lowercase)
- ✅ Column alignment: `failure_reason` → `error_message`
- ✅ Column alignment: `metric_name` → `counter_type`, added `updated_at`
- ✅ Historical grouping: truncate timestamps to minute level
- ✅ BPI API error handling: return 'Unknown' status instead of mock data
- ✅ Updated tests to match lowercase status values
- ✅ Added missing tailwindcss dependency

### Pending Manual Steps
1. D1 database creation: `wrangler d1 create phbanksstatus`
2. Schema initialization: `wrangler d1 execute phbanksstatus --file server/db/schema.sql`
3. Deployment: `npm install && npm run build && wrangler pages publish dist`

## Key Decisions Made

1. **Endpoint Strategy**: Research showed mobile APIs and third-party APIs are not publicly accessible. Reduced scope to 2 endpoints per bank (website + internet banking = 12 total).

2. **BPI Integration**: Added official BPI system status API integration (`https://system-status.bpi.com.ph/api/systems`) for 9 BPI systems.

3. **Status States**: 
   - `up`: All endpoints responding
   - `degraded`: 1-3 endpoints down
   - `down`: All endpoints down
   - `maintenance`: Any endpoint in maintenance

4. **Rate Limits**: Circuit breaker at 96% (4% safety buffer) of Cloudflare free tier limits:
   - D1 reads: 10,000/day
   - Worker requests: 100,000/day

5. **Historical Retention**: 30 days with automatic purge of older records.

6. **Auto-Refresh**: Client-side polling every 60s (simpler than SSE on Workers).

7. **Error Handling**: BPI API failures return 'Unknown' status with error message instead of misleading mock data.

## Files Reference

- **Spec**: `specs/002-ph-bank-status/spec.md`
- **Plan**: `specs/002-ph-bank-status/plan.md`
- **Tasks**: `specs/002-ph-bank-status/tasks.md`
- **Completion**: `specs/002-ph-bank-status/COMPLETION.md`
- **Research**: `specs/002-ph-bank-status/research.md`

## Next Steps

1. Deploy to Cloudflare Pages
2. Set up D1 database in production
3. Enable scheduled cron jobs
4. Monitor circuit breaker metrics
5. Add more banks as official APIs become available
