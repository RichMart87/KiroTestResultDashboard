<template>
  <div class="card">
    <h3 class="text-sm font-semibold text-gray-300 mb-4">Results by Suite Type</h3>
    <div class="h-56 flex items-center justify-center">
      <Doughnut :data="chartData" :options="options" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { useStore } from '@/composables/useStore'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = useStore()

const chartData = computed(() => {
  const bd = store.suiteBreakdown.value
  return {
    labels: ['Unit', 'Integration', 'E2E'],
    datasets: [
      {
        label: 'Passed',
        data: [bd.unit.passed, bd.integration.passed, bd.e2e.passed],
        backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(34,197,94,0.5)', 'rgba(34,197,94,0.3)'],
        borderColor: '#111827',
        borderWidth: 2
      }
    ]
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { color: '#9ca3af', boxWidth: 12, font: { size: 11 } }
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderWidth: 1,
      titleColor: '#f3f4f6',
      bodyColor: '#d1d5db'
    }
  }
}
</script>
