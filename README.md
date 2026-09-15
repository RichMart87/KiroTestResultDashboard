# Test Results Dashboard

A Vue 3 + Vite dashboard for visualizing pytest test results. Drop in JSON report files and get instant insights.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

- **Summary cards** — pass/fail/skip/error counts with pass rate bar
- **Charts** — pass/fail trend, pass rate over time, run duration (Chart.js, 24h/7d/30d/custom presets)
- **Flaky test detection** — identifies tests with inconsistent pass/fail rates across runs
- **Failure streak indicator** — shows consecutive failure count per test
- **Slowest tests table** — top 10 slowest tests across all runs
- **Suite breakdown** — unit / integration / e2e split with per-file stats
- **Run comparison** — side-by-side diff of two runs with status change table
- **Test detail modal** — full error message, stack trace, flaky history
- **Search & filter** — by project, status, suite type, date range, test name
- **Export to Excel** — summary, test results, and flaky tests sheets via ExcelJS
- **Sample data** — built-in demo data to explore the UI immediately

## Requirements

- [Node.js](https://nodejs.org/) 18+
- npm 9+

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open http://localhost:5173

## Building for Production

```bash
npm run build
```

The output is placed in `dist/`. Serve it with any static file host or run a local preview:

```bash
npm run preview
```

## Auto-loading Reports

On startup the app fetches `public/data/index.json` and loads every report listed in it. To add your own reports:

1. Copy your `.json` report files into `public/data/`
2. Add their filenames to `public/data/index.json`:

```json
{
  "reports": [
    "backend-report-2026-05-10.json",
    "backend-report-2026-05-11.json",
    "api-report-2026-05-11.json"
  ]
}
```

The app fetches each file in order and skips any that are missing or malformed. If the manifest is absent or empty, the app falls back to the drag-and-drop interface.

> **Note:** `public/data/run_*.json` files are excluded from source control via `.gitignore` because pytest-json-report embeds the local `root` path of the machine that ran the tests. Never commit real run data — use the drag-and-drop interface or populate `public/data/` locally.

## Generating Reports

Install the pytest plugin:

```bash
pip install pytest-json-report
```

Run your tests:

```bash
pytest --json-report --json-report-file=report.json
```

Drop the `.json` files into the dashboard's drop zone. Multiple files are supported — one file per test run.

## Project Structure

```
src/
  components/
    charts/          # Chart.js chart components
    views/           # Dashboard, Tests, Suites, Compare views
    DropZone.vue     # File drop/browse UI
    FilterBar.vue    # Global filter controls
    FlakyTestsTable.vue
    SlowestTestsTable.vue
    SummaryCards.vue
    TestDetailModal.vue
    RunsList.vue
    RunSummaryCard.vue
  composables/
    useStore.js      # Central reactive state + computed
  utils/
    parseReport.js   # pytest-json-report parser
    flakyDetection.js
    exportExcel.js
    datePresets.js
    sampleData.js    # Demo data generator
public/
  data/
    index.json       # Manifest of reports to auto-load (committed)
    run_*.json       # Your local run files (gitignored)
```

## Tech Stack

| Package | Role |
|---|---|
| [Vue 3](https://vuejs.org/) | UI framework |
| [Vite](https://vitejs.dev/) | Build tool |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Chart.js](https://www.chartjs.org/) + [vue-chartjs](https://vue-chartjs.org/) | Charts |
| [ExcelJS](https://github.com/exceljs/exceljs) + [file-saver](https://github.com/eligrey/FileSaver.js) | Excel export |

## Contributing

Pull requests are welcome. For major changes please open an issue first to discuss what you'd like to change.

## License

[MIT](./LICENSE)
