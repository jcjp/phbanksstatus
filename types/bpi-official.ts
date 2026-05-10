export type BPISystemStatus = 'Operational' | 'Degraded' | 'Reduced Availability' | 'Temporarily Unavailable' | 'Unknown'

export interface BPISystem {
  id: number
  name: string
  displayName: string
  status: BPISystemStatus
  description: string
}

export interface BPIOfficialStatusResponse {
  systems: BPISystem[]
  lastUpdated: string
  error?: string
}
