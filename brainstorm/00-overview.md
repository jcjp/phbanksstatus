# Brainstorm Overview

Last updated: 2026-05-10

## Sessions

| # | Date | Topic | Status | Spec |
|---|------|-------|--------|------|
| 01 | 2026-05-10 | ph-bank-status-monitor | ✅ completed | [specs/001-ph-bank-status](../specs/001-ph-bank-status) |

## Open Threads

(none)

## Resolved Threads

- ✅ Bank endpoint discovery - need to research exact URLs for each bank's services (from #01)
  - Resolution: Manually curated URLs for 6 banks × 4 services (website, mobile API, internet banking, third-party API)

- ✅ Maintenance detection heuristics - define HTTP codes, response patterns, or config approach (from #01)
  - Resolution: HTTP 503 status code + known maintenance page HTML pattern matching

- ✅ Status threshold definition - how many endpoints must fail for Degraded vs Down (from #01)
  - Resolution: 1-3 endpoint failures = Degraded, all 4 endpoints failing = Down

- ✅ Rate-limit counter persistence - where to store usage tracking (D1/KV/DO) (from #01)
  - Resolution: D1 table `rate_limit_counters`, circuit breaker halts checks at 96% quota

- ✅ Chart library selection - Chart.js vs ECharts vs Tremor vs native (from #01)
  - Resolution: Chart.js 4.x for historical timeline (30-day status visualization)

- ✅ Error handling behavior - retry logic, timeout thresholds, failure type classification (from #01)
  - Resolution: Retry once with 10s timeout, distinguish DNS failure/connection timeout/HTTP errors

- ✅ Historical data retention policy - exact days (7/30?), compaction strategy (from #01)
  - Resolution: 30-day retention with database constraints

- ✅ Real-time update implementation - polling vs SSE, intervals, fallback strategy (from #01)
  - Resolution: Client-side polling at 60s intervals via `/api/status` endpoint

## Parked Ideas

(none)
