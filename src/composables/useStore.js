import { reactive, computed, ref } from 'vue'
import { parseReport } from '@/utils/parseReport'
import { detectFlakyTests, computeFailureStreaks } from '@/utils/flakyDetection'
import { getDateRange, filterRunsByDate } from '@/utils/datePresets'

const state = reactive({
  runs: [],           // all loaded run objects
  loading: false,
  initializing: false, // true while fetching from public/data on startup
  error: null,

  // Filters
  selectedProject: 'all',
  selectedStatus: 'all',
  selectedSuite: 'all',
  selectedSuiteType: 'all',
  searchQuery: '',
  datePreset: '30d',
  customFrom: null,
  customTo: null,

  // UI state
  activeView: 'dashboard',   // dashboard | tests | compare | suites
  selectedRunIds: [],         // for comparison (max 2)
  selectedTestId: null        // for detail modal
})

// ── Derived ──────────────────────────────────────────────────────────────────

const dateFilteredRuns = computed(() => {
  let from, to
  if (state.datePreset === 'custom') {
    from = state.customFrom ? new Date(state.customFrom) : null
    to = state.customTo ? new Date(state.customTo) : null
  } else {
    const range = getDateRange(state.datePreset)
    from = range?.from
    to = range?.to
  }
  return filterRunsByDate(state.runs, from, to)
})

const projects = computed(() => {
  const set = new Set(state.runs.map((r) => r.project))
  return ['all', ...set]
})

const suites = computed(() => {
  const set = new Set()
  for (const run of dateFilteredRuns.value) {
    for (const t of run.tests) set.add(t.suite)
  }
  return ['all', ...set]
})

const flakyMap = computed(() => detectFlakyTests(dateFilteredRuns.value))
const streakMap = computed(() => computeFailureStreaks(dateFilteredRuns.value))

const filteredRuns = computed(() => {
  let runs = dateFilteredRuns.value
  if (state.selectedProject !== 'all') {
    runs = runs.filter((r) => r.project === state.selectedProject)
  }
  return runs
})

const allFilteredTests = computed(() => {
  const results = []
  for (const run of filteredRuns.value) {
    for (const test of run.tests) {
      // suite filter
      if (state.selectedSuite !== 'all' && test.suite !== state.selectedSuite) continue
      // suite type filter
      if (state.selectedSuiteType !== 'all' && test.suiteType !== state.selectedSuiteType) continue
      // status filter
      if (state.selectedStatus !== 'all' && test.outcome !== state.selectedStatus) continue
      // search
      if (
        state.searchQuery &&
        !test.fullName.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
        continue
      results.push({ run, test })
    }
  }
  return results
})

const aggregateSummary = computed(() => {
  let passed = 0, failed = 0, skipped = 0, errors = 0, total = 0, duration = 0
  for (const run of filteredRuns.value) {
    passed += run.summary.passed
    failed += run.summary.failed
    skipped += run.summary.skipped
    errors += run.summary.errors
    total += run.summary.total
    duration += run.duration
  }
  return { passed, failed, skipped, errors, total, duration }
})

const slowestTests = computed(() => {
  const map = new Map()
  for (const { test } of allFilteredTests.value) {
    if (!map.has(test.nodeid) || map.get(test.nodeid).duration < test.duration) {
      map.set(test.nodeid, test)
    }
  }
  return [...map.values()].sort((a, b) => b.duration - a.duration).slice(0, 20)
})

const suiteBreakdown = computed(() => {
  const types = { unit: { passed: 0, failed: 0, skipped: 0, total: 0 },
                  integration: { passed: 0, failed: 0, skipped: 0, total: 0 },
                  e2e: { passed: 0, failed: 0, skipped: 0, total: 0 } }
  for (const { test } of allFilteredTests.value) {
    const t = types[test.suiteType] || types.unit
    t.total++
    if (test.outcome === 'passed') t.passed++
    else if (test.outcome === 'failed' || test.outcome === 'error') t.failed++
    else if (test.outcome === 'skipped') t.skipped++
  }
  return types
})

// Chart data: pass/fail/skip per run over time
const trendChartData = computed(() => {
  const sorted = [...filteredRuns.value].sort((a, b) => a.runDate - b.runDate)
  return {
    labels: sorted.map((r) => formatRunLabel(r)),
    datasets: [
      {
        label: 'Passed',
        data: sorted.map((r) => r.summary.passed),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.15)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Failed',
        data: sorted.map((r) => r.summary.failed + r.summary.errors),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.15)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Skipped',
        data: sorted.map((r) => r.summary.skipped),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.1)',
        tension: 0.3,
        fill: false
      }
    ]
  }
})

