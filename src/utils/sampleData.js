/**
 * Generates realistic sample pytest-json-report data for demo purposes.
 */

const PROJECTS = ['backend', 'frontend', 'api']
const SUITE_TYPES = ['unit', 'integration', 'e2e']
const SUITE_FILES = {
  unit: ['tests/unit/test_auth.py', 'tests/unit/test_models.py', 'tests/unit/test_utils.py'],
  integration: ['tests/integration/test_db.py', 'tests/integration/test_api.py'],
  e2e: ['tests/e2e/test_login_flow.py', 'tests/e2e/test_checkout.py']
}
const TEST_NAMES = {
  'tests/unit/test_auth.py': ['test_login_valid', 'test_login_invalid', 'test_token_expiry', 'test_refresh_token', 'test_logout'],
  'tests/unit/test_models.py': ['test_user_create', 'test_user_update', 'test_user_delete', 'test_product_create', 'test_order_create'],
  'tests/unit/test_utils.py': ['test_format_date', 'test_parse_json', 'test_validate_email', 'test_hash_password'],
  'tests/integration/test_db.py': ['test_connection', 'test_transaction_rollback', 'test_bulk_insert', 'test_query_performance'],
  'tests/integration/test_api.py': ['test_get_users', 'test_post_user', 'test_delete_user', 'test_rate_limiting'],
  'tests/e2e/test_login_flow.py': ['test_full_login', 'test_sso_login', 'test_mfa_flow'],
  'tests/e2e/test_checkout.py': ['test_add_to_cart', 'test_checkout_flow', 'test_payment_processing']
}

const ERRORS = [
  { msg: 'AssertionError: assert 200 == 401', trace: 'tests/unit/test_auth.py:45\n  assert response.status_code == 401\nAssertionError: assert 200 == 401' },
  { msg: 'ConnectionRefusedError: [Errno 111] Connection refused', trace: 'tests/integration/test_db.py:12\n  conn = db.connect()\nConnectionRefusedError: [Errno 111] Connection refused' },
  { msg: 'TimeoutError: Element not found within 10s', trace: 'tests/e2e/test_login_flow.py:33\n  page.wait_for_selector("#submit")\nTimeoutError: Element not found within 10s' },
  { msg: 'ValueError: Invalid email format', trace: 'tests/unit/test_utils.py:22\n  validate_email("not-an-email")\nValueError: Invalid email format' }
]

function randomOutcome(flakyChance = 0.1) {
  const r = Math.random()
  if (r < flakyChance) return Math.random() > 0.5 ? 'failed' : 'passed'
  if (r < 0.82) return 'passed'
  if (r < 0.92) return 'failed'
  if (r < 0.97) return 'skipped'
  return 'error'
}

function makeTest(file, name, runIndex) {
  // Some tests are consistently flaky
  const flakyTests = ['test_rate_limiting', 'test_payment_processing', 'test_mfa_flow']
  const isFlaky = flakyTests.includes(name)
  const outcome = isFlaky ? randomOutcome(0.45) : randomOutcome(0.08)
  const duration = Math.random() * (file.includes('e2e') ? 8 : file.includes('integration') ? 2 : 0.5)
  const error = (outcome === 'failed' || outcome === 'error')
    ? ERRORS[Math.floor(Math.random() * ERRORS.length)]
    : null

  const parts = [file, name]
  return {
    nodeid: parts.join('::'),
    outcome,
    duration,
    keywords: [name, file.split('/')[1]],
    setup: { duration: 0.001, outcome: 'passed' },
    call: {
      duration,
      outcome,
      longrepr: error
        ? { reprcrash: { message: error.msg }, reprtraceback: error.trace }
        : null
    },
    teardown: { duration: 0.001, outcome: 'passed' }
  }
}

function makeRun(daysAgo, project) {
  const tests = []
  for (const [file, names] of Object.entries(TEST_NAMES)) {
    for (const name of names) {
      tests.push(makeTest(file, name, daysAgo))
    }
  }

  const passed = tests.filter((t) => t.outcome === 'passed').length
  const failed = tests.filter((t) => t.outcome === 'failed').length
  const skipped = tests.filter((t) => t.outcome === 'skipped').length
  const error = tests.filter((t) => t.outcome === 'error').length
  const total = tests.length
  const duration = tests.reduce((s, t) => s + t.duration, 0) + Math.random() * 5

  const now = Date.now()
  const created = (now - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600000) / 1000

  return {
    created,
    duration,
    exitcode: failed + error > 0 ? 1 : 0,
    root: `/home/ci/projects/${project}`,
    environment: { project, python: '3.11.0', platform: 'linux' },
    summary: { passed, failed, skipped, error, total },
    tests
  }
}

export function generateSampleData() {
  const files = []
  const now = Date.now()

  // Generate 15 runs over 30 days across 2 projects
  const schedule = [
    { days: 0.1, project: 'backend' },
    { days: 0.5, project: 'api' },
    { days: 1, project: 'backend' },
    { days: 1.5, project: 'api' },
    { days: 2, project: 'backend' },
    { days: 3, project: 'backend' },
    { days: 4, project: 'api' },
    { days: 5, project: 'backend' },
    { days: 7, project: 'backend' },
    { days: 8, project: 'api' },
    { days: 10, project: 'backend' },
    { days: 14, project: 'backend' },
    { days: 20, project: 'api' },
    { days: 25, project: 'backend' },
    { days: 30, project: 'backend' }
  ]

  for (const { days, project } of schedule) {
    const json = makeRun(days, project)
    const dateStr = new Date(now - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    const filename = `${project}-report-${dateStr}.json`
    const blob = new File([JSON.stringify(json)], filename, { type: 'application/json' })
    files.push(blob)
  }

  return files
}
