import type { BPIOfficialStatusResponse, BPISystem } from '~/types/bpi-official'

// Mock data for development when SSL cert fails
const mockSystems: BPISystem[] = [
  {
    id: 1,
    name: 'bpi-app',
    displayName: 'BPI Mobile App',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  },
  {
    id: 2,
    name: 'bpi-online',
    displayName: 'BPI Online',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  },
  {
    id: 3,
    name: 'vybe',
    displayName: 'VYBE by BPI',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  },
  {
    id: 4,
    name: 'bpi-bizlink',
    displayName: 'BPI Bizlink',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  },
  {
    id: 5,
    name: 'bpi-bizko',
    displayName: 'BPI BizKo',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  },
  {
    id: 6,
    name: 'bpi-trade',
    displayName: 'BPI Trade',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  },
  {
    id: 7,
    name: 'bpi-wealth',
    displayName: 'BPI Wealth',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  },
  {
    id: 8,
    name: 'banko-mobile-app',
    displayName: 'BanKo Mobile App',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  },
  {
    id: 9,
    name: 'bpi-insti',
    displayName: 'BPI Institutional Website',
    status: 'Operational',
    description: 'The system is performing as expected with no known issues. All functionalities are working without disruptions.'
  }
]

/**
 * GET /api/bpi-official
 * Fetches real-time status from BPI's official status page
 */
export default defineEventHandler(async (): Promise<BPIOfficialStatusResponse> => {
  try {
    // Fetch BPI systems data
    // Note: BPI's API has self-signed cert issues in dev, but works in Cloudflare Workers
    const systems = await $fetch<BPISystem[]>('https://system-status.bpi.com.ph/api/systems', {
      headers: {
        'User-Agent': 'PH-Bank-Status-Monitor/1.0'
      }
    })

    return {
      systems: systems || [],
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching BPI official status:', error)

    // Return error status instead of misleading mock data
    const errorSystems: BPISystem[] = mockSystems.map(system => ({
      ...system,
      status: 'Unknown',
      description: 'Unable to fetch current status from BPI API'
    }))

    return {
      systems: errorSystems,
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch BPI status data'
    }
  }
})
