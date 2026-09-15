<template>
  <div class="card">
    <h3 class="text-sm font-semibold text-gray-300 mb-4">Pass / Fail Trend</h3>
    <div class="h-56">
      <Line :data="store.trendChartData.value" :options="options" />
    </div>
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useStore } from '@/composables/useStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const store = useStore()

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      labels: { color: '#9ca3af', boxWidth: 12, font: { size: 11 } }
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderWidth: 1,
      titleColor: '#f3f4f6',
      bodyColor: '#d1d5db'
    }
  },
  scales: {
    x: {
      ticks: { color: '#6b7280', font: { size: 10 } },
      grid: { color: '#1f2937' }
    },
    y: {
      ticks: { color: '#6b7280', font: { size: 10 } },
      grid: { color: '#1f2937' },
      beginAtZero: true
    }
  }
}
</script>
