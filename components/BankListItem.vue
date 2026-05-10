<template>
  <div
    class="border-b border-gray-200 dark:border-gray-700 py-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between">
      <!-- Bank Name and Service Details -->
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ bank.name }}
        </h3>

        <!-- Service Breakdown -->
        <div class="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div v-for="endpoint in bank.endpoints" :key="endpoint.id" class="flex items-center gap-2">
            <div :class="statusDotClass(endpoint.status)" class="w-2.5 h-2.5 rounded-full"></div>
            <span>{{ formatServiceType(endpoint.serviceType) }}</span>
          </div>
        </div>

        <!-- Error Message (if any) -->
        <div v-if="hasErrors" class="mt-2">
          <p class="text-sm text-red-600 dark:text-red-400">
            {{ errorSummary }}
          </p>
        </div>
      </div>

      <!-- Status Badge -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ formatTime(bank.lastChecked) }}
        </span>
        <UBadge :color="badgeColor" size="lg" class="uppercase">
          {{ statusLabel }}
        </UBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bank, ServiceType } from '~/types/status'

interface Props {
  bank: Bank
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const statusLabel = computed(() => {
  return props.bank.status === 'up' ? 'Operational' : props.bank.status.charAt(0).toUpperCase() + props.bank.status.slice(1)
})

const badgeColor = computed(() => {
  switch (props.bank.status) {
    case 'up':
      return 'success'
    case 'degraded':
      return 'warning'
    case 'down':
      return 'error'
    case 'maintenance':
      return 'info'
    default:
      return 'neutral'
  }
})

const hasErrors = computed(() => {
  return props.bank.endpoints.some(e => e.status !== 'up')
})

const errorSummary = computed(() => {
  const failedServices = props.bank.endpoints
    .filter(e => e.status !== 'up')
    .map(e => formatServiceType(e.serviceType))

  if (failedServices.length === 0) return ''
  if (failedServices.length === 1) return `${failedServices[0]} is experiencing issues`
  return `${failedServices.join(', ')} are experiencing issues`
})

function statusDotClass(status: string): string {
  switch (status) {
    case 'up':
      return 'bg-green-500'
    case 'down':
      return 'bg-red-500'
    case 'maintenance':
      return 'bg-blue-500'
    default:
      return 'bg-gray-400'
  }
}

function formatServiceType(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    website: 'Website',
    mobile_api: 'Mobile App',
    internet_banking: 'Internet Banking',
    third_party_api: 'API'
  }
  return labels[type] || type
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
</script>
