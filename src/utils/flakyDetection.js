/**
 * Flaky test detection.
 *
 * A test is considered flaky when it has both passed and failed outcomes
 * across multiple runs within the analysis window.
 *
 * Returns a Map<nodeid, { passCount, failCount, skipCount, totalRuns, flakyScore }>
 */
export function detectFlakyTests(runs) {
  const stats = new Map()

  for (const run of runs) {
    for (const test of run.tests) {
      if (!stats.has(test.nodeid)) {
        stats.set(test.nodeid, {
          nodeid: test.nodeid,
          name: test.name,
          suite: test.suite,
          suiteType: test.suiteType,
          passCount: 0,
          failCount: 0,
          skipCount: 0,
          errorCount: 0,
          totalRuns: 0,
          lastOutcome: null,
          streakCount: 0
        })
      }
      const s = stats.get(test.nodeid)
      s.totalRuns++
      s.lastOutcome = test.outcome
      if (test.outcome === 'passed') s.passCount++
      else if (test.outcome === 'failed') s.failCount++
      else if (test.outcome === 'skipped') s.skipCount++
      else if (test.outcome === 'error') s.errorCount++
    }
  }

  // Mark flaky: has both passes and failures, neither is 0%
  for (const [, s] of stats) {
    const relevant = s.passCount + s.failCount + s.errorCount
    if (relevant >= 2 && s.passCount > 0 && (s.failCount + s.errorCount) > 0) {
      s.isFlaky = true
      // Score 0-1: closer to 0.5 = more flaky
      s.flakyScore = 1 - Math.abs(s.passCount / relevant - 0.5) * 2
    } else {
      s.isFlaky = false
      s.flakyScore = 0
    }
  }

  return stats
}

/**
 * Compute failure streak for each test across runs (sorted oldest→newest).
 * Returns Map<nodeid, consecutiveFailures>
 */
export function computeFailureStreaks(runs) {
  const streaks = new Map()
  // runs should be sorted oldest first
  const sorted = [...runs].sort((a, b) => a.runDate - b.runDate)

  for (const run of sorted) {
    for (const test of run.tests) {
      const prev = streaks.get(test.nodeid) || 0
      if (test.outcome === 'failed' || test.outcome === 'error') {
        streaks.set(test.nodeid, prev + 1)
      } else if (test.outcome === 'passed') {
        streaks.set(test.nodeid, 0)
      }
      // skipped: keep streak unchanged
    }
  }

  return streaks
}
