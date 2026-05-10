# Philippine Bank Status Monitor

Public dashboard for tracking operational status of major Philippine banks' digital services.

## Features

- **Real-time Monitoring**: Automated health checks every 30 minutes for 6 major Philippine banks
- **Multi-Service Tracking**: Monitors 4 service types per bank (Website, Mobile API, Internet Banking, Third-party API)
- **Historical Data**: 30-day retention with visual timeline charts
- **Auto-refresh Dashboard**: Client-side polling updates status every 60 seconds
- **Circuit Breaker Protection**: Rate limit management to stay within Cloudflare free tier
- **4-State Status System**: Up, Degraded, Down, Maintenance

## Monitored Banks

1. UnionBank of the Philippines
2. Security Bank Philippines
3. Bank of the Philippines Island (BPI)
4. Banco De Oro (BDO)
5. Rizal Commercial Banking Corporation (RCBC)
6. EastWest Bank

## Tech Stack

- **Frontend**: Nuxt 3 + NuxtUI + Chart.js
- **Backend**: Cloudflare Workers (Nitro)
- **Database**: Cloudflare D1 (SQLite)
- **Scheduled Jobs**: Cloudflare Cron Triggers
- **Deployment**: Cloudflare Pages
- **Testing**: Vitest + Playwright

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account (for D1 database)
- Wrangler CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phbanksstatus
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
vp install
```

3. Create D1 database:
```bash
# For local development
npx wrangler d1 create phbanksstatus-local

# For production
npx wrangler d1 create phbanksstatus
```

4. Update `wrangler.toml` with your database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "phbanksstatus"
database_id = "YOUR_DATABASE_ID_HERE"
```

5. Initialize the database schema:
```bash
# Local
npx wrangler d1 execute phbanksstatus-local --file=./server/db/schema.sql

# Production
npx wrangler d1 execute phbanksstatus --file=./server/db/schema.sql
```

6. Run development server:
```bash
npm run dev
# or
vp dev
```

The application will be available at `http://localhost:3000`

## Database Management

### Query D1 Database

```bash
# Local
npx wrangler d1 execute phbanksstatus-local --command="SELECT * FROM banks"

# Production
npx wrangler d1 execute phbanksstatus --command="SELECT * FROM banks"
```

### Backup Database

```bash
npx wrangler d1 backup create phbanksstatus
```

### Manual Health Check Trigger

The scheduled worker runs every 30 minutes automatically. For manual testing:

```bash
npx wrangler dev --test-scheduled
```

## Testing

### Unit Tests

```bash
npm run test
# or
vp test
```

### E2E Tests

```bash
npm run test:e2e
# or
vp test:e2e
```

### Test Coverage

Coverage threshold is set to 80% for all metrics (lines, functions, branches, statements).

## Deployment

### Build for Production

```bash
npm run build
# or
vp build
```

### Deploy to Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.output/public`
   - **Environment variables**: Set up D1 binding

3. Set up Cron Trigger:
```bash
npx wrangler deploy
```

The cron trigger is configured in `wrangler.toml` to run every 30 minutes.

## Project Structure

```
phbanksstatus/
├── server/
│   ├── api/              # API routes
│   │   ├── status.get.ts
│   │   └── history/
│   │       └── [bankSlug].get.ts
│   ├── db/               # Database layer
│   │   ├── schema.sql
│   │   └── queries.ts
│   ├── scheduled/        # Scheduled workers
│   │   └── check-banks.ts
│   └── utils/            # Backend utilities
│       └── circuit-breaker.ts
├── components/           # Vue components
│   ├── BankStatusCard.vue
│   ├── CircuitBreakerBanner.vue
│   └── StatusTimeline.vue
├── composables/          # Vue composables
│   └── useStatusPoll.ts
├── pages/                # Nuxt pages
│   └── index.vue
├── types/                # TypeScript types
│   └── status.ts
├── tests/                # Tests
│   ├── unit/
│   ├── e2e/
│   └── performance/
├── nuxt.config.ts
├── wrangler.toml
├── vitest.config.ts
└── playwright.config.ts
```

