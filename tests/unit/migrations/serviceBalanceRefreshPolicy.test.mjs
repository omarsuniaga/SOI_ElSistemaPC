import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_REFRESH_MIN_INTERVAL_SECONDS,
  getRefreshIntervalDecision,
  getRefreshMinIntervalSeconds,
} from '../../../supabase/functions/refresh-service-balances/refreshPolicy.js'

test('uses a bounded server-side refresh interval', () => {
  assert.equal(getRefreshMinIntervalSeconds(undefined), DEFAULT_REFRESH_MIN_INTERVAL_SECONDS)
  assert.equal(getRefreshMinIntervalSeconds('300'), 300)
  assert.equal(getRefreshMinIntervalSeconds('1'), DEFAULT_REFRESH_MIN_INTERVAL_SECONDS)
  assert.equal(getRefreshMinIntervalSeconds('90000'), DEFAULT_REFRESH_MIN_INTERVAL_SECONDS)
})

test('skips sequential refreshes until the per-account interval expires', () => {
  const now = Date.parse('2026-08-23T12:10:00.000Z')
  assert.deepEqual(getRefreshIntervalDecision('2026-08-23T12:00:00.000Z', 900, now), {
    allowed: false,
    retryAfterSeconds: 300,
  })
  assert.deepEqual(getRefreshIntervalDecision('2026-08-23T11:55:00.000Z', 900, now), {
    allowed: true,
    retryAfterSeconds: 0,
  })
})
