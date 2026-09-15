<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="handleDrop"
  >
    <div
      :class="[
        'w-full max-w-2xl border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200',
        dragging
          ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01]'
          : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
      ]"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center">
          <svg class="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div>
          <h2 class="text-xl font-semibold text-gray-100 mb-1">Drop test report files here</h2>
          <p class="text-gray-400 text-sm">
            Accepts <code class="text-indigo-300 bg-indigo-950 px-1 rounded">.json</code> files
            from <strong class="text-gray-300">pytest-json-report</strong>
          </p>
          <p class="text-gray-500 text-xs mt-1">Multiple files supported — one file per test run</p>
        </div>

        <div class="flex items-center gap-3 mt-2">
          <div class="h-px w-16 bg-gray-700"></div>
          <span class="text-gray-500 text-sm">or</span>
          <div class="h-px w-16 bg-gray-700"></div>
        </div>

        <label class="btn-primary cursor-pointer">
          <input
            type="file"
            accept=".json"
            multiple
            class="hidden"
            @change="handleFileInput"
          />
          Browse files
        </label>

        <button
          @click="loadSampleData"
          class="text-xs text-gray-500 hover:text-indigo-400 underline underline-offset-2 transition-colors"
        >
          Load sample data
        </button>
      </div>
    </div>

    <!-- Format hint -->
    <div class="mt-6 max-w-2xl w-full">
      <details class="card text-sm">
        <summary class="cursor-pointer text-gray-400 hover:text-gray-200 select-none">
          How to generate reports with pytest-json-report
        </summary>
        <div class="mt-3 space-y-2 text-gray-400">
          <p>Install the plugin:</p>
          <pre class="bg-gray-900 rounded p-2 text-xs text-green-300 overflow-x-auto">pip install pytest-json-report</pre>
          <p>Run your tests:</p>
          <pre class="bg-gray-900 rounded p-2 text-xs text-green-300 overflow-x-auto">pytest --json-report --json-report-file=report.json</pre>
          <p class="text-gray-500 text-xs">Drop the generated <code class="text-indigo-300">report.json</code> files into this dashboard.</p>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { generateSampleData } from '@/utils/sampleData'

const emit = defineEmits(['files-loaded'])
const dragging = ref(false)

function handleDrop(e) {
  dragging.value = false
  const files = [...e.dataTransfer.files].filter((f) => f.name.endsWith('.json'))
  if (files.length) emit('files-loaded', files)
}

function handleFileInput(e) {
  const files = [...e.target.files]
  if (files.length) emit('files-loaded', files)
  e.target.value = ''
}

function loadSampleData() {
  const blobs = generateSampleData()
  emit('files-loaded', blobs)
}
</script>
