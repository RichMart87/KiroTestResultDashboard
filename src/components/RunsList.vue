<template>
  <div class="card">
    <h3 class="text-sm font-semibold text-gray-300 mb-4">Recent Runs</h3>
    <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
      <div
        v-for="run in sortedRuns"
        :key="run.id"
        class="flex items-center gap-3 p-2.5 rounded-lg bg-gray-700/40 hover:bg-gray-700/70 transition-colors"
      >
        <!-- Status dot -->
        <div
          :class="[
            'w-2.5 h-2.5 rounded-full shrink-0',
            run.summary.failed + run.summary.errors > 0 ? 'bg-red-500' : 'bg-green-500'
          ]"
        ></div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-200 truncate">{{ run.filename }}</span>
            <span class="badge-pass text-xs shrink-0">{{ run.project }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-0.5">
            {{ formatDate(run.runDate) }} · {{ run.duration.toFixed(1) }}s ·
            <span class="text-green-400">{{ run.summary.passed }}✓</span>
            <span v-if="run.summary.failed" class="text-red-400 ml-1">{{ run.summary.failed }}✗</span>
            <span v-if="run.summary.skipped" class="text-yellow-400 ml-1">{{ run.summary.skipped }}⊘</span>
          </div>
        </div>

        <!-- Pass rate mini bar -->
        <div class="w-16 shrink-0">
          <div class="h-1.5 bg-gray-600 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="passRateColor(run)"
              :style="{ width: passRate(run) + '%' }"
            ></div>
          </div>
          <div class="text-xs text-gray-500 text-right mt-0.5">{{ passRate(run) }}%</div>
        </div>

        <!-- Remove -->
        <button
          @click.stop="store.removeRun(run.id)"
          class="text-gray-600 hover:text-red-400 transition-colors shrink-0"
          title="Remove run"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'

const store = useStore()

const sortedRuns = computed(() =>
  [...store.filteredRuns.value].sort((a, b) => b.runDate - a.runDate)
)

function passRate(run) {
  return run.summary.total > 0
    ? ((run.summary.passed / run.summary.total) * 100).toFixed(0)
    : 0
}

function passRateColor(run) {
  const r = passRate(run)
  if (r >= 90) return 'bg-green-500'
  if (r >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

function formatDate(d) {
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>
