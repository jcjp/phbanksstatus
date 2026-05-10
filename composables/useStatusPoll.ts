import type { Bank, CircuitBreakerStatus } from '~/types/status'

export function useStatusPoll(intervalMs: number = 60000) {
  const banks = ref<Bank[]>([])
  const circuitBreaker = ref<CircuitBreakerStatus>({
    isActive: false,
    d1ReadsCount: 0,
    workerRequestsCount: 0,
    d1ReadsLimit: 10000,
    workerRequestsLimit: 100000,
    resetAt: new Date().toISOString()
  })
  const lastUpdate = ref<string>(new Date().toISOString())
  const loading = ref<boolean>(true)
  const error = ref<string | null>(null)

  let intervalId: NodeJS.Timeout | null = null

  async function fetchStatus() {
    try {
      const response = await $fetch('/api/status')
      banks.value = response.banks
      circuitBreaker.value = response.circuitBreaker
      lastUpdate.value = new Date().toISOString()
      error.value = null
    } catch (err: any) {
      console.error('Failed to fetch status:', err)
      error.value = err.message || 'Failed to fetch status'
    } finally {
      loading.value = false
    }
  }

  function startPolling() {
    // Fetch immediately
    fetchStatus()

    // Set up interval
    intervalId = setInterval(() => {
      fetchStatus()
    }, intervalMs)
  }

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Auto-start on mount, cleanup on unmount
  onMounted(() => {
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    banks: readonly(banks),
    circuitBreaker: readonly(circuitBreaker),
    lastUpdate: readonly(lastUpdate),
    loading: readonly(loading),
    error: readonly(error),
    refresh: fetchStatus
  }
}
