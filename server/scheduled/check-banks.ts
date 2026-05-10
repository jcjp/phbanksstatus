import type { D1Database } from '@cloudflare/workers-types'
import type { Endpoint, StatusCheckResult, ServiceStatus } from '~/types/status'
import { insertCheckResult, purgeOldRecords } from '../db/queries'
import { checkCircuitBreaker, incrementCounter } from '../utils/circuit-breaker'

interface HealthCheckOptions {
  timeout: number
  retryOnce: boolean
}

const DEFAULT_OPTIONS: HealthCheckOptions = {
  timeout: 10000, // 10 seconds
  retryOnce: true
}

/**
 * Scheduled worker to check bank service health
 * Runs every 30 minutes via Cloudflare Cron Trigger
 */
export default {
  async scheduled(event: any, env: { DB: D1Database }, ctx: any) {
    const db = env.DB

    try {
      // Check circuit breaker before proceeding
      const circuitStatus = await checkCircuitBreaker(db)
      if (circuitStatus.isActive) {
        console.log('Circuit breaker active - skipping health checks')
        return
      }

      // Get all endpoints to check
      const endpoints = await getAllEndpoints(db)

      // Perform health checks for all endpoints
      const checkResults: StatusCheckResult[] = []
      for (const endpoint of endpoints) {
        const result = await performHealthCheck(endpoint)
        checkResults.push(result)
      }

      // Store results in database
      for (const result of checkResults) {
        await insertCheckResult(db, result)
      }

      // Increment D1 reads counter (approximate: 1 read per endpoint + overhead)
      await incrementCounter(db, 'd1_reads', endpoints.length + 10)

      // Purge old records (30+ days old)
      const purgedCount = await purgeOldRecords(db)
      if (purgedCount > 0) {
        console.log(`Purged ${purgedCount} old status check records`)
      }

      console.log(`Completed health checks for ${endpoints.length} endpoints`)
    } catch (error) {
      console.error('Health check worker error:', error)
      throw error
    }
  }
}

/**
 * Get all endpoints from database
 */
async function getAllEndpoints(db: D1Database): Promise<Endpoint[]> {
  const result = await db
    .prepare('SELECT id, bank_id, service_type, url FROM endpoints')
    .all()

  return (result.results || []).map((row: any) => ({
    id: row.id,
    bankId: row.bank_id,
    serviceType: row.service_type,
    url: row.url
  }))
}

/**
 * Perform health check on a single endpoint
 */
async function performHealthCheck(
  endpoint: Endpoint,
  options: HealthCheckOptions = DEFAULT_OPTIONS
): Promise<StatusCheckResult> {
  const startTime = Date.now()
  let status: ServiceStatus = 'down'
  let httpCode: number | undefined
  let errorMessage: string | undefined

  try {
    // Attempt HTTP request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout)

    try {
      const response = await fetch(endpoint.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'PHBankStatus/1.0 (Health Monitoring Service)'
        }
      })

      clearTimeout(timeoutId)
      httpCode = response.status

      // Check for maintenance mode
      if (response.status === 503) {
        const body = await response.text()
        if (isMaintenancePage(body)) {
          status = 'maintenance'
        } else {
          status = 'down'
          errorMessage = 'Service Unavailable (503)'
        }
      } else if (response.ok) {
        status = 'up'
      } else {
        status = 'down'
        errorMessage = `HTTP ${response.status}`
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      // Handle timeout
      if (fetchError.name === 'AbortError') {
        if (options.retryOnce) {
          // Retry once
          console.log(`Timeout for ${endpoint.url}, retrying...`)
          return performHealthCheck(endpoint, { ...options, retryOnce: false })
        } else {
          status = 'down'
          errorMessage = 'Connection timeout'
        }
      }
      // Handle DNS/connection errors
      else if (fetchError.message?.includes('ENOTFOUND') || fetchError.message?.includes('DNS')) {
        status = 'down'
        errorMessage = 'DNS failure'
      } else if (fetchError.message?.includes('ECONNREFUSED') || fetchError.message?.includes('ETIMEDOUT')) {
        status = 'down'
        errorMessage = 'Connection refused'
      } else {
        status = 'down'
        errorMessage = fetchError.message || 'Unknown error'
      }
    }
  } catch (error: any) {
    status = 'down'
    errorMessage = error.message || 'Unknown error'
  }

  const responseTimeMs = Date.now() - startTime

  return {
    endpointId: endpoint.id,
    status,
    httpCode,
    responseTimeMs,
    errorMessage,
    checkedAt: new Date().toISOString()
  }
}

/**
 * Detect if HTML response indicates maintenance mode
 */
function isMaintenancePage(html: string): boolean {
  const maintenanceKeywords = [
    'maintenance',
    'scheduled downtime',
    'temporarily unavailable',
    'under maintenance',
    'system upgrade'
  ]

  const lowerHtml = html.toLowerCase()
  return maintenanceKeywords.some(keyword => lowerHtml.includes(keyword))
}
