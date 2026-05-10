# Feature Specification: Philippine Bank Status Monitor

**Feature Branch**: `001-ph-bank-status`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "Philippine Bank Status Monitor - public dashboard for tracking operational status of major PH banks"

## Clarifications

### Session 2026-05-10

- Q: Should the system prefer official bank status feeds/APIs where available, or always use active health checks? → A: Prefer official feeds when available, fallback to active health checks
- Q: Retention period - 7 days, 14 days, or 30 days? → A: 30 days
- Q: How many endpoint failures trigger Degraded vs Down? → A: 1-3 endpoint failures = Degraded, all 4 endpoints failing = Down

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Bank Service Status (Priority: P1)

As a Philippine bank customer, I need to quickly check if my bank's digital services are currently operational so I can decide whether to attempt online transactions or visit a branch instead.

**Why this priority**: This is the core value proposition - users visit the dashboard specifically to answer "Is my bank's service working right now?" This standalone capability delivers immediate value.

**Independent Test**: Can be fully tested by loading the dashboard and verifying that all 6 banks show current status for their 4 service types (24 total status indicators), with correct state (Up/Degraded/Down/Maintenance) and last-checked timestamp.

**Acceptance Scenarios**:

1. **Given** I open the dashboard, **When** the page loads, **Then** I see the current status of all 6 banks displayed with clear visual indicators (color-coded status badges or icons)
2. **Given** I view the status dashboard, **When** one bank has all services up, **Then** the bank shows "Up" status
3. **Given** I view the status dashboard, **When** one bank has some services failing and some working, **Then** the bank shows "Degraded" status with details on which services are affected
4. **Given** I view the status dashboard, **When** one bank has all services down, **Then** the bank shows "Down" status
5. **Given** I view the status dashboard, **When** a bank is under scheduled maintenance, **Then** the bank shows "Maintenance" status
6. **Given** the dashboard is open, **When** service status changes (detected by the next automated check), **Then** the dashboard auto-refreshes to show the updated status without requiring manual reload

---

### User Story 2 - Review Historical Service Outages (Priority: P2)

As a bank customer, I want to see the history of service outages and degradations over the past 7-30 days so I can identify patterns (recurring issues, maintenance windows, peak problem times) and choose a more reliable bank for my needs.

**Why this priority**: Historical data provides context and helps users make informed decisions about which bank to trust. This builds on P1 by adding trend analysis capability.

**Independent Test**: Can be fully tested by viewing any bank's detail view and confirming that a timeline chart displays status changes over the configured retention period (7-30 days), showing incident duration, start/end times, and affected services.

**Acceptance Scenarios**:

1. **Given** I select a specific bank, **When** I view its status history, **Then** I see a timeline chart showing when services were Up/Degraded/Down/Maintenance over the past 30 days
2. **Given** I view the historical timeline, **When** an outage occurred, **Then** I can see the incident start time, duration, and end time
3. **Given** I view the historical timeline, **When** I hover over or click a specific incident, **Then** I see which specific services were affected (e.g., "Mobile API and Internet Banking were down")
4. **Given** I view the dashboard, **When** multiple banks experienced outages on the same day, **Then** I can compare their timelines to see which banks were more reliable

---

### User Story 3 - Monitor Multi-Bank Service Health at a Glance (Priority: P2)

As a user who banks with multiple institutions, I want to view all 6 major banks' statuses on a single page without clicking through multiple tabs or websites so I can quickly assess the overall health of Philippine banking digital infrastructure.

**Why this priority**: Aggregation is a key differentiator - users currently must visit 6 separate bank websites. This delivers immediate time-saving value.

**Independent Test**: Can be fully tested by loading the dashboard once and verifying that all 6 banks (UnionBank, Security Bank, BPI, BDO, RCBC, EastWest) are visible on the same page with their current statuses, without requiring navigation.

**Acceptance Scenarios**:

1. **Given** I open the dashboard, **When** the page loads, **Then** I see all 6 banks listed on a single page
2. **Given** I view the dashboard, **When** I scan the page, **Then** I can immediately identify which banks have issues without reading detailed text (visual indicators like red/yellow/green)
3. **Given** I view the dashboard, **When** no banks have issues, **Then** I see a summary indicator like "All banks operational"
4. **Given** I view the dashboard, **When** one or more banks have issues, **Then** I see a summary count like "2 banks experiencing issues"

---

### Edge Cases

