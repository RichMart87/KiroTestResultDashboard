import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * Export filtered test results to an Excel workbook.
 * @param {object[]} runs - array of normalized run objects
 * @param {object[]} filteredTests - flat array of { run, test } pairs
 * @param {Map} flakyMap - flaky stats map
 */
export async function exportToExcel(runs, filteredTests, flakyMap) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Test Results Dashboard'
  wb.created = new Date()

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
  const summarySheet = wb.addWorksheet('Summary')
  summarySheet.columns = [
    { header: 'Run File', key: 'filename', width: 40 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Date', key: 'date', width: 22 },
    { header: 'Duration (s)', key: 'duration', width: 14 },
    { header: 'Total', key: 'total', width: 10 },
    { header: 'Passed', key: 'passed', width: 10 },
    { header: 'Failed', key: 'failed', width: 10 },
    { header: 'Skipped', key: 'skipped', width: 10 },
    { header: 'Errors', key: 'errors', width: 10 },
    { header: 'Pass Rate %', key: 'passRate', width: 14 }
  ]
  styleHeader(summarySheet)

  for (const run of runs) {
    const { summary } = run
    summarySheet.addRow({
      filename: run.filename,
      project: run.project,
      date: run.runDate.toLocaleString(),
      duration: run.duration.toFixed(2),
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      skipped: summary.skipped,
      errors: summary.errors,
      passRate:
        summary.total > 0
          ? ((summary.passed / summary.total) * 100).toFixed(1)
          : '0.0'
    })
  }

  // ── Sheet 2: Test Results ─────────────────────────────────────────────────
  const testsSheet = wb.addWorksheet('Test Results')
  testsSheet.columns = [
    { header: 'Run File', key: 'run', width: 40 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Run Date', key: 'date', width: 22 },
    { header: 'Test Name', key: 'name', width: 50 },
    { header: 'Suite', key: 'suite', width: 40 },
    { header: 'Type', key: 'suiteType', width: 14 },
    { header: 'Outcome', key: 'outcome', width: 12 },
    { header: 'Duration (s)', key: 'duration', width: 14 },
    { header: 'Flaky', key: 'flaky', width: 8 },
    { header: 'Error Message', key: 'error', width: 60 }
  ]
  styleHeader(testsSheet)

  for (const { run, test } of filteredTests) {
    const flakyInfo = flakyMap ? flakyMap.get(test.nodeid) : null
    const row = testsSheet.addRow({
      run: run.filename,
      project: run.project,
      date: run.runDate.toLocaleString(),
      name: test.fullName,
      suite: test.suite,
      suiteType: test.suiteType,
      outcome: test.outcome,
      duration: test.duration.toFixed(3),
      flaky: flakyInfo?.isFlaky ? 'Yes' : 'No',
      error: test.crashMessage || ''
    })
    colorOutcomeRow(row, test.outcome)
  }

  // ── Sheet 3: Flaky Tests ──────────────────────────────────────────────────
  if (flakyMap) {
    const flakySheet = wb.addWorksheet('Flaky Tests')
    flakySheet.columns = [
      { header: 'Test ID', key: 'nodeid', width: 60 },
      { header: 'Suite', key: 'suite', width: 40 },
      { header: 'Type', key: 'suiteType', width: 14 },
      { header: 'Total Runs', key: 'totalRuns', width: 12 },
      { header: 'Passed', key: 'passCount', width: 10 },
      { header: 'Failed', key: 'failCount', width: 10 },
      { header: 'Flaky Score', key: 'flakyScore', width: 14 }
    ]
    styleHeader(flakySheet)

    const flakyTests = [...flakyMap.values()]
      .filter((f) => f.isFlaky)
      .sort((a, b) => b.flakyScore - a.flakyScore)

    for (const f of flakyTests) {
      flakySheet.addRow({
        nodeid: f.nodeid,
        suite: f.suite,
        suiteType: f.suiteType,
        totalRuns: f.totalRuns,
        passCount: f.passCount,
        failCount: f.failCount,
        flakyScore: (f.flakyScore * 100).toFixed(1) + '%'
      })
    }
  }

  // ── Write & download ──────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  saveAs(blob, `test-results-${formatDateForFile(new Date())}.xlsx`)
}

function styleHeader(sheet) {
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  }
  headerRow.alignment = { vertical: 'middle' }
  headerRow.height = 20
}

function colorOutcomeRow(row, outcome) {
  const colors = {
    passed: 'FFD1FAE5',
    failed: 'FFFEE2E2',
    skipped: 'FFFEF3C7',
    error: 'FFFFEDD5'
  }
  const color = colors[outcome]
  if (color) {
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
      }
    })
  }
}

function formatDateForFile(date) {
  return date.toISOString().slice(0, 19).replace(/[T:]/g, '-')
}
