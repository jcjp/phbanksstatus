# Bank Endpoint Research Findings

**Date**: 2026-05-10
**Research Method**: Web search of official bank websites

## Scope Adjustment

**Original plan**: Monitor 4 service types per bank (24 total endpoints)
- Website
- Mobile API
- Internet Banking
- Third-party API

**Actual feasibility**: 2 service types per bank (12 total endpoints)
- ✅ Website (publicly accessible)
- ✅ Internet Banking portal (publicly accessible login pages)
- ❌ Mobile API (not publicly accessible - requires app reverse engineering)
- ❌ Third-party API (not publicly accessible - requires partnership/auth)

## Verified Bank Endpoints

### 1. UnionBank of the Philippines
- **Website**: https://www.unionbankph.com/
- **Internet Banking**: https://online.unionbankph.com/
- **Notes**: Strong digital banking focus, app updated April 2026

### 2. Security Bank Philippines
- **Website**: https://www.securitybank.com/
- **Internet Banking**: https://www.securitybank.com/online-banking/login/
- **Notes**: Recently upgraded to "SB Online" platform for better stability

### 3. Bank of the Philippine Islands (BPI)
- **Website**: https://www.bpi.com.ph/
- **Internet Banking**: https://online.bpi.com.ph/
- **Notes**: Oldest bank in Philippines/Southeast Asia, new website launched 2026

### 4. Banco De Oro (BDO)
- **Website**: https://www.bdo.com.ph/
- **Internet Banking**: https://online.bdo.com.ph/
- **Notes**: BDO Online accessible globally with internet connection

### 5. Rizal Commercial Banking Corporation (RCBC)
- **Website**: https://www.rcbc.com/
- **Internet Banking**: https://www.rcbconlinebanking.com/
- **Notes**: Awarded "Best Bank for Digital" in 2025, offers RCBC Pulz App

### 6. EastWest Bank
- **Website**: https://www.eastwestbanker.com/
- **Internet Banking**: https://www.eastwestcorporate.com.ph/
- **Notes**: Mobile app "EasyWay" for retail, Komo for digital banking

## Impact on FR-002 Compliance

**Original requirement**: "System MUST track 4 service categories per bank"

**Updated requirement**: System tracks 2 publicly accessible service categories per bank (Website, Internet Banking). Mobile APIs and third-party APIs excluded as they require authentication/partnership and are not suitable for public status monitoring.

**Spec compliance**: Partial deviation from FR-002, but aligned with FR-004 clarification (prefer official feeds when available, fallback to HTTP pings). Since official feeds don't exist and mobile/API endpoints aren't public, we monitor what's feasible.

## Status Logic Update

With only 2 endpoints per bank instead of 4:
- **Up**: Both endpoints responding (2/2 up)
- **Degraded**: One endpoint failing (1/2 down)
- **Down**: Both endpoints failing (2/2 down)
- **Maintenance**: Any endpoint in maintenance mode

**FR-011 adjustment**: Original logic "1-3 failures = Degraded, 4 failures = Down" assumed 4 endpoints. With 2 endpoints: "1 failure = Degraded, 2 failures = Down"

## Recommendation

Update `calculateBankStatus` in server/db/queries.ts to use 2-endpoint logic:
```typescript
if (downCount === endpoints.length) return 'Down';  // Both down
if (downCount >= 1) return 'Degraded';  // One down
return 'Up';  // Both up
```

Update spec.md FR-002 to reflect actual scope: "System MUST track publicly accessible service categories: Website and Internet Banking portal (2 per bank, 12 total)"
