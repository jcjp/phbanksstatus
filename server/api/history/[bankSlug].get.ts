import { getHistoricalData } from '../../db/queries'
import { incrementCounter } from '../../utils/circuit-breaker'

/**
 * GET /api/history/:bankSlug
 * Returns 30-day historical status data for a specific bank
 */
export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB
  const bankSlug = getRouterParam(event, 'bankSlug')

  if (!db) {
    throw createError({
      statusCode: 500,
      message: 'Database not available'
    })
  }

  if (!bankSlug) {
    throw createError({
      statusCode: 400,
      message: 'Bank slug is required'
    })
  }

  try {
    const history = await getHistoricalData(db, bankSlug)

    // Increment counters
    await incrementCounter(db, 'd1_reads', 3) // Approximate read count
    await incrementCounter(db, 'worker_requests', 1)

    return {
      bankSlug,
      history
    }
  } catch (error: any) {
    console.error(`Error fetching history for ${bankSlug}:`, error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch historical data'
    })
  }
})
