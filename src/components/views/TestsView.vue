<template>
  <div class="space-y-4">
    <!-- Header row -->
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-200">
        Test Results
        <span class="text-gray-500 font-normal text-sm ml-2">
          {{ store.allFilteredTests.value.length }} tests
        </span>
      </h2>

      <!-- Sort controls -->
      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-400">Sort:</span>
        <select v-model="sortBy" class="input text-xs">
          <option value="name">Name</option>
          <option value="duration">Duration</option>
          <option value="outcome">Status</option>
          <option value="streak">Failure Streak</option>
        </select>
        <button @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'" class="btn-ghost text-xs">
          {{ sortDir === 'asc' ? '↑' : '↓' }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-700/50">
            <tr class="text-left text-xs text-gray-400">
              <th class="px-4 py-3 font-medium">Test</th>
              <th class="px-4 py-3 font-medium">Suite</th>
              <th class="px-4 py-3 font-medium">Type</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium text-right">Duration</th>
              <th class="px-4 py-3 font-medium">Flags</th>
              <th class="px-4 py-3 font-medium">Run</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="{ run, test } in pagedTests"
              :key="test.nodeid + run.id"
              class="border-t border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors"
              @click="store.state.selectedTestId = test.nodeid"
            >
              <td class="px-4 py-2.5 max-w-xs">
                <div class="font-mono text-xs text-gray-200 truncate" :title="test.fullName">
                  {{ test.name }}
                </div>
                <div class="text-xs text-gray-500 truncate">{{ test.file }}</div>
              </td>
              <td class="px-4 py-2.5 max-w-[160px]">
                <div class="text-xs text-gray-400 truncate" :title="test.suite">{{ test.suite }}</div>
              </td>
              <td class="px-4 py-2.5">
                <span :class="suiteTypeBadge(test.suiteType)">{{ test.suiteType }}</span>
              </td>
              <td class="px-4 py-2.5">
                <span :class="outcomeBadge(test.outcome)">{{ test.outcome }}</span>
              </td>
              <td class="px-4 py-2.5 text-right font-mono text-xs" :class="durationColor(test.duration)">
                {{ test.duration.toFixed(3) }}s
              </td>
              <td class="px-4 py-2.5">
                <div class="flex gap-1">
                  <span v-if="isFlaky(test.nodeid)" class="badge-flaky">flaky</span>
                  <span v-if="getStreak(test.nodeid) > 1" class="badge-fail">🔥{{ getStreak(test.nodeid) }}</span>
                </div>
              </td>
              <td class="px-4 py-2.5 text-xs text-gray-500 max-w-[120px]">
                <div class="truncate" :title="run.filename">{{ run.filename }}</div>
                <div class="text-gray-600">{{ formatDate(run.runDate) }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="!pagedTests.length" class="text-center py-12 text-gray-500">
        No tests match the current filters
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-700 text-sm">
        <span class="text-gray-400 text-xs">
          Page {{ page }} of {{ totalPages }} · {{ store.allFilteredTests.value.length }} total
        </span>
        <div class="flex gap-2">
          <button
            :disabled="page <= 1"
            @click="page--"
            class="btn-ghost text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <button
            :disabled="page >= totalPages"
            @click="page++"
            class="btn-ghost text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from '@/composables/useStore'

const store = useStore()
const sortBy = ref('name')
const sortDir = ref('asc')
const page = ref(1)
const PAGE_SIZE = 50

// Reset page when filters change
watch(() => store.allFilteredTests.value.length, () => { page.value = 1 })

const sortedTests = computed(() => {
  const tests = [...store.allFilteredTests.value]
  tests.sort((a, b) => {
    let va, vb
    if (sortBy.value === 'name') { va = a.test.name; vb = b.test.name }
    else if (sortBy.value === 'duration') { va = a.test.duration; vb = b.test.duration }
    else if (sortBy.value === 'outcome') { va = a.test.outcome; vb = b.test.outcome }
    else if (sortBy.value === 'streak') {
      va = store.streakMap.value.get(a.test.nodeid) || 0
      vb = store.streakMap.value.get(b.test.nodeid) || 0
    }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
  return tests
})

const totalPages = computed(() => Math.ceil(sortedTests.value.length / PAGE_SIZE))

const pagedTests = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return sortedTests.value.slice(start, start + PAGE_SIZE)
})

function isFlaky(nodeid) {
  return store.flakyMap.value.get(nodeid)?.isFlaky || false
}

function getStreak(nodeid) {
  return store.streakMap.value.get(nodeid) || 0
}

function outcomeBadge(outcome) {
  const map = { passed: 'badge-pass', failed: 'badge-fail', skipped: 'badge-skip', error: 'badge-error' }
  return map[outcome] || 'badge-pass'
}

function suiteTypeBadge(type) {
  const map = { unit: 'badge-pass', integration: 'badge-skip', e2e: 'badge-error' }
  return map[type] || 'badge-pass'
}

function durationColor(d) {
  if (d > 5) return 'text-red-400'
  if (d > 2) return 'text-yellow-400'
  return 'text-gray-300'
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
