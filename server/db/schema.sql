-- Philippine Bank Status Monitor - D1 Database Schema
-- Cloudflare D1 (SQLite)

-- Banks table: 6 major Philippine banks
CREATE TABLE IF NOT EXISTS banks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  overall_status TEXT CHECK(overall_status IN ('Up', 'Degraded', 'Down', 'Maintenance')),
  last_check_at TIMESTAMP
);

-- Service endpoints: Monitored URLs for each bank
CREATE TABLE IF NOT EXISTS endpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bank_id INTEGER NOT NULL,
  service_type TEXT NOT NULL CHECK(service_type IN ('Website', 'InternetBanking')),
  url TEXT NOT NULL,
  current_status TEXT CHECK(current_status IN ('Up', 'Down', 'Maintenance')),
  last_check_at TIMESTAMP,
  last_failure_reason TEXT,
  FOREIGN KEY (bank_id) REFERENCES banks(id)
);

-- Historical status checks: 30-day retention
CREATE TABLE IF NOT EXISTS status_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint_id INTEGER NOT NULL,
  checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  http_code INTEGER,
  response_time_ms INTEGER,
  status TEXT NOT NULL CHECK(status IN ('Up', 'Down', 'Maintenance')),
  failure_reason TEXT,
  FOREIGN KEY (endpoint_id) REFERENCES endpoints(id)
);

-- Index for efficient historical queries
CREATE INDEX IF NOT EXISTS idx_checks_history ON status_checks(endpoint_id, checked_at DESC);

-- Rate limit counters for circuit breaker
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT UNIQUE NOT NULL,
  count INTEGER DEFAULT 0,
  reset_at TIMESTAMP NOT NULL
);

-- Seed data: Banks (6 major Philippine banks)
INSERT INTO banks (name, slug, overall_status) VALUES
('UnionBank of the Philippines', 'unionbank', 'Up'),
('Security Bank Philippines', 'securitybank', 'Up'),
('Bank of the Philippine Islands (BPI)', 'bpi', 'Up'),
('Banco De Oro (BDO)', 'bdo', 'Up'),
('Rizal Commercial Banking Corporation (RCBC)', 'rcbc', 'Up'),
('EastWest Bank', 'eastwest', 'Up');

-- Seed data: Endpoints (2 per bank - Website + Internet Banking)
-- Note: Mobile APIs and third-party APIs are not publicly accessible (as researched)
-- Total: 12 monitored endpoints (down from original 24)

-- UnionBank endpoints
INSERT INTO endpoints (bank_id, service_type, url, current_status) VALUES
(1, 'Website', 'https://www.unionbankph.com/', 'Up'),
(1, 'InternetBanking', 'https://online.unionbankph.com/', 'Up');

-- Security Bank endpoints
INSERT INTO endpoints (bank_id, service_type, url, current_status) VALUES
(2, 'Website', 'https://www.securitybank.com/', 'Up'),
(2, 'InternetBanking', 'https://www.securitybank.com/online-banking/login/', 'Up');

-- BPI endpoints
INSERT INTO endpoints (bank_id, service_type, url, current_status) VALUES
(3, 'Website', 'https://www.bpi.com.ph/', 'Up'),
(3, 'InternetBanking', 'https://online.bpi.com.ph/', 'Up');

-- BDO endpoints
INSERT INTO endpoints (bank_id, service_type, url, current_status) VALUES
(4, 'Website', 'https://www.bdo.com.ph/', 'Up'),
(4, 'InternetBanking', 'https://online.bdo.com.ph/', 'Up');

-- RCBC endpoints
INSERT INTO endpoints (bank_id, service_type, url, current_status) VALUES
(5, 'Website', 'https://www.rcbc.com/', 'Up'),
(5, 'InternetBanking', 'https://www.rcbconlinebanking.com/', 'Up');

-- EastWest Bank endpoints
INSERT INTO endpoints (bank_id, service_type, url, current_status) VALUES
(6, 'Website', 'https://www.eastwestbanker.com/', 'Up'),
(6, 'InternetBanking', 'https://www.eastwestcorporate.com.ph/', 'Up');

-- Initialize rate limit counters
INSERT INTO rate_limit_counters (metric_name, count, reset_at) VALUES
('d1_reads_daily', 0, datetime('now', '+1 day', 'start of day')),
('worker_requests_daily', 0, datetime('now', '+1 day', 'start of day'));
