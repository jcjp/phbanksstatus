# Quick Start: Philippine Bank Status Monitor

## Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account (free tier)
- Wrangler CLI: `npm install -g wrangler`

## Local Development Setup

1. **Clone and install**:
   ```bash
   git clone <repo-url>
   cd phbanksstatus
   npm install
   ```

2. **Configure Cloudflare D1 (local)**:
   ```bash
   wrangler d1 create phbanksstatus-local
   # Copy database_id from output to wrangler.toml

   wrangler d1 execute phbanksstatus-local --file=server/db/schema.sql
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your D1 database ID
   ```

4. **Start development server**:
   ```bash
   npm run dev
   # Opens at http://localhost:3000
   ```

5. **Run health check manually** (optional):
   ```bash
   wrangler dev server/scheduled/check-banks.ts
   ```

## Running Tests

```bash
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run test         # All tests
```

## Production Deployment

```bash
wrangler d1 create phbanksstatus
wrangler d1 execute phbanksstatus --file=server/db/schema.sql
npm run build
wrangler pages publish dist
# Configure Scheduled Worker in Cloudflare dashboard
```

## Project Structure

- `server/` - Cloudflare Workers backend
- `pages/` - Nuxt pages (frontend)
- `components/` - Vue components
- `tests/` - Unit and E2E tests
