<template>
  <div class="status-timeline">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import type { StatusHistoryRecord } from '~/types/status'

Chart.register(...registerables)

interface Props {
  bankSlug: string
  history: StatusHistoryRecord[]
}

const props = defineProps<Props>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const chartData = computed(() => {
  const labels = props.history.map(h => new Date(h.timestamp).toLocaleDateString())
  const data = props.history.map(h => {
    // Convert status to numeric value for chart
    switch (h.status) {
      case 'up': return 3
      case 'degraded': return 2
      case 'down': return 1
      case 'maintenance': return 0
      default: return 1
    }
  })

  const colors = props.history.map(h => {
    switch (h.status) {
      case 'up': return '#10b981' // green-500
      case 'degraded': return '#eab308' // yellow-500
      case 'down': return '#ef4444' // red-500
      case 'maintenance': return '#3b82f6' // blue-500
      default: return '#9ca3af' // gray-400
    }
  })

  return { labels, data, colors }
})

function initChart() {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.value.labels,
      datasets: [{
        label: 'Status',
        data: chartData.value.data,
        borderColor: '#6366f1', // indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: chartData.value.colors,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const index = context.dataIndex
              const record = props.history[index]
              if (!record) return ''

              const statusLabel = record.status.charAt(0).toUpperCase() + record.status.slice(1)
              let tooltip = `Status: ${statusLabel}`

              if (record.affectedServices && record.affectedServices.length > 0) {
                tooltip += `\nAffected: ${record.affectedServices.join(', ')}`
              }

              return tooltip
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 3,
          ticks: {
            stepSize: 1,
            callback: (value) => {
              switch (value) {
                case 3: return 'Up'
                case 2: return 'Degraded'
                case 1: return 'Down'
                case 0: return 'Maintenance'
                default: return ''
              }
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  })
}

watch(() => props.history, () => {
  initChart()
}, { deep: true })

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.status-timeline {
  height: 300px;
  width: 100%;
}
</style>
