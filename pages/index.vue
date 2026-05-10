<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="max-w-5xl mx-auto px-6 py-8">
      <!-- Header with Flag -->
      <div class="flex items-center gap-3 mb-8">
        <!-- <span class="text-5xl"></span> -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Philippine Bank Status
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Real-time monitoring of major banks
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-gray-400" />
      </div>

      <!-- Error -->
      <UAlert
        v-else-if="error"
        color="error"
        icon="i-heroicons-exclamation-circle"
        :title="error"
      />

      <template v-else>
        <!-- Overall Status -->
        <div :class="statusBannerClass" class="rounded px-4 py-3 mb-6 flex items-center gap-2">
          <UIcon :name="statusIcon" class="text-xl" />
          <span class="font-semibold">{{ statusMessage }}</span>
        </div>

        <!-- Bank Status Cards with 30-day Uptime -->
        <div class="space-y-3">
          <UCard
            v-for="bank in banksWithHistory"
            :key="bank.id"
          >
            <template #header>
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ bank.name }}</h3>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ bank.endpoints.map((e: any) => formatServiceType(e.serviceType)).join(' • ') }}
                  </p>
                </div>
                <UBadge :color="getBadgeColor(bank.status)" size="sm">
                  {{ bank.status === 'up' ? 'Operational' : bank.status }}
                </UBadge>
              </div>
            </template>

            <!-- 30-day uptime bars -->
            <UptimeBars :days="bank.historyDays" />
          </UCard>
        </div>

        <!-- BPI Official System Status (detailed) -->
        <div class="mt-8">
          <BPIOfficialStatus />
        </div>

        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500">
          <p>Checks every 30 minutes • Updated {{ formatTimestamp(lastUpdate) }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bank, ServiceType } from '~/types/status'

interface DayStatus {
  date: string
  status: 'up' | 'degraded' | 'down' | 'unknown'
}

interface BankWithHistory {
  id: number
  slug: string
  name: string
  status: string
  lastChecked: string
  endpoints: readonly any[]
  historyDays: DayStatus[]
}

const { banks, circuitBreaker, lastUpdate, loading, error } = useStatusPoll(60000)

const banksWithHistory = ref<BankWithHistory[]>([])
const loadingHistory = ref(true)

// Fetch all bank histories on mount
onMounted(async () => {
  loadingHistory.value = true
  const promises = banks.value.map(async (bank) => {
    try {
      const response = await $fetch(`/api/history/${bank.slug}`)
      return {
        ...bank,
        historyDays: generateDayStatuses(response.history || [])
      }
    } catch {
      return {
        ...bank,
        historyDays: generateEmptyDays()
      }
    }
  })

  banksWithHistory.value = await Promise.all(promises)
  loadingHistory.value = false
})

// Watch banks and update history when banks change
watch(banks, async (newBanks) => {
  if (newBanks.length > 0 && banksWithHistory.value.length === 0) {
    const promises = newBanks.map(async (bank) => {
      try {
        const response = await $fetch(`/api/history/${bank.slug}`)
        return {
          ...bank,
          historyDays: generateDayStatuses(response.history || [])
        }
      } catch {
        return {
          ...bank,
          historyDays: generateEmptyDays()
        }
      }
    })

    banksWithHistory.value = await Promise.all(promises)
  }
})

const issueCount = computed(() => {
  return banks.value.filter(b => b.status !== 'up').length
})

const statusMessage = computed(() => {
  if (issueCount.value === 0) return 'All Systems Operational'
  if (issueCount.value === 1) return 'Partial System Outage'
  return 'Service Disruption'
})

const statusIcon = computed(() => {
  if (issueCount.value === 0) return 'i-heroicons-check-circle'
  return 'i-heroicons-exclamation-circle'
})

const statusBannerClass = computed(() => {
  if (issueCount.value === 0) {
    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  }
  return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
})

function getBadgeColor(status: string) {
  switch (status) {
    case 'up': return 'success'
    case 'degraded': return 'warning'
    case 'down': return 'error'
    default: return 'neutral'
  }
}

function formatServiceType(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    website: 'Website',
    mobile_api: 'Mobile',
    internet_banking: 'Banking',
    third_party_api: 'API'
  }
  return labels[type] || type
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours}h ago`
}

function generateDayStatuses(history: any[]): DayStatus[] {
  const days: DayStatus[] = []
  const now = new Date()

  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]!

    // Find status for this day from history
    const dayData = history.find(h => h.date === dateStr)

    days.push({
      date: dateStr,
      status: dayData?.status || 'unknown'
    })
  }

  return days
}

function generateEmptyDays(): DayStatus[] {
  const days: DayStatus[] = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    days.push({
      date: date.toISOString().split('T')[0]!,
      status: 'unknown'
    })
  }

  return days
}

useHead({
  title: 'Philippine Bank Status',
  meta: [
    { name: 'description', content: 'Real-time monitoring of Philippine banks' }
  ]
})
</script>
