<template>
  <div class="card" :class="borderClass">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-bold uppercase tracking-wide" :class="labelClass">{{ label }}</span>
      <span class="badge-pass text-xs">{{ run.project }}</span>
    </div>

    <div class="text-xs text-gray-400 mb-3 truncate" :title="run.filename">{{ run.filename }}</div>
    <div class="text-xs text-gray-500 mb-4">{{ run.runDate.toLocaleString() }}</div>

    <div class="grid grid-cols-2 gap-3">
      <div class="bg-gray-700/50 rounded-lg p-2.5 text-center">
        <div class="text-lg font-bold text-green-400">{{ run.summary.passed }}</div>
        <div class="text-xs text-gray-400">Passed</div>
      </div>
      <div class="bg-gray-700/50 rounded-lg p-2.5 text-center">
        <div class="text-lg font-bold text-red-400">{{ run.summary.failed }}</div>
        <div class="text-xs text-gray-400">Failed</div>
      </div>
      <div class="bg-gray-700/50 rounded-lg p-2.5 text-center">
        <div class="text-lg font-bold text-yellow-400">{{ run.summary.skipped }}</div>
        <div class="text-xs text-gray-400">Skipped</div>
      </div>
      <div class="bg-gray-700/50 rounded-lg p-2.5 text-center">
        <div class="text-lg font-bold text-blue-400">{{ run.duration.toFixed(1) }}s</div>
        <div class="text-xs text-gray-400">Duration</div>
      </div>
    </div>

    <!-- Pass rate bar -->
    <div class="mt-3">
      <div class="flex justify-between text-xs text-gray-400 mb-1">
        <span>Pass rate</span>
        <span>{{ passRate }}%</span>
      </div>
      <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all"
          :class="barClass"
          :style="{ width: passRate + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  run: { type: Object, required: true },
  label: { type: String, default: 'Run' },
  color: { type: String, default: 'indigo' }
})

const passRate = computed(() =>
  props.run.summary.total > 0
    ? ((props.run.summary.passed / props.run.summary.total) * 100).toFixed(1)
    : 0
)

const borderClass = computed(() =>
  props.color === 'indigo' ? 'border-indigo-700/50' : 'border-purple-700/50'
)
const labelClass = computed(() =>
  props.color === 'indigo' ? 'text-indigo-400' : 'text-purple-400'
)
const barClass = computed(() => {
  const r = parseFloat(passRate.value)
  if (r >= 90) return 'bg-green-500'
  if (r >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
})
</script>
