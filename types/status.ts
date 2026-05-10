export type ServiceType = 'website' | 'mobile_api' | 'internet_banking' | 'third_party_api'

export type ServiceStatus = 'up' | 'down' | 'maintenance'

export type BankStatus = 'up' | 'degraded' | 'down' | 'maintenance'

export interface Bank {
  id: number
  slug: string
  name: string
  status: BankStatus
  lastChecked: string
  endpoints: EndpointStatus[]
}

export interface Endpoint {
  id: number
  bankId: number
  serviceType: ServiceType
  url: string
}

export interface EndpointStatus extends Endpoint {
  status: ServiceStatus
  httpCode?: number
  responseTimeMs?: number
  errorMessage?: string
  lastChecked: string
}

export interface StatusCheckResult {
  endpointId: number
  status: ServiceStatus
  httpCode?: number
  responseTimeMs?: number
  errorMessage?: string
  checkedAt: string
}

export interface StatusHistoryRecord {
  timestamp: string
  status: BankStatus
  affectedServices?: ServiceType[]
}

export interface CircuitBreakerStatus {
  isActive: boolean
  d1ReadsCount: number
  workerRequestsCount: number
  d1ReadsLimit: number
  workerRequestsLimit: number
  resetAt: string
}