## Configuration

### Circuit Breaker Thresholds

The circuit breaker activates at 96% of Cloudflare free tier limits:
- D1 Reads: 9,600/day (96% of 10,000)
- Worker Requests: 96,000/day (96% of 100,000)

### Health Check Configuration

- **Interval**: Every 30 minutes (Cron: `*/30 * * * *`)
- **Timeout**: 10 seconds per request
- **Retry**: 1 retry on timeout
- **User-Agent**: `PHBankStatus/1.0 (Health Monitoring Service)`

### Data Retention

- **Historical Data**: 30 days
- **Automatic Purge**: Runs after each health check cycle

## API Endpoints

### GET /api/status

Returns current status for all banks.

**Response:**
```json
{
  "banks": [
    {
      "id": 1,
      "slug": "unionbank",
      "name": "UnionBank of the Philippines",
      "status": "up",
      "lastChecked": "2024-04-03T10:30:00Z",
      "endpoints": [...]
    }
  ],
  "circuitBreaker": {
    "isActive": false,
    "d1ReadsCount": 1234,
    "workerRequestsCount": 5678,
    "d1ReadsLimit": 10000,
    "workerRequestsLimit": 100000,
    "resetAt": "2024-04-04T00:00:00Z"
  }
}
```

### GET /api/history/:bankSlug

Returns 30-day historical data for a specific bank.

**Response:**
```json
{
  "bankSlug": "unionbank",
  "history": [
    {
      "timestamp": "2024-04-03T10:00:00Z",
      "status": "up"
    },
    {
      "timestamp": "2024-04-03T09:30:00Z",
      "status": "Degraded",
      "affectedServices": ["mobile_api"]
    }
  ]
}
```

### GET /api/bpi-official

Returns real-time status from BPI's official system status page. Displays detailed status for all 9 BPI systems.

**Response:**
```json
{
  "systems": [
    {
      "id": 1,
      "name": "bpi-app",
      "displayName": "BPI Mobile App",
      "status": "Operational",
      "description": "The system is performing as expected with no known issues."
    },
    {
      "id": 2,
      "name": "bpi-online",
      "displayName": "BPI Online",
      "status": "Operational",
      "description": "The system is performing as expected with no known issues."
    }
  ],
  "lastUpdated": "2024-04-03T10:30:00Z"
}
```

**Status values:**
- `Operational` - System working normally
- `Degraded` / `Reduced Availability` - Performance issues
- `Temporarily Unavailable` - System down

**Note:** In development, falls back to mock data when SSL cert validation fails. Works correctly in Cloudflare Workers production environment.
## Status Determination Logic

### Bank Status
- **Up**: All 4 endpoints responding successfully
- **Degraded**: 1-3 endpoints failing
- **Down**: All 4 endpoints failing
- **Maintenance**: Any endpoint returns HTTP 503 with maintenance page pattern

### Service Status
- **Up**: HTTP 200-299 response
- **Down**: Connection timeout, DNS failure, HTTP error, or connection refused
- **Maintenance**: HTTP 503 with maintenance keywords in response body

## Troubleshooting

### Database Connection Issues

If you see "Database not available" errors:
1. Verify `wrangler.toml` has correct database ID
2. Check D1 binding is configured in Cloudflare Pages
3. Ensure database was initialized with schema.sql

### Circuit Breaker Activated

If status checks are paused:
1. Wait for daily reset (midnight UTC)
2. Check rate limit counters in database
3. Consider upgrading to Cloudflare paid tier for production

### Missing Historical Data

If timeline shows no data:
1. Ensure health checks have run (check status_checks table)
2. Verify 30-day window hasn't purged all data
3. Check for errors in scheduled worker logs

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with conventional commit messages
4. Open a pull request

## Support

For issues or questions, please open an issue on GitHub.
