<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
    <!-- Top Nav -->
    <header class="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4 shrink-0">
      <div class="flex items-center gap-2 mr-4">
        <svg class="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="font-bold text-lg tracking-tight">Test Dashboard</span>
      </div>

      <!-- Nav tabs -->
      <nav class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="store.state.activeView = tab.id"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            store.state.activeView === tab.id
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <!-- Run count badge -->
        <span v-if="store.state.runs.length" class="text-xs text-gray-400">
          {{ store.filteredRuns.value.length }} / {{ store.state.runs.length }} runs
        </span>

        <!-- Export button -->
        <button
          v-if="store.state.runs.length"
          @click="handleExport"
          class="btn-ghost flex items-center gap-1.5"
          title="Export to Excel"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </button>

        <!-- Clear button -->
        <button
          v-if="store.state.runs.length"
          @click="store.clearAll"
          class="btn-danger flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <!-- Loading screen during initialization -->
      <div v-if="store.state.initializing" class="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-400 text-sm">Loading test reports from /data...</p>
        </div>
      </div>

      <!-- Drop zone / empty state -->
      <DropZone v-else-if="!store.state.runs.length" @files-loaded="store.loadFiles" />

      <template v-else>
        <!-- Filter bar -->
        <FilterBar />

        <!-- Views -->
        <div class="p-6">
          <DashboardView v-if="store.state.activeView === 'dashboard'" />
          <TestsView v-else-if="store.state.activeView === 'tests'" />
          <SuitesView v-else-if="store.state.activeView === 'suites'" />
          <CompareView v-else-if="store.state.activeView === 'compare'" />
        </div>
      </template>
    </main>

    <!-- Test detail modal -->
    <TestDetailModal
      v-if="store.state.selectedTestId"
      @close="store.state.selectedTestId = null"
    />

    <!-- Error toast -->
    <div
      v-if="store.state.error"
      class="fixed bottom-4 right-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg shadow-xl max-w-sm text-sm flex items-start gap-2"
    >
      <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ store.state.error }}</span>
      <button @click="store.state.error = null" class="ml-auto text-red-400 hover:text-red-200">✕</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStore } from '@/composables/useStore'
import { exportToExcel } from '@/utils/exportExcel'
import DropZone from '@/components/DropZone.vue'
import FilterBar from '@/components/FilterBar.vue'
import DashboardView from '@/components/views/DashboardView.vue'
import TestsView from '@/components/views/TestsView.vue'
import SuitesView from '@/components/views/SuitesView.vue'
import CompareView from '@/components/views/CompareView.vue'
import TestDetailModal from '@/components/TestDetailModal.vue'

const store = useStore()

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tests', label: 'Tests' },
  { id: 'suites', label: 'Suites' },
  { id: 'compare', label: 'Compare' }
]

// Auto-load reports from public/data/ on startup
onMounted(() => {
  store.loadFromManifest()
})

async function handleExport() {
  await exportToExcel(
    store.filteredRuns.value,
    store.allFilteredTests.value,
    store.flakyMap.value
  )
}
</script>
