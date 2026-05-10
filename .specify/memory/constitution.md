<!--
Sync Impact Report - Constitution Update
Version: 0.0.0 → 1.0.0
Rationale: Initial constitution ratification for Philippine Bank Status Monitor project

Modified Principles: N/A (initial version)
Added Sections:
  - Core Principles (5 principles defined)
  - Quality Standards
  - Development Workflow
  - Governance

Removed Sections: N/A

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - verified Constitution Check section exists
  ✅ .specify/templates/spec-template.md - verified requirements alignment
  ✅ .specify/templates/tasks-template.md - verified task categorization aligns
  ⚠ CLAUDE.md - references incorrect path (specs/002 vs 001), manual fix recommended

Follow-up TODOs: None
-->

# Philippine Bank Status Monitor Constitution

## Core Principles

### I. Reliability First (NON-NEGOTIABLE)

The monitoring system MUST be more reliable than the services it monitors. System downtime or inaccuracy undermines user trust and defeats the core purpose.

**Requirements**:
- Circuit breaker MUST halt checks at 96% of Cloudflare limits (4% safety buffer)
- Health check timeouts MUST be configurable with retry logic
- Stale data MUST be clearly marked with last-updated timestamps
- System MUST gracefully degrade when rate-limited (display last known status)

**Rationale**: Users rely on this dashboard during bank outages. If the dashboard itself is unreliable, users cannot distinguish between actual bank issues and monitoring system failures.

### II. Observability (NON-NEGOTIABLE)

All health checks, status changes, failures, and rate limit events MUST be logged with structured data. System behavior MUST be traceable and debuggable.

**Requirements**:
- Every health check MUST record: timestamp, endpoint, HTTP code, response time, status result
- Rate limit counters MUST be tracked and persisted (D1 database)
- Circuit breaker state changes MUST be logged
- Errors MUST include context (endpoint URL, retry attempt, timeout value)

**Rationale**: Troubleshooting false positives/negatives requires detailed audit trails. Users may dispute status accuracy - logs provide evidence.

### III. Test-Driven Development (NON-NEGOTIABLE)

All features MUST follow Red-Green-Refactor: write failing tests → implement to pass → refactor. Test coverage MUST be maintained at 80%+.

**Requirements**:
- Unit tests for: status calculation logic, circuit breaker thresholds, database queries
- Integration tests for: API endpoints, D1 database operations, scheduled worker execution
- E2E tests for: dashboard loading, status display, historical chart rendering
- Tests MUST run in CI before merge

**Rationale**: Monitoring logic is brittle (edge cases: timeouts, maintenance detection, threshold calculations). Tests catch regressions before they reach production.

### IV. Cost Efficiency

System MUST operate within Cloudflare free tier limits. Architectural decisions MUST prioritize free-tier sustainability over features.

**Requirements**:
- D1 reads: <10,000/day (circuit breaker enforces this)
- Worker requests: <100,000/day (circuit breaker enforces this)
- Cron frequency: 30 minutes minimum (reduces Worker invocations)
- Historical data retention: 30 days maximum (keeps D1 storage minimal)

**Rationale**: Project sustainability depends on zero infrastructure cost. Exceeding free tier would require paid plans or service shutdown.

### V. Data Accuracy & Transparency

Status data MUST be timely, accurate, and transparent about its freshness and confidence level.

**Requirements**:
- Timestamps MUST be displayed in user's local timezone
- Stale data warnings MUST appear when data is >60 minutes old
- Maintenance status MUST be distinguished from failures
- Error states MUST explain why status is unknown (timeout vs HTTP error vs rate limit)

**Rationale**: Misleading status information is worse than no information. Users make financial decisions (branch visit vs online banking) based on this data.

## Quality Standards

### Security

- No API keys, secrets, or credentials MUST be committed to git
- `wrangler.toml` MUST be git-ignored (template-based configuration)
- Rate limit counters MUST prevent abuse (public dashboard has no auth)
- CORS policies MUST be explicit (Cloudflare Workers security)

### Performance

- Dashboard load time: <2 seconds (SSR via Nuxt + Cloudflare Workers)
- Historical query time: <1 second (indexed D1 queries)
- Auto-refresh interval: 60 seconds (balance freshness vs Worker requests)
- Health check timeout: 10 seconds max (prevents Worker execution limit issues)

### Code Quality

- TypeScript strict mode MUST be enabled
- ESLint + Prettier MUST pass before commit
- No `any` types (use proper type definitions)
- Immutable data patterns (no in-place mutations)

## Development Workflow

### Feature Development

1. Specification → Clarification → Planning → Tasks (Speckit workflow)
2. Constitution compliance check MUST run before implementation
3. TDD cycle: Red (failing test) → Green (passing implementation) → Refactor
4. Code review MUST verify: test coverage, observability, cost impact

### Git Workflow

- Conventional Commits format: `type(scope): description`
- GPG-signed commits preferred
- Feature branches: `{number}-{feature-slug}` (e.g., `001-ph-bank-status`)
- PR merge requires: tests passing, constitution compliance, review approval

### Quality Gates

- Pre-commit: ESLint, Prettier, TypeScript type checking
- Pre-merge: Unit tests 80%+, integration tests passing, E2E tests passing
- Post-merge: Constitution compliance verification, cost impact review

## Governance

This constitution supersedes all other development practices. When guidance conflicts, the constitution takes precedence.

### Amendment Process

1. Propose amendment with rationale (GitHub issue or PR)
2. Document version bump type (MAJOR/MINOR/PATCH)
3. Update dependent templates (.specify/templates/*.md)
4. Get approval from project maintainers
5. Update constitution with new version and Last Amended date

### Versioning

- **MAJOR**: Backward-incompatible principle removals or redefinitions
- **MINOR**: New principles added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance

- All PRs MUST verify compliance against all 5 core principles
- Constitutional violations MUST be flagged in code review
- Intentional principle exemptions MUST be documented with justification

### Runtime Guidance

For agent-specific implementation guidance during development, refer to `CLAUDE.md` (or equivalent agent-specific files). The constitution defines *what* must be done; runtime guidance files explain *how* agents should approach implementation.

**Version**: 1.0.0 | **Ratified**: 2026-05-10 | **Last Amended**: 2026-05-10
