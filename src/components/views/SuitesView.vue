<template>
  <div class="space-y-6">
    <h2 class="text-base font-semibold text-gray-200">Suite Breakdown</h2>

    <!-- Suite type summary cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="(stats, type) in store.suiteBreakdown.value"
        :key="type"
        class="card"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-200 capitalize">{{ type }}</h3>
          <span :class="suiteTypeBadge(type)">{{ type }}</span>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Total</span>
            <span class="text-gray-200 font-medium">{{ stats.total }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-green-400">Passed</span>
            <span class="text-green-400 font-medium">{{ stats.passed }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-red-400">Failed</span>
            <span class="text-red-400 font-medium">{{ stats.failed }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-yellow-400">Skipped</span>
            <span class="text-yellow-400 font-medium">{{ stats.skipped }}</span>
          </div>

          <!-- Pass rate bar -->
          <div class="pt-2">
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>Pass rate</span>
              <span>{{ passRate(stats) }}%</span>
            </div>
            <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="passRateColor(passRate(stats))"
                :style="{ width: passRate(stats) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Per-file breakdown -->
    <div class="card">
      <h3 class="text-sm font-semibold text-gray-300 mb-4">Per-File Breakdown</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-400 border-b border-gray-700">
              <th class="pb-2 pr-4 font-medium">File</th>
              <th class="pb-2 pr-4 font-medium">Type</th>
              <th class="pb-2 pr-4 font-medium text-right">Total</th>
              <th class="pb-2 pr-4 font-medium text-right">Passed</th>
              <th class="pb-2 pr-4 font-medium text-right">Failed</th>
              <th class="pb-2 pr-4 font-medium text-right">Skipped</th>
              <th class="pb-2 font-medium">Pass Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in fileBreakdown"
              :key="row.file"
              class="border-b border-gray-700/50 hover:bg-gray-700/30"
            >
              <td class="py-2 pr-4 font-mono text-xs text-gray-200 max-w-xs">
                <div class="truncate" :title="row.file">{{ row.file }}</div>
              </td>
              <td class="py-2 pr-4">
                <span :class="suiteTypeBadge(row.suiteType)">{{ row.suiteType }}</span>
              </td>
              <td class="py-2 pr-4 text-right text-gray-300">{{ row.total }}</td>
              <td class="py-2 pr-4 text-right text-green-400">{{ row.passed }}</td>
              <td class="py-2 pr-4 text-right text-red-400">{{ row.failed }}</td>
              <td class="py-2 pr-4 text-right text-yellow-400">{{ row.skipped }}</td>
              <td class="py-2 w-32">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="passRateColor(passRate(row))"
                      :style="{ width: passRate(row) + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-400 w-8 text-right">{{ passRate(row) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'

const store = useStore()

const fileBreakdown = computed(() => {
  const map = new Map()
  for (const { test } of store.allFilteredTests.value) {
    if (!map.has(test.file)) {
      map.set(test.file, {
        file: test.file,
        suiteType: test.suiteType,
        total: 0, passed: 0, failed: 0, skipped: 0
      })
    }
    const row = map.get(test.file)
    row.total++
    if (test.outcome === 'passed') row.passed++
    else if (test.outcome === 'failed' || test.outcome === 'error') row.failed++
    else if (test.outcome === 'skipped') row.skipped++
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
})

function passRate(stats) {
  return stats.total > 0
    ? ((stats.passed / stats.total) * 100).toFixed(0)
    : 0
}

function passRateColor(rate) {
  if (rate >= 90) return 'bg-green-500'
  if (rate >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

function suiteTypeBadge(type) {
  const map = { unit: 'badge-pass', integration: 'badge-skip', e2e: 'badge-error' }
  return map[type] || 'badge-pass'
}
</script>
