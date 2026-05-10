<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Philippine Bank Status Monitor
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Real-time monitoring of major Philippine banks' digital services
        </p>
      </div>

      <!-- Circuit Breaker Banner -->
      <CircuitBreakerBanner
        v-if="circuitBreaker.isActive"
        :circuit-breaker="circuitBreaker"
        :last-update="lastUpdate"
        class="mb-6"
      />

      <!-- Summary Indicator -->
      <div class="mb-6">
        <UAlert
          :color="summaryColor"
          :icon="summaryIcon"
          :title="summaryMessage"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        color="red"
        icon="i-heroicons-exclamation-circle"
        :title="error"
        class="mb-6"
      />

      <!-- Bank Status Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="bank in banks" :key="bank.id" class="relative">
          <BankStatusCard
            :bank="bank"
            class="cursor-pointer hover:shadow-lg transition-shadow"
            @click="toggleHistory(bank.slug)"
          />

          <!-- Historical View (Expanded) -->
          <div
            v-if="expandedBank === bank.slug"
            class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">30-Day History</h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                @click="expandedBank = null"
              />
            </div>

            <div v-if="loadingHistory" class="flex justify-center py-8">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
            </div>

            <div v-else-if="historyError" class="text-red-500 text-sm">
              {{ historyError }}
            </div>

            <StatusTimeline
              v-else-if="historyData.length > 0"
              :bank-slug="bank.slug"
              :history="historyData"
            />

            <div v-else class="text-gray-500 text-sm text-center py-8">
              No historical data available
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Status checks run every 30 minutes. Dashboard auto-refreshes every minute.</p>
        <p class="mt-2">Last updated: {{ formatTimestamp(lastUpdate) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StatusHistoryRecord } from '~/types/status'

const { banks, circuitBreaker, lastUpdate, loading, error } = useStatusPoll(60000)

const expandedBank = ref<string | null>(null)
const historyData = ref<StatusHistoryRecord[]>([])
const loadingHistory = ref(false)
const historyError = ref<string | null>(null)

const summaryMessage = computed(() => {
  if (loading.value) return 'Loading...'
  if (error.value) return 'Error loading status'

  const issueCount = banks.value.filter(b =>
    b.status === 'down' || b.status === 'degraded'
  ).length

  if (issueCount === 0) {
    return 'All banks operational'
  } else if (issueCount === 1) {
    return '1 bank experiencing issues'
  } else {
    return `${issueCount} banks experiencing issues`
  }
})

const summaryColor = computed(() => {
  if (loading.value || error.value) return 'gray'

  const issueCount = banks.value.filter(b =>
    b.status === 'down' || b.status === 'degraded'
  ).length

  if (issueCount === 0) return 'green'
  if (issueCount <= 2) return 'yellow'
  return 'red'
})

const summaryIcon = computed(() => {
  if (loading.value) return 'i-heroicons-arrow-path'
  if (error.value) return 'i-heroicons-exclamation-circle'

  const issueCount = banks.value.filter(b =>
    b.status === 'down' || b.status === 'degraded'
  ).length

  if (issueCount === 0) return 'i-heroicons-check-circle'
  if (issueCount <= 2) return 'i-heroicons-exclamation-triangle'
  return 'i-heroicons-x-circle'
})

async function toggleHistory(bankSlug: string) {
  if (expandedBank.value === bankSlug) {
    expandedBank.value = null
    return
  }

  expandedBank.value = bankSlug
  loadingHistory.value = true
  historyError.value = null

  try {
    const response = await $fetch(`/api/history/${bankSlug}`)
    historyData.value = response.history
  } catch (err: any) {
    console.error('Failed to fetch history:', err)
    historyError.value = 'Failed to load historical data'
  } finally {
    loadingHistory.value = false
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

useHead({
  title: 'Philippine Bank Status Monitor',
  meta: [
    {
      name: 'description',
      content: 'Real-time monitoring dashboard for major Philippine banks digital services'
    }
  ]
})
</script>
