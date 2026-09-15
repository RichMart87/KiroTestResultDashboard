<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div class="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-start justify-between p-5 border-b border-gray-700">
          <div class="flex-1 min-w-0 pr-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="outcomeBadge(testInfo?.test.outcome)">
                {{ testInfo?.test.outcome }}
              </span>
              <span :class="suiteTypeBadge(testInfo?.test.suiteType)">
                {{ testInfo?.test.suiteType }}
              </span>
              <span v-if="isFlaky" class="badge-flaky">flaky</span>
              <span v-if="streak > 1" class="badge-fail">🔥 {{ streak }} streak</span>
            </div>
            <h2 class="text-base font-semibold text-gray-100 mt-2 font-mono break-all">
              {{ testInfo?.test.name }}
            </h2>
            <p class="text-xs text-gray-400 mt-1 font-mono break-all">{{ testInfo?.test.fullName }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-200 transition-colors shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-1 p-5 space-y-4">
          <!-- Meta grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-gray-700/50 rounded-lg p-3">
              <div class="text-xs text-gray-400">Duration</div>
              <div class="text-sm font-mono text-blue-300 mt-0.5">
                {{ testInfo?.test.duration.toFixed(3) }}s
              </div>
            </div>
            <div class="bg-gray-700/50 rounded-lg p-3">
              <div class="text-xs text-gray-400">File</div>
              <div class="text-xs font-mono text-gray-200 mt-0.5 truncate" :title="testInfo?.test.file">
                {{ testInfo?.test.file }}
              </div>
            </div>
            <div class="bg-gray-700/50 rounded-lg p-3">
              <div class="text-xs text-gray-400">Run</div>
              <div class="text-xs text-gray-200 mt-0.5 truncate" :title="testInfo?.run.filename">
                {{ testInfo?.run.filename }}
              </div>
            </div>
            <div class="bg-gray-700/50 rounded-lg p-3">
              <div class="text-xs text-gray-400">Run Date</div>
              <div class="text-xs text-gray-200 mt-0.5">
                {{ testInfo?.run.runDate.toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Flaky stats -->
          <div v-if="flakyInfo" class="bg-purple-900/30 border border-purple-800/50 rounded-lg p-4">
            <h4 class="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-2">Flaky History</h4>
            <div class="flex gap-6 text-sm">
              <div>
                <span class="text-gray-400">Total runs: </span>
                <span class="text-gray-200">{{ flakyInfo.totalRuns }}</span>
              </div>
              <div>
                <span class="text-gray-400">Passed: </span>
                <span class="text-green-400">{{ flakyInfo.passCount }}</span>
              </div>
              <div>
                <span class="text-gray-400">Failed: </span>
                <span class="text-red-400">{{ flakyInfo.failCount }}</span>
              </div>
              <div>
                <span class="text-gray-400">Flakiness: </span>
                <span class="text-purple-400">{{ (flakyInfo.flakyScore * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="testInfo?.test.crashMessage" class="space-y-2">
            <h4 class="text-xs font-semibold text-red-400 uppercase tracking-wide">Error</h4>
            <div class="bg-red-950/50 border border-red-900/50 rounded-lg p-3">
              <p class="text-sm text-red-300 font-mono break-all">{{ testInfo.test.crashMessage }}</p>
            </div>
          </div>

          <!-- Stack trace -->
          <div v-if="testInfo?.test.traceback" class="space-y-2">
            <h4 class="text-xs font-semibold text-orange-400 uppercase tracking-wide">Stack Trace</h4>
            <pre class="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">{{ testInfo.test.traceback }}</pre>
          </div>

          <!-- Keywords -->
          <div v-if="testInfo?.test.keywords?.length" class="space-y-2">
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Keywords</h4>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="kw in testInfo.test.keywords"
                :key="kw"
                class="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs font-mono"
              >
                {{ kw }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'

defineEmits(['close'])

const store = useStore()

const testInfo = computed(() => {
  if (!store.state.selectedTestId) return null
  return store.getTestById(store.state.selectedTestId)
})

const flakyInfo = computed(() => {
  if (!store.state.selectedTestId) return null
  return store.flakyMap.value.get(store.state.selectedTestId) || null
})

const isFlaky = computed(() => flakyInfo.value?.isFlaky || false)

const streak = computed(() => {
  if (!store.state.selectedTestId) return 0
  return store.streakMap.value.get(store.state.selectedTestId) || 0
})

function outcomeBadge(outcome) {
  const map = { passed: 'badge-pass', failed: 'badge-fail', skipped: 'badge-skip', error: 'badge-error' }
  return map[outcome] || 'badge-pass'
}

function suiteTypeBadge(type) {
  const map = { unit: 'badge-pass', integration: 'badge-skip', e2e: 'badge-error' }
  return map[type] || 'badge-pass'
}
</script>
