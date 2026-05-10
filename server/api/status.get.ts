import { getCurrentStatus } from '../db/queries'
import { checkCircuitBreaker, incrementCounter } from '../utils/circuit-breaker'

/**
 * GET /api/status
 * Returns current status for all banks
 */
export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    throw createError({
      statusCode: 500,
      message: 'Database not available'
    })
  }

  try {
    // Check circuit breaker status
    const circuitStatus = await checkCircuitBreaker(db)

    // Get current status even if circuit breaker is active (return stale data)
    const banks = await getCurrentStatus(db)

    // Increment counters
    await incrementCounter(db, 'd1_reads', 5) // Approximate read count
    await incrementCounter(db, 'worker_requests', 1)

    return {
      banks,
      circuitBreaker: circuitStatus
    }
  } catch (error: any) {
    console.error('Error fetching status:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch bank status'
    })
  }
})
