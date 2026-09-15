<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
        Flaky Tests
        <span class="badge-flaky">{{ flakyTests.length }}</span>
      </h3>
    </div>

    <div v-if="flakyTests.length === 0" class="text-center py-8 text-gray-500 text-sm">
      No flaky tests detected in the current window 🎉
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-700">
            <th class="pb-2 pr-4 font-medium">Test</th>
            <th class="pb-2 pr-4 font-medium">Type</th>
            <th class="pb-2 pr-4 font-medium text-right">Runs</th>
            <th class="pb-2 pr-4 font-medium text-right">Pass</th>
            <th class="pb-2 pr-4 font-medium text-right">Fail</th>
            <th class="pb-2 font-medium">Flakiness</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="f in flakyTests"
            :key="f.nodeid"
            class="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
            @click="openTest(f.nodeid)"
          >
            <td class="py-2 pr-4 max-w-xs">
              <div class="truncate text-gray-200 font-mono text-xs" :title="f.nodeid">
                {{ f.nodeid }}
              </div>
            </td>
            <td class="py-2 pr-4">
              <span :class="suiteTypeBadge(f.suiteType)">{{ f.suiteType }}</span>
            </td>
            <td class="py-2 pr-4 text-right text-gray-400">{{ f.totalRuns }}</td>
            <td class="py-2 pr-4 text-right text-green-400">{{ f.passCount }}</td>
            <td class="py-2 pr-4 text-right text-red-400">{{ f.failCount + (f.errorCount || 0) }}</td>
            <td class="py-2 w-32">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-purple-500 rounded-full"
                    :style="{ width: (f.flakyScore * 100).toFixed(0) + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-purple-400 w-8 text-right">
                  {{ (f.flakyScore * 100).toFixed(0) }}%
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'

const store = useStore()

const flakyTests = computed(() =>
  [...store.flakyMap.value.values()]
    .filter((f) => f.isFlaky)
    .sort((a, b) => b.flakyScore - a.flakyScore)
    .slice(0, 10)
)

function openTest(nodeid) {
  store.state.selectedTestId = nodeid
}

function suiteTypeBadge(type) {
  const map = {
    unit: 'badge-pass',
    integration: 'badge-skip',
    e2e: 'badge-error'
  }
  return map[type] || 'badge-pass'
}
</script>
