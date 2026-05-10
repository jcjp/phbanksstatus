import type { D1Database } from '@cloudflare/workers-types'
import type { CircuitBreakerStatus } from '~/types/status'

// Cloudflare free tier limits
const D1_READS_LIMIT = 10000 // per day
const WORKER_REQUESTS_LIMIT = 100000 // per day

// Circuit breaker threshold (96%)
const CIRCUIT_BREAKER_THRESHOLD = 0.96

/**
 * Check if circuit breaker should activate
 * Returns true if rate limits are approaching threshold (96% of capacity)
 */
export async function checkCircuitBreaker(db: D1Database): Promise<CircuitBreakerStatus> {
  const now = new Date()
  const today = now.toISOString().split('T')[0] // YYYY-MM-DD

  // Get or create counters for today
  const d1Counter = await getOrCreateCounter(db, 'd1_reads', today)
  const workerCounter = await getOrCreateCounter(db, 'worker_requests', today)

  const d1Threshold = D1_READS_LIMIT * CIRCUIT_BREAKER_THRESHOLD
  const workerThreshold = WORKER_REQUESTS_LIMIT * CIRCUIT_BREAKER_THRESHOLD

  const isActive = d1Counter.count >= d1Threshold || workerCounter.count >= workerThreshold

  return {
    isActive,
    d1ReadsCount: d1Counter.count,
    workerRequestsCount: workerCounter.count,
    d1ReadsLimit: D1_READS_LIMIT,
    workerRequestsLimit: WORKER_REQUESTS_LIMIT,
    resetAt: d1Counter.resetAt
  }
}

/**
 * Increment rate limit counter
 */
export async function incrementCounter(
  db: D1Database,
  counterType: 'd1_reads' | 'worker_requests',
  amount: number = 1
): Promise<void> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  await db
    .prepare(
      `UPDATE rate_limit_counters
       SET count = count + ?, updated_at = CURRENT_TIMESTAMP
       WHERE counter_type = ? AND reset_at >= ?`
    )
    .bind(amount, counterType, today)
    .run()
}

/**
 * Get or create a rate limit counter for today
 */
async function getOrCreateCounter(
  db: D1Database,
  counterType: string,
  today: string
): Promise<{ count: number; resetAt: string }> {
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const resetAt = tomorrow.toISOString().split('T')[0]

  // Try to get existing counter
  const existing = await db
    .prepare(
      `SELECT count, reset_at FROM rate_limit_counters
       WHERE counter_type = ? AND reset_at >= ?`
    )
    .bind(counterType, today)
    .first()

  if (existing) {
    return {
      count: existing.count as number,
      resetAt: existing.reset_at as string
    }
  }

  // Create new counter
  await db
    .prepare(
      `INSERT INTO rate_limit_counters (counter_type, count, reset_at)
       VALUES (?, 0, ?)`
    )
    .bind(counterType, resetAt)
    .run()

  return { count: 0, resetAt }
}
