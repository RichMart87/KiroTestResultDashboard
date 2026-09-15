<template>
  <div class="card">
    <h3 class="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
      <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Slowest Tests (top 10)
    </h3>

    <div v-if="!store.slowestTests.value.length" class="text-center py-8 text-gray-500 text-sm">
      No test data available
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-700">
            <th class="pb-2 pr-4 font-medium">#</th>
            <th class="pb-2 pr-4 font-medium">Test</th>
            <th class="pb-2 pr-4 font-medium">Type</th>
            <th class="pb-2 pr-4 font-medium">Status</th>
            <th class="pb-2 font-medium text-right">Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(test, i) in store.slowestTests.value.slice(0, 10)"
            :key="test.nodeid"
            class="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
            @click="store.state.selectedTestId = test.nodeid"
          >
            <td class="py-2 pr-4 text-gray-500 text-xs">{{ i + 1 }}</td>
            <td class="py-2 pr-4 max-w-xs">
              <div class="truncate text-gray-200 font-mono text-xs" :title="test.fullName">
                {{ test.name }}
              </div>
              <div class="text-gray-500 text-xs truncate">{{ test.file }}</div>
            </td>
            <td class="py-2 pr-4">
              <span :class="suiteTypeBadge(test.suiteType)">{{ test.suiteType }}</span>
            </td>
            <td class="py-2 pr-4">
              <span :class="outcomeBadge(test.outcome)">{{ test.outcome }}</span>
            </td>
            <td class="py-2 text-right">
              <span :class="durationColor(test.duration)" class="font-mono text-xs">
                {{ test.duration.toFixed(3) }}s
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '@/composables/useStore'

const store = useStore()

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
  return 'text-blue-400'
}
</script>