- **What happens when a health check request times out?** System retries once with a 10-second timeout. If both attempts fail, the service is marked as "Down" with a note indicating "Connection timeout."
- **What happens when a bank's endpoint returns HTTP 503 (Service Unavailable)?** System checks for known maintenance page patterns. If detected, status is set to "Maintenance"; otherwise "Down."
- **What happens when only one out of four services is failing?** Bank status shows "Degraded" with a breakdown showing which specific service is affected.
- **What happens when the system reaches 96% of Cloudflare free tier limits?** Circuit breaker halts status checks and displays a warning banner: "Status checks paused due to rate limits. Displaying last known status from [timestamp]. Checks will resume at [reset time]."
- **What happens when a user visits the dashboard during a status check outage (no recent data)?** Dashboard displays the last known status with a timestamp and a warning: "Status data may be stale. Last updated: [timestamp]."
- **What happens when the database retention window expires (30 days)?** Older records are automatically purged during the next scheduled check to keep storage within limits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST monitor exactly 6 Philippine banks: UnionBank of the Philippines, Security Bank Philippines, Bank of the Philippines Island (BPI), Banco De Oro (BDO), Rizal Commercial Banking Corporation (RCBC), and EastWest Bank
- **FR-002**: System MUST track 4 service categories per bank: Website (main homepage), Mobile app API, Internet banking portal, and Third-party API integrations
- **FR-003**: System MUST classify each bank's overall status as one of four states: Up (all endpoints responding), Degraded (some endpoints failing), Down (all endpoints failing), or Maintenance (scheduled/announced maintenance)
- **FR-004**: System MUST perform automated status checks at 30-minute intervals. The system SHALL prefer official bank status feeds/APIs (publicly documented status APIs or RSS feeds provided by the banks) when available and fall back to active health checks (HTTP pings) for banks that do not provide official feeds
- **FR-005**: System MUST store historical status data for 30 days
- **FR-006**: System MUST display current status for all banks and endpoints on a single public dashboard page with no authentication required
- **FR-007**: System MUST display status change history as a timeline chart showing incident start time, duration, and affected services
- **FR-008**: Dashboard MUST auto-refresh when status changes using client-side polling at 60-second intervals
- **FR-009**: System MUST implement rate-limit protection with a circuit breaker that halts checks when 96% of service capacity is reached (calculated as: D1 reads >= 9,600/day OR Worker requests >= 96,000/day)
- **FR-010**: System MUST gracefully degrade when rate-limited by displaying the last known status with a timestamp and warning banner
- **FR-011**: System MUST determine bank status based on endpoint failure count: 1-3 endpoint failures result in "Degraded" status, all 4 endpoints failing results in "Down" status
- **FR-012**: System MUST implement retry logic: if a health check fails, retry once with a 10-second timeout before marking as Down
- **FR-013**: System MUST distinguish between DNS failure, connection timeout, and HTTP error responses when determining service status
- **FR-014**: System MUST detect maintenance mode by checking for HTTP 503 status codes and known maintenance page HTML patterns
- **FR-015**: System MUST provide a visual timeline chart for historical data using a lightweight charting library

### Key Entities

- **Bank**: Represents one of the 6 monitored Philippine banks. Attributes: bank name, overall status (computed from endpoint statuses), last check timestamp
- **Service Endpoint**: Represents one monitored service within a bank (Website, Mobile API, Internet Banking Portal, Third-party API). Attributes: service type, current status (Up/Down/Maintenance), last check timestamp, last failure reason
- **Status Check Result**: Represents the outcome of a single automated health check. Attributes: bank ID, service endpoint ID, timestamp, HTTP response code, response time, status determination (Up/Degraded/Down/Maintenance), failure reason (if any)
- **Status History Record**: Represents a historical snapshot of a bank's status. Attributes: bank ID, timestamp, overall status, affected services (for Degraded/Down states), incident duration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dashboard page loads in under 1 second for users with stable internet connections
- **SC-002**: Status updates are visible on the dashboard within 30 minutes of a service change (matching the check interval)
- **SC-003**: Historical data for the configured retention period (7-30 days) is accessible and displayed within 2 seconds of requesting a bank's timeline
- **SC-004**: Dashboard remains operational and displays cached data even when rate limits are reached, with clear user-facing warnings
- **SC-005**: Users can identify which banks have issues within 5 seconds of landing on the page (visual clarity metric)
- **SC-006**: System successfully monitors all 24 endpoints (6 banks × 4 services) every 30 minutes without exceeding platform resource limits under moderate traffic (up to 1000 page views/day)

## Assumptions

- **Target Users**: Philippine bank customers with stable internet connectivity who are comfortable using web-based dashboards
- **Scope Boundaries**: 
  - Mobile app support (native iOS/Android apps) is out of scope for v1 - web dashboard only
  - Admin interface for manually marking maintenance windows is out of scope for v1
  - User accounts, authentication, and personalization features are out of scope for v1
  - Email/SMS notifications for outages are out of scope for v1
- **Technology Stack**: The project will be deployed entirely on Cloudflare infrastructure (Workers, D1, Pages) as specified in the brainstorm decision
- **Data Source Strategy**: The system will prefer official bank status feeds/APIs when available and use active health checks (HTTP pings) as a fallback for banks without official feeds
- **Rate Limits**: The system is designed to operate within Cloudflare's free tier limits (10k D1 reads/day, 100k Worker requests/day). Production deployment may require a paid tier for higher traffic
- **Endpoint Discovery**: Bank endpoint URLs (for websites, mobile APIs, banking portals, and third-party APIs) will be manually researched and configured during implementation planning. The system assumes these URLs remain relatively stable. If mobile APIs or third-party integrations are not publicly accessible during research, scope will be adjusted to monitor only publicly available endpoints (website and banking portal)
- **Maintenance Detection**: Auto-detection of maintenance mode will rely on HTTP 503 status codes and basic HTML pattern matching (e.g., presence of keywords like "maintenance" or "scheduled downtime" in the response body). Manual configuration of scheduled maintenance windows is a future enhancement
- **Historical Data Retention**: Retention period is 30 days
- **Chart Rendering**: Timeline charts will use a lightweight, popular charting library suitable for web dashboards
- **Real-Time Updates**: Client-side polling (60-second intervals) will be used for dashboard auto-refresh unless server-push mechanisms prove feasible
- **Browser Support**: The dashboard targets modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions). Legacy browser support (IE11, old mobile browsers) is out of scope