<template>
  <div :class="bannerClass" class="py-16 px-8 text-center rounded-lg mb-8">
    <UIcon :name="statusIcon" class="text-6xl mb-4" />
    <h2 class="text-3xl font-bold mb-2">{{ statusTitle }}</h2>
    <p class="text-lg opacity-90">{{ statusDescription }}</p>
    <p class="text-sm opacity-75 mt-4">Last updated {{ formatTimestamp(lastUpdate) }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  totalBanks: number
  issueCount: number
  lastUpdate: string
}

const props = defineProps<Props>()

const statusTitle = computed(() => {
  if (props.issueCount === 0) return 'All Banks Operational'
  if (props.issueCount === 1) return 'Minor Service Disruption'
  if (props.issueCount <= 3) return 'Partial System Outage'
  return 'Major Service Disruption'
})

const statusDescription = computed(() => {
  if (props.issueCount === 0) {
    return `All ${props.totalBanks} bank services are operating normally`
  }
  return `${props.issueCount} of ${props.totalBanks} banks experiencing issues`
})

const statusIcon = computed(() => {
  if (props.issueCount === 0) return 'i-heroicons-check-circle'
  if (props.issueCount <= 2) return 'i-heroicons-exclamation-triangle'
  return 'i-heroicons-x-circle'
})

const bannerClass = computed(() => {
  if (props.issueCount === 0) {
    return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
  }
  if (props.issueCount <= 2) {
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
  }
  return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
})

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
