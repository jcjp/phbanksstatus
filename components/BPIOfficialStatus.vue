<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <span>🏦</span>
      BPI Official System Status
    </h2>

    <div v-if="loading" class="text-center py-8 text-gray-500 dark:text-gray-400">
      Loading...
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-else-if="data?.systems.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      No systems data available
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <UCard
          v-for="system in data?.systems"
          :key="system.id"
        >
          <template #header>
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ system.displayName }}
                </h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {{ getSystemType(system.name) }}
                </p>
              </div>
              <UBadge :color="getStatusBadgeColor(system.status)" size="sm">
                {{ formatStatus(system.status) }}
              </UBadge>
            </div>
          </template>

          <div class="text-sm text-gray-600 dark:text-gray-300">
            {{ system.description }}
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BPIOfficialStatusResponse, BPISystemStatus } from '~/types/bpi-official'

const { data, error, pending: loading, refresh } = await useFetch<BPIOfficialStatusResponse>('/api/bpi-official')

// Auto-refresh every 2 minutes
const refreshInterval = setInterval(() => {
  refresh()
}, 120000)

onUnmounted(() => {
  clearInterval(refreshInterval)
})

function getStatusBadgeColor(status: BPISystemStatus): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'Operational':
      return 'success'
    case 'Degraded':
    case 'Reduced Availability':
      return 'warning'
    case 'Temporarily Unavailable':
      return 'error'
    default:
      return 'neutral'
  }
}

function formatStatus(status: BPISystemStatus): string {
  if (status === 'Operational') return 'Operational'
  if (status === 'Reduced Availability') return 'Degraded'
  return status
}

function getSystemType(name: string): string {
  const types: Record<string, string> = {
    'bpi-app': 'Mobile Banking',
    'bpi-online': 'Internet Banking',
    'vybe': 'Mobile Banking',
    'bpi-bizlink': 'Business Banking',
    'bpi-bizko': 'Business Banking',
    'bpi-trade': 'Investment Platform',
    'bpi-wealth': 'Wealth Management',
    'banko-mobile-app': 'Mobile Banking',
    'bpi-insti': 'Corporate Website'
  }
  return types[name] || 'Banking Service'
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return 'N/A'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours}h ago`
}
</script>
