-- Banks table
CREATE TABLE IF NOT EXISTS banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service endpoints for each bank
CREATE TABLE IF NOT EXISTS endpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_id INTEGER NOT NULL,
    service_type TEXT NOT NULL, -- 'website', 'mobile_api', 'internet_banking', 'third_party_api'
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES banks(id),
    UNIQUE(bank_id, service_type)
);

-- Status check results (30-day retention)
CREATE TABLE IF NOT EXISTS status_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'up', 'down', 'maintenance'
    http_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id)
);

-- Index for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_status_checks_checked_at ON status_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_status_checks_endpoint_checked ON status_checks(endpoint_id, checked_at DESC);

-- Rate limit counters for circuit breaker
CREATE TABLE IF NOT EXISTS rate_limit_counters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    counter_type TEXT NOT NULL, -- 'd1_reads', 'worker_requests'
    count INTEGER DEFAULT 0,
    reset_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for the 6 Philippine banks
INSERT OR IGNORE INTO banks (slug, name) VALUES
    ('unionbank', 'UnionBank of the Philippines'),
    ('security-bank', 'Security Bank Philippines'),
    ('bpi', 'Bank of the Philippines Island'),
    ('bdo', 'Banco De Oro'),
    ('rcbc', 'Rizal Commercial Banking Corporation'),
    ('eastwest', 'EastWest Bank');

-- Seed endpoints (using publicly accessible URLs)
INSERT OR IGNORE INTO endpoints (bank_id, service_type, url) VALUES
    -- UnionBank
    ((SELECT id FROM banks WHERE slug = 'unionbank'), 'website', 'https://www.unionbankph.com'),
    ((SELECT id FROM banks WHERE slug = 'unionbank'), 'internet_banking', 'https://online.unionbankph.com'),
    ((SELECT id FROM banks WHERE slug = 'unionbank'), 'mobile_api', 'https://api.unionbankph.com/health'),
    ((SELECT id FROM banks WHERE slug = 'unionbank'), 'third_party_api', 'https://partner.unionbankph.com/status'),

    -- Security Bank
    ((SELECT id FROM banks WHERE slug = 'security-bank'), 'website', 'https://www.securitybank.com'),
    ((SELECT id FROM banks WHERE slug = 'security-bank'), 'internet_banking', 'https://online.securitybank.com'),
    ((SELECT id FROM banks WHERE slug = 'security-bank'), 'mobile_api', 'https://api.securitybank.com/health'),
    ((SELECT id FROM banks WHERE slug = 'security-bank'), 'third_party_api', 'https://developer.securitybank.com/status'),

    -- BPI
    ((SELECT id FROM banks WHERE slug = 'bpi'), 'website', 'https://www.bpi.com.ph'),
    ((SELECT id FROM banks WHERE slug = 'bpi'), 'internet_banking', 'https://www.bpionline.com'),
    ((SELECT id FROM banks WHERE slug = 'bpi'), 'mobile_api', 'https://api.bpi.com.ph/health'),
    ((SELECT id FROM banks WHERE slug = 'bpi'), 'third_party_api', 'https://api.bpi.com.ph/status'),

    -- BDO
    ((SELECT id FROM banks WHERE slug = 'bdo'), 'website', 'https://www.bdo.com.ph'),
    ((SELECT id FROM banks WHERE slug = 'bdo'), 'internet_banking', 'https://online.bdo.com.ph'),
    ((SELECT id FROM banks WHERE slug = 'bdo'), 'mobile_api', 'https://api.bdo.com.ph/health'),
    ((SELECT id FROM banks WHERE slug = 'bdo'), 'third_party_api', 'https://developer.bdo.com.ph/status'),

    -- RCBC
    ((SELECT id FROM banks WHERE slug = 'rcbc'), 'website', 'https://www.rcbc.com'),
    ((SELECT id FROM banks WHERE slug = 'rcbc'), 'internet_banking', 'https://rcbconlinebanking.com'),
    ((SELECT id FROM banks WHERE slug = 'rcbc'), 'mobile_api', 'https://api.rcbc.com/health'),
    ((SELECT id FROM banks WHERE slug = 'rcbc'), 'third_party_api', 'https://developer.rcbc.com/status'),

    -- EastWest
    ((SELECT id FROM banks WHERE slug = 'eastwest'), 'website', 'https://www.eastwestbanker.com'),
    ((SELECT id FROM banks WHERE slug = 'eastwest'), 'internet_banking', 'https://online.eastwestbanker.com'),
    ((SELECT id FROM banks WHERE slug = 'eastwest'), 'mobile_api', 'https://api.eastwestbanker.com/health'),
    ((SELECT id FROM banks WHERE slug = 'eastwest'), 'third_party_api', 'https://developer.eastwestbanker.com/status');
