import type { D1Database } from '@cloudflare/workers-types'
import type { Bank, Endpoint, EndpointStatus, StatusCheckResult, StatusHistoryRecord, BankStatus, ServiceStatus } from '~/types/status'

/**
 * Get current status for all banks with their endpoints
 */
export async function getCurrentStatus(db: D1Database): Promise<Bank[]> {
  // Get all banks
  const banksResult = await db.prepare('SELECT id, slug, name FROM banks ORDER BY name').all()
  const banks = banksResult.results || []

  // Get all endpoints with their latest status
  const endpointsQuery = `
    SELECT
      e.id,
      e.bank_id,
      e.service_type,
      e.url,
      sc.status,
      sc.http_code,
      sc.response_time_ms,
      sc.error_message,
      sc.checked_at
    FROM endpoints e
    LEFT JOIN (
      SELECT endpoint_id, status, http_code, response_time_ms, error_message, checked_at
      FROM status_checks
      WHERE (endpoint_id, checked_at) IN (
        SELECT endpoint_id, MAX(checked_at)
        FROM status_checks
        GROUP BY endpoint_id
      )
    ) sc ON e.id = sc.endpoint_id
    ORDER BY e.bank_id, e.service_type
  `

  const endpointsResult = await db.prepare(endpointsQuery).all()
  const endpoints = endpointsResult.results || []

  // Group endpoints by bank and calculate bank status
  return banks.map((bank: any) => {
    const bankEndpoints = endpoints
      .filter((e: any) => e.bank_id === bank.id)
      .map((e: any) => ({
        id: e.id,
        bankId: e.bank_id,
        serviceType: e.service_type,
        url: e.url,
        status: (e.status || 'down') as ServiceStatus,
        httpCode: e.http_code,
        responseTimeMs: e.response_time_ms,
        errorMessage: e.error_message,
        lastChecked: e.checked_at || new Date().toISOString()
      })) as EndpointStatus[]

    // Calculate bank status based on endpoint failures
    const bankStatus = calculateBankStatus(bankEndpoints)
    const lastChecked = bankEndpoints.length > 0
      ? bankEndpoints[0].lastChecked
      : new Date().toISOString()

    return {
      id: bank.id,
      slug: bank.slug,
      name: bank.name,
      status: bankStatus,
      lastChecked,
      endpoints: bankEndpoints
    }
  })
}

/**
 * Get historical status data for a specific bank (30-day window)
 */
export async function getHistoricalData(
  db: D1Database,
  bankSlug: string
): Promise<StatusHistoryRecord[]> {
  const query = `
    SELECT
      sc.checked_at,
      e.service_type,
      sc.status
    FROM status_checks sc
    JOIN endpoints e ON sc.endpoint_id = e.id
    JOIN banks b ON e.bank_id = b.id
    WHERE b.slug = ?
      AND sc.checked_at >= datetime('now', '-30 days')
    ORDER BY sc.checked_at ASC
  `

  const result = await db.prepare(query).bind(bankSlug).all()
  const checks = result.results || []

  // Group by timestamp and calculate bank status at each point
  const timelineMap = new Map<string, any>()

  checks.forEach((check: any) => {
    const timestamp = check.checked_at
    if (!timelineMap.has(timestamp)) {
      timelineMap.set(timestamp, {
        timestamp,
        endpointStatuses: []
      })
    }
    timelineMap.get(timestamp)!.endpointStatuses.push({
      serviceType: check.service_type,
      status: check.status
    })
  })

  // Convert to array and calculate bank status for each point
  return Array.from(timelineMap.values()).map(point => {
    const endpoints = point.endpointStatuses
    const downCount = endpoints.filter((e: any) => e.status === 'down').length
    const maintenanceCount = endpoints.filter((e: any) => e.status === 'maintenance').length
    const affectedServices = endpoints
      .filter((e: any) => e.status !== 'up')
      .map((e: any) => e.serviceType)

    let status: BankStatus
    if (maintenanceCount > 0) {
      status = 'maintenance'
    } else if (downCount === endpoints.length) {
      status = 'down'
    } else if (downCount >= 1 && downCount <= 3) {
      status = 'degraded'
    } else {
      status = 'up'
    }

    return {
      timestamp: point.timestamp,
      status,
      affectedServices: affectedServices.length > 0 ? affectedServices : undefined
    }
  })
}

/**
 * Insert a status check result
 */
export async function insertCheckResult(
  db: D1Database,
  result: StatusCheckResult
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO status_checks
       (endpoint_id, status, http_code, response_time_ms, error_message, checked_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      result.endpointId,
      result.status,
      result.httpCode || null,
      result.responseTimeMs || null,
      result.errorMessage || null,
      result.checkedAt
    )
    .run()
}

/**
 * Purge old records (older than 30 days)
 */
export async function purgeOldRecords(db: D1Database): Promise<number> {
  const result = await db
    .prepare(`DELETE FROM status_checks WHERE checked_at < datetime('now', '-30 days')`)
    .run()

  return result.meta?.changes || 0
}

/**
 * Calculate bank status based on endpoint statuses
 * - All endpoints up = 'up'
 * - 1-3 endpoints down = 'degraded'
 * - All 4 endpoints down = 'down'
 * - Any endpoint in maintenance = 'maintenance'
 */
function calculateBankStatus(endpoints: EndpointStatus[]): BankStatus {
  if (endpoints.length === 0) return 'down'

  const maintenanceCount = endpoints.filter(e => e.status === 'maintenance').length
  const downCount = endpoints.filter(e => e.status === 'down').length
  const totalCount = endpoints.length

  // Maintenance takes precedence
  if (maintenanceCount > 0) {
    return 'maintenance'
  }

  // All endpoints down
  if (downCount === totalCount) {
    return 'down'
  }

  // 1-3 endpoints down
  if (downCount >= 1 && downCount <= 3) {
    return 'degraded'
  }

  // All up
  return 'up'
}
