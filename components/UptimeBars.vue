<template>
  <div class="flex items-center gap-2">
    <div class="flex-1 flex items-center gap-0.5">
      <div
        v-for="(day, index) in days"
        :key="index"
        :class="getBarClass(day.status)"
        :title="`${formatDate(day.date)}: ${day.status}`"
        class="h-8 flex-1 rounded-sm"
      />
    </div>
    <span class="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ uptimePercentage }}%</span>
  </div>
</template>

<script setup lang="ts">
interface DayStatus {
  date: string
  status: 'up' | 'degraded' | 'down' | 'unknown'
}

interface Props {
  days: DayStatus[]
}

const props = defineProps<Props>()

const uptimePercentage = computed(() => {
  const upDays = props.days.filter(d => d.status === 'up').length
  return Math.round((upDays / props.days.length) * 100)
})

function getBarClass(status: string): string {
  switch (status) {
    case 'up':
      return 'bg-green-500'
    case 'degraded':
      return 'bg-yellow-500'
    case 'down':
      return 'bg-red-500'
    default:
      return 'bg-gray-300 dark:bg-gray-600'
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
