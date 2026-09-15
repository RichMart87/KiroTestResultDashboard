<template>
  <div class="bg-gray-900 border-b border-gray-800 px-6 py-3 flex flex-wrap items-center gap-3">
    <!-- Search -->
    <div class="relative">
      <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="store.state.searchQuery"
        type="text"
        placeholder="Search tests..."
        class="input pl-8 w-52"
      />
    </div>

    <!-- Project filter -->
    <select v-model="store.state.selectedProject" class="input">
      <option v-for="p in store.projects.value" :key="p" :value="p">
        {{ p === 'all' ? 'All Projects' : p }}
      </option>
    </select>

    <!-- Status filter -->
    <select v-model="store.state.selectedStatus" class="input">
      <option value="all">All Statuses</option>
      <option value="passed">Passed</option>
      <option value="failed">Failed</option>
      <option value="skipped">Skipped</option>
      <option value="error">Error</option>
    </select>

    <!-- Suite type filter -->
    <select v-model="store.state.selectedSuiteType" class="input">
      <option value="all">All Types</option>
      <option value="unit">Unit</option>
      <option value="integration">Integration</option>
      <option value="e2e">E2E</option>
    </select>

    <!-- Date preset -->
    <div class="flex rounded-lg overflow-hidden border border-gray-600">
      <button
        v-for="preset in presets"
        :key="preset.value"
        @click="store.state.datePreset = preset.value"
        :class="[
          'px-3 py-1.5 text-xs font-medium transition-colors',
          store.state.datePreset === preset.value
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Custom date range -->
    <template v-if="store.state.datePreset === 'custom'">
      <input
        v-model="store.state.customFrom"
        type="datetime-local"
        class="input text-xs"
      />
      <span class="text-gray-500 text-sm">→</span>
      <input
        v-model="store.state.customTo"
        type="datetime-local"
        class="input text-xs"
      />
    </template>

    <!-- Active filter count -->
    <div class="ml-auto flex items-center gap-2 text-xs text-gray-400">
      <span>{{ store.allFilteredTests.value.length }} tests</span>
      <button
        v-if="hasActiveFilters"
        @click="resetFilters"
        class="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
      >
        Reset filters
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { DATE_PRESETS } from '@/utils/datePresets'

const store = useStore()
const presets = DATE_PRESETS

const hasActiveFilters = computed(() =>
  store.state.selectedProject !== 'all' ||
  store.state.selectedStatus !== 'all' ||
  store.state.selectedSuiteType !== 'all' ||
  store.state.selectedSuite !== 'all' ||
  store.state.searchQuery !== '' ||
  store.state.datePreset !== '30d'
)

function resetFilters() {
  store.state.selectedProject = 'all'
  store.state.selectedStatus = 'all'
  store.state.selectedSuiteType = 'all'
  store.state.selectedSuite = 'all'
  store.state.searchQuery = ''
  store.state.datePreset = '30d'
  store.state.customFrom = null
  store.state.customTo = null
}
</script>
