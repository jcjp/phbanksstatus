<template>
  <UAlert
    v-if="circuitBreaker.isActive"
    color="orange"
    variant="soft"
    icon="i-heroicons-exclamation-triangle"
    title="Status checks paused due to rate limits"
  >
    <template #description>
      <div class="space-y-1">
        <p>Displaying last known status from {{ formatTimestamp(lastUpdate) }}.</p>
        <p>Checks will resume at {{ formatTimestamp(circuitBreaker.resetAt) }}.</p>
        <div class="mt-2 text-xs">
          <p>D1 reads: {{ circuitBreaker.d1ReadsCount.toLocaleString() }} / {{ circuitBreaker.d1ReadsLimit.toLocaleString() }}</p>
          <p>Worker requests: {{ circuitBreaker.workerRequestsCount.toLocaleString() }} / {{ circuitBreaker.workerRequestsLimit.toLocaleString() }}</p>
        </div>
      </div>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
import type { CircuitBreakerStatus } from '~/types/status'

interface Props {
  circuitBreaker: CircuitBreakerStatus
  lastUpdate: string
}

const props = defineProps<Props>()

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
