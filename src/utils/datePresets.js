/**
 * Date range presets for chart/filter controls.
 */
export const DATE_PRESETS = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: 'Custom', value: 'custom' }
]

/**
 * Returns { from: Date, to: Date } for a given preset key.
 * 'custom' returns null (caller handles it).
 */
export function getDateRange(preset) {
  const now = new Date()
  if (preset === '24h') {
    return { from: new Date(now - 24 * 60 * 60 * 1000), to: now }
  }
  if (preset === '7d') {
    return { from: new Date(now - 7 * 24 * 60 * 60 * 1000), to: now }
  }
  if (preset === '30d') {
    return { from: new Date(now - 30 * 24 * 60 * 60 * 1000), to: now }
  }
  return null
}

/**
 * Filter runs by date range.
 */
export function filterRunsByDate(runs, from, to) {
  return runs.filter((r) => {
    const d = r.runDate
    return (!from || d >= from) && (!to || d <= to)
  })
}
