# Data Model: Philippine Bank Status Monitor

## Database Schema (Cloudflare D1 / SQLite)

### banks

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| slug | TEXT | UNIQUE NOT NULL |
| overall_status | TEXT | CHECK(overall_status IN ('Up','Degraded','Down','Maintenance')) |
| last_check_at | TIMESTAMP | |

### endpoints

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| bank_id | INTEGER | NOT NULL FOREIGN KEY → banks(id) |
| service_type | TEXT | NOT NULL CHECK(service_type IN ('Website','MobileAPI','InternetBanking','ThirdPartyAPI')) |
| url | TEXT | NOT NULL |
| current_status | TEXT | CHECK(current_status IN ('Up','Down','Maintenance')) |
| last_check_at | TIMESTAMP | |
| last_failure_reason | TEXT | |

### status_checks

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| endpoint_id | INTEGER | NOT NULL FOREIGN KEY → endpoints(id) |
| checked_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |
| http_code | INTEGER | |
| response_time_ms | INTEGER | |
| status | TEXT | NOT NULL CHECK(status IN ('Up','Down','Maintenance')) |
| failure_reason | TEXT | |

**Index**: CREATE INDEX idx_checks_history ON status_checks(endpoint_id, checked_at DESC);

### rate_limit_counters

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| metric_name | TEXT | UNIQUE NOT NULL |
| count | INTEGER | DEFAULT 0 |
| reset_at | TIMESTAMP | NOT NULL |

**Metrics**: 'd1_reads_daily', 'worker_requests_daily'

## Entity Relationships

- Bank 1:N Endpoints
- Endpoint 1:N StatusChecks
- RateLimitCounter (singleton per metric)

## Seed Data

6 banks: UnionBank, SecurityBank, BPI, BDO, RCBC, EastWest
Each bank: 2-4 endpoints (Website, InternetBanking, MobileAPI*, ThirdPartyAPI*)
*Conditional based on public accessibility research
