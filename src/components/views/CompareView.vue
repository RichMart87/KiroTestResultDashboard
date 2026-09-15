<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-200">Run Comparison</h2>
      <p class="text-xs text-gray-400">Select up to 2 runs to compare</p>
    </div>

    <!-- Run selector -->
    <div class="card">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">Select Runs</h3>
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <label
          v-for="run in sortedRuns"
          :key="run.id"
          class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
          :class="{ 'bg-indigo-900/30 border border-indigo-700/50': isSelected(run.id) }"
        >
          <input
            type="checkbox"
            :checked="isSelected(run.id)"
            :disabled="!isSelected(run.id) && store.state.selectedRunIds.length >= 2"
            @change="store.toggleCompareRun(run.id)"
            class="rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-200 truncate">{{ run.filename }}</span>
              <span class="badge-pass text-xs shrink-0">{{ run.project }}</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ run.runDate.toLocaleString() }} · {{ run.duration.toFixed(1) }}s
            </div>
          </div>
          <div class="text-xs text-right shrink-0">
            <div class="text-green-400">{{ run.summary.passed }} passed</div>
            <div class="text-red-400">{{ run.summary.failed }} failed</div>
          </div>
        </label>
      </div>
    </div>

    <!-- Comparison panel -->
    <div v-if="runA && runB" class="space-y-4">
      <!-- Side-by-side summary -->
      <div class="grid grid-cols-2 gap-4">
        <RunSummaryCard :run="runA" label="Run A" color="indigo" />
        <RunSummaryCard :run="runB" label="Run B" color="purple" />
      </div>

      <!-- Delta table -->
      <div class="card">
        <h3 class="text-sm font-semibold text-gray-300 mb-4">Metric Comparison</h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs text-gray-400 border-b border-gray-700">
              <th class="pb-2 text-left font-medium">Metric</th>
              <th class="pb-2 text-right font-medium text-indigo-400">{{ runA.filename }}</th>
              <th class="pb-2 text-right font-medium text-purple-400">{{ runB.filename }}</th>
              <th class="pb-2 text-right font-medium">Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in deltaRows" :key="row.label" class="border-b border-gray-700/50">
              <td class="py-2 text-gray-400">{{ row.label }}</td>
              <td class="py-2 text-right text-indigo-300">{{ row.a }}</td>
              <td class="py-2 text-right text-purple-300">{{ row.b }}</td>
              <td class="py-2 text-right" :class="row.deltaClass">{{ row.delta }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tests that changed status -->
      <div class="card">
        <h3 class="text-sm font-semibold text-gray-300 mb-4">Status Changes</h3>
        <div v-if="!statusChanges.length" class="text-center py-6 text-gray-500 text-sm">
          No status changes between these runs
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-gray-400 border-b border-gray-700">
                <th class="pb-2 text-left font-medium">Test</th>
                <th class="pb-2 text-right font-medium text-indigo-400">Run A</th>
                <th class="pb-2 text-right font-medium text-purple-400">Run B</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="change in statusChanges"
                :key="change.nodeid"
                class="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                @click="store.state.selectedTestId = change.nodeid"
              >
                <td class="py-2 pr-4 font-mono text-xs text-gray-200 max-w-xs">
                  <div class="truncate" :title="change.nodeid">{{ change.name }}</div>
                </td>
                <td class="py-2 text-right">
                  <span :class="outcomeBadge(change.outcomeA)">{{ change.outcomeA || '—' }}</span>
                </td>
                <td class="py-2 text-right">
                  <span :class="outcomeBadge(change.outcomeB)">{{ change.outcomeB || '—' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Placeholder when < 2 runs selected -->
    <div v-else-if="store.state.selectedRunIds.length < 2" class="card text-center py-12 text-gray-500">
      <svg class="w-10 h-10 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      Select 2 runs above to compare them
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import RunSummaryCard from '@/components/RunSummaryCard.vue'

const store = useStore()

const sortedRuns = computed(() =>
  [...store.filteredRuns.value].sort((a, b) => b.runDate - a.runDate)
)

const runA = computed(() =>
  store.state.selectedRunIds[0] ? store.getRunById(store.state.selectedRunIds[0]) : null
)
const runB = computed(() =>
  store.state.selectedRunIds[1] ? store.getRunById(store.state.selectedRunIds[1]) : null
)

function isSelected(id) {
  return store.state.selectedRunIds.includes(id)
}

const deltaRows = computed(() => {
  if (!runA.value || !runB.value) return []
  const a = runA.value.summary
  const b = runB.value.summary

  const passRateA = a.total > 0 ? ((a.passed / a.total) * 100).toFixed(1) : 0
  const passRateB = b.total > 0 ? ((b.passed / b.total) * 100).toFixed(1) : 0

  return [
    makeRow('Total Tests', a.total, b.total, false),
    makeRow('Passed', a.passed, b.passed, true),
    makeRow('Failed', a.failed, b.failed, false),
    makeRow('Skipped', a.skipped, b.skipped, null),
    makeRow('Errors', a.errors, b.errors, false),
    makeRow('Pass Rate %', passRateA, passRateB, true),
    makeRow('Duration (s)', runA.value.duration.toFixed(2), runB.value.duration.toFixed(2), false)
  ]
})

function makeRow(label, a, b, higherIsBetter) {
  const diff = parseFloat(b) - parseFloat(a)
  let deltaClass = 'text-gray-400'
  let delta = diff === 0 ? '—' : (diff > 0 ? '+' : '') + diff.toFixed(typeof a === 'string' && a.includes('.') ? 1 : 0)

  if (diff !== 0 && higherIsBetter !== null) {
    deltaClass = (diff > 0) === higherIsBetter ? 'text-green-400' : 'text-red-400'
  }

  return { label, a, b, delta, deltaClass }
}

const statusChanges = computed(() => {
  if (!runA.value || !runB.value) return []
  const mapA = new Map(runA.value.tests.map((t) => [t.nodeid, t]))
  const mapB = new Map(runB.value.tests.map((t) => [t.nodeid, t]))
  const changes = []

  const allIds = new Set([...mapA.keys(), ...mapB.keys()])
  for (const id of allIds) {
    const tA = mapA.get(id)
    const tB = mapB.get(id)
    const outcomeA = tA?.outcome
    const outcomeB = tB?.outcome
    if (outcomeA !== outcomeB) {
      changes.push({
        nodeid: id,
        name: (tA || tB).name,
        outcomeA,
        outcomeB
      })
    }
  }
  return changes.sort((a, b) => a.name.localeCompare(b.name))
})

function outcomeBadge(outcome) {
  if (!outcome) return 'text-gray-500 text-xs'
  const map = { passed: 'badge-pass', failed: 'badge-fail', skipped: 'badge-skip', error: 'badge-error' }
  return map[outcome] || 'badge-pass'
}
</script>