const passRateChartData = computed(() => {
  const sorted = [...filteredRuns.value].sort((a, b) => a.runDate - b.runDate)
  return {
    labels: sorted.map((r) => formatRunLabel(r)),
    datasets: [
      {
        label: 'Pass Rate %',
        data: sorted.map((r) =>
          r.summary.total > 0
            ? parseFloat(((r.summary.passed / r.summary.total) * 100).toFixed(1))
            : 0
        ),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 4
      }
    ]
  }
})

const durationChartData = computed(() => {
  const sorted = [...filteredRuns.value].sort((a, b) => a.runDate - b.runDate)
  return {
    labels: sorted.map((r) => formatRunLabel(r)),
    datasets: [
      {
        label: 'Run Duration (s)',
        data: sorted.map((r) => parseFloat(r.duration.toFixed(2))),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  }
})

// ── Actions ───────────────────────────────────────────────────────────────────

async function loadFromManifest() {
  state.initializing = true
  state.error = null
  try {
    // Fetch the manifest
    const manifestRes = await fetch('/data/index.json')
    if (!manifestRes.ok) {
      console.warn('No manifest found at /data/index.json, skipping auto-load')
      return
    }
    const manifest = await manifestRes.json()
    const filenames = manifest.reports || []
    
    if (!filenames.length) {
      console.info('Manifest is empty, no reports to load')
      return
    }

    // Fetch each report
    const newRuns = []
    for (const filename of filenames) {
      try {
        const reportRes = await fetch(`/data/${filename}`)
        if (!reportRes.ok) {
          console.warn(`Failed to fetch /data/${filename}: ${reportRes.status}`)
          continue
        }
        const json = await reportRes.json()
        const run = parseReport(json, filename)
        // Avoid duplicates
        if (!state.runs.find((r) => r.id === run.id)) {
          newRuns.push(run)
        }
      } catch (e) {
        console.error(`Failed to parse /data/${filename}:`, e)
      }
    }
    
    state.runs.push(...newRuns)
    console.info(`Loaded ${newRuns.length} reports from manifest`)
  } catch (e) {
    console.error('Failed to load manifest:', e)
    // Don't set state.error here — we want the app to still work with drag-and-drop
  } finally {
    state.initializing = false
  }
}

async function loadFiles(fileList) {
  state.loading = true
  state.error = null
  const newRuns = []
  for (const file of fileList) {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const run = parseReport(json, file.name)
      // Avoid duplicates
      if (!state.runs.find((r) => r.id === run.id)) {
        newRuns.push(run)
      }
    } catch (e) {
      console.error('Failed to parse', file.name, e)
      state.error = `Failed to parse ${file.name}: ${e.message}`
    }
  }
  state.runs.push(...newRuns)
  state.loading = false
}

function removeRun(id) {
  const idx = state.runs.findIndex((r) => r.id === id)
  if (idx !== -1) state.runs.splice(idx, 1)
  state.selectedRunIds = state.selectedRunIds.filter((rid) => rid !== id)
}

function clearAll() {
  state.runs = []
  state.selectedRunIds = []
  state.selectedTestId = null
}

function toggleCompareRun(id) {
  const idx = state.selectedRunIds.indexOf(id)
  if (idx !== -1) {
    state.selectedRunIds.splice(idx, 1)
  } else if (state.selectedRunIds.length < 2) {
    state.selectedRunIds.push(id)
  }
}

function getRunById(id) {
  return state.runs.find((r) => r.id === id)
}

function getTestById(nodeid) {
  for (const run of state.runs) {
    const t = run.tests.find((t) => t.nodeid === nodeid)
    if (t) return { run, test: t }
  }
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRunLabel(run) {
  const d = run.runDate
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function useStore() {
  return {
    state,
    // computed
    dateFilteredRuns,
    filteredRuns,
    allFilteredTests,
    aggregateSummary,
    flakyMap,
    streakMap,
    slowestTests,
    suiteBreakdown,
    projects,
    suites,
    trendChartData,
    passRateChartData,
    durationChartData,
    // actions
    loadFromManifest,
    loadFiles,
    removeRun,
    clearAll,
    toggleCompareRun,
    getRunById,
    getTestById
  }
}
