import { getHistoricalData } from '../../db/queries'
import { incrementCounter } from '../../utils/circuit-breaker'

/**
 * GET /api/history/:bankSlug
 * Returns 30-day historical status data for a specific bank
 */
export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB
  const bankSlug = getRouterParam(event, 'bankSlug')

  if (!bankSlug) {
    throw createError({
      statusCode: 400,
      message: 'Bank slug is required'
    })
  }

  // Use mock data in development when DB is not available
  if (!db) {
    return {
      bankSlug,
      history: generateMockHistory(bankSlug)
    }
  }

  try {
    const history = await getHistoricalData(db, bankSlug)

    // Increment counters
    await incrementCounter(db, 'd1_reads', 3)
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

function generateMockHistory(bankSlug: string) {
  const history = []
  const now = new Date()

  // Generate 30 days of mock data (all up)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    history.push({
      date: dateStr,
      status: 'up'
    })
  }

  return history
}
