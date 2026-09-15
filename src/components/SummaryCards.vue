<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    <!-- Total -->
    <div class="card flex flex-col gap-1">
      <span class="text-xs text-gray-400 uppercase tracking-wide">Total</span>
      <span class="text-3xl font-bold text-gray-100">{{ summary.total.toLocaleString() }}</span>
      <span class="text-xs text-gray-500">{{ runCount }} run{{ runCount !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Passed -->
    <div class="card flex flex-col gap-1 border-green-800/50">
      <span class="text-xs text-green-400 uppercase tracking-wide">Passed</span>
      <span class="text-3xl font-bold text-green-400">{{ summary.passed.toLocaleString() }}</span>
      <div class="flex items-center gap-1">
        <div class="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-green-500 rounded-full transition-all"
            :style="{ width: passRate + '%' }"
          ></div>
        </div>
        <span class="text-xs text-gray-400">{{ passRate }}%</span>
      </div>
    </div>

    <!-- Failed -->
    <div class="card flex flex-col gap-1 border-red-800/50">
      <span class="text-xs text-red-400 uppercase tracking-wide">Failed</span>
      <span class="text-3xl font-bold text-red-400">{{ summary.failed.toLocaleString() }}</span>
      <span class="text-xs text-gray-500">{{ failRate }}% of total</span>
    </div>

    <!-- Skipped -->
    <div class="card flex flex-col gap-1 border-yellow-800/50">
      <span class="text-xs text-yellow-400 uppercase tracking-wide">Skipped</span>
      <span class="text-3xl font-bold text-yellow-400">{{ summary.skipped.toLocaleString() }}</span>
      <span class="text-xs text-gray-500">{{ skipRate }}% of total</span>
    </div>

    <!-- Errors -->
    <div class="card flex flex-col gap-1 border-orange-800/50">
      <span class="text-xs text-orange-400 uppercase tracking-wide">Errors</span>
      <span class="text-3xl font-bold text-orange-400">{{ summary.errors.toLocaleString() }}</span>
      <span class="text-xs text-gray-500">collection / setup</span>
    </div>

    <!-- Duration -->
    <div class="card flex flex-col gap-1">
      <span class="text-xs text-blue-400 uppercase tracking-wide">Total Time</span>
      <span class="text-3xl font-bold text-blue-400">{{ formatDuration(summary.duration) }}</span>
      <span class="text-xs text-gray-500">across all runs</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'

const store = useStore()
const summary = store.aggregateSummary
const runCount = computed(() => store.filteredRuns.value.length)

const passRate = computed(() =>
  summary.value.total > 0
    ? ((summary.value.passed / summary.value.total) * 100).toFixed(1)
    : '0.0'
)
const failRate = computed(() =>
  summary.value.total > 0
    ? (((summary.value.failed + summary.value.errors) / summary.value.total) * 100).toFixed(1)
    : '0.0'
)
const skipRate = computed(() =>
  summary.value.total > 0
    ? ((summary.value.skipped / summary.value.total) * 100).toFixed(1)
    : '0.0'
)

function formatDuration(s) {
  if (s < 60) return s.toFixed(1) + 's'
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(0)
  return `${m}m ${sec}s`
}
</script>
