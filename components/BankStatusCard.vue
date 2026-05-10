<template>
  <UCard :class="cardClass">
    <div class="space-y-4">
      <!-- Bank Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ bank.name }}</h3>
        <UBadge :color="badgeColor" variant="subtle" size="lg">
          {{ statusLabel }}
        </UBadge>
      </div>

      <!-- Last Checked -->
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Last checked: {{ formatTime(bank.lastChecked) }}
      </div>

      <!-- Service Breakdown -->
      <div class="grid grid-cols-2 gap-2">
        <div v-for="endpoint in bank.endpoints" :key="endpoint.id" class="flex items-center gap-2">
          <div :class="statusDotClass(endpoint.status)" class="w-2 h-2 rounded-full"></div>
          <span class="text-sm">{{ formatServiceType(endpoint.serviceType) }}</span>
        </div>
      </div>

      <!-- Error Details (if degraded/down) -->
      <div v-if="hasErrors" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Affected Services:</p>
        <ul class="text-xs space-y-1">
          <li v-for="error in errorDetails" :key="error.service" class="text-red-600 dark:text-red-400">
            {{ error.service }}: {{ error.message }}
          </li>
        </ul>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Bank, EndpointStatus, ServiceType } from '~/types/status'

interface Props {
  bank: Bank
}

const props = defineProps<Props>()

const statusLabel = computed(() => {
  return props.bank.status.charAt(0).toUpperCase() + props.bank.status.slice(1)
})

const badgeColor = computed(() => {
  switch (props.bank.status) {
    case 'up':
      return 'green'
    case 'degraded':
      return 'yellow'
    case 'down':
      return 'red'
    case 'maintenance':
      return 'blue'
    default:
      return 'gray'
  }
})

const cardClass = computed(() => {
  const baseClass = 'transition-all duration-200'
  switch (props.bank.status) {
    case 'up':
      return `${baseClass} border-l-4 border-green-500`
    case 'degraded':
      return `${baseClass} border-l-4 border-yellow-500`
    case 'down':
      return `${baseClass} border-l-4 border-red-500`
    case 'maintenance':
      return `${baseClass} border-l-4 border-blue-500`
    default:
      return baseClass
  }
})

const hasErrors = computed(() => {
  return props.bank.endpoints.some(e => e.status !== 'up')
})

const errorDetails = computed(() => {
  return props.bank.endpoints
    .filter(e => e.status !== 'up')
    .map(e => ({
      service: formatServiceType(e.serviceType),
      message: e.errorMessage || e.status
    }))
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
    third_party_api: 'API Integration'
  }
  return labels[type] || type
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
</script>
