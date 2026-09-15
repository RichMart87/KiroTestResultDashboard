/**
 * Parses a pytest-json-report JSON file into a normalized run object.
 *
 * pytest-json-report schema reference:
 * https://github.com/numirias/pytest-json-report
 *
 * Top-level keys: created, duration, exitcode, root, environment,
 *   summary { passed, failed, skipped, error, total },
 *   collectors [], tests []
 *
 * Each test: nodeid, lineno, keywords[], outcome (passed|failed|skipped|error),
 *   setup{}, call{}, teardown{}, metadata{}
 *
 * Each phase (setup/call/teardown): duration, outcome,
 *   longrepr (string | object with reprcrash / reprtraceback)
 */

export function parseReport(json, filename) {
  const summary = json.summary || {}
  const tests = json.tests || []

  const passed = summary.passed || 0
  const failed = summary.failed || 0
  const skipped = summary.skipped || 0
  const errors = summary.error || 0
  const total = summary.total || tests.length

  // Derive project name from filename or environment
  const project =
    (json.environment && (json.environment.project || json.environment.PROJECT)) ||
    deriveProject(filename)

  const runDate = json.created
    ? new Date(json.created * 1000)
    : new Date()

  const normalizedTests = tests.map((t) => normalizeTest(t))

  return {
    id: filename,
    filename,
    project,
    runDate,
    duration: json.duration || 0,
    exitcode: json.exitcode,
    environment: json.environment || {},
    summary: { passed, failed, skipped, errors, total },
    tests: normalizedTests,
    raw: json
  }
}

function deriveProject(filename) {
  // Strip path and extension, use first segment before underscore/dash as project
  const base = filename.replace(/^.*[\\/]/, '').replace(/\.json$/i, '')
  return base.split(/[-_]/)[0] || base
}

function normalizeTest(t) {
  const phases = ['setup', 'call', 'teardown']
  let duration = 0
  let longrepr = null
  let crashMessage = null
  let traceback = null

  for (const phase of phases) {
    if (t[phase]) {
      duration += t[phase].duration || 0
      if (t[phase].longrepr && !longrepr) {
        longrepr = t[phase].longrepr
      }
    }
  }

  if (longrepr) {
    if (typeof longrepr === 'string') {
      crashMessage = longrepr
    } else if (longrepr.reprcrash) {
      crashMessage = longrepr.reprcrash.message || ''
      traceback = formatTraceback(longrepr.reprtraceback)
    }
  }

  // Derive suite from nodeid  e.g. "tests/unit/test_foo.py::TestClass::test_bar"
  const parts = t.nodeid.split('::')
  const filePart = parts[0] || ''
  const suiteName = parts.length > 2 ? parts[1] : null
  const testName = parts[parts.length - 1]

  const suiteType = detectSuiteType(filePart)

  return {
    nodeid: t.nodeid,
    name: testName,
    fullName: t.nodeid,
    file: filePart,
    suite: suiteName || filePart,
    suiteType,
    outcome: t.outcome, // passed | failed | skipped | error
    duration,
    crashMessage,
    traceback,
    keywords: t.keywords || [],
    metadata: t.metadata || {}
  }
}

function detectSuiteType(filePath) {
  const lower = filePath.toLowerCase()
  if (lower.includes('e2e') || lower.includes('end_to_end') || lower.includes('functional')) return 'e2e'
  if (lower.includes('integration') || lower.includes('integ')) return 'integration'
  return 'unit'
}

function formatTraceback(reprtraceback) {
  if (!reprtraceback) return null
  if (typeof reprtraceback === 'string') return reprtraceback
  // reprtraceback has reprentries[]
  const entries = reprtraceback.reprentries || []
  return entries
    .map((e) => {
      const lines = (e.lines || []).join('\n')
      const where = e.reprfileloc
        ? `  ${e.reprfileloc.path}:${e.reprfileloc.lineno} in ${e.reprfileloc.message}`
        : ''
      return [lines, where].filter(Boolean).join('\n')
    })
    .join('\n\n')
}
