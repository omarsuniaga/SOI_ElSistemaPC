import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseCepmPublicBalance, isValidCepmMeter } from '../../../supabase/functions/refresh-service-balances/cepmPublicBalance.js'

const fixture = readFileSync(new URL('./cepm-public-balance.fixture.html', import.meta.url), 'utf8')

test('parses CEPM server-rendered labels and normalizes quantities and Dominican dates', () => {
  const result = parseCepmPublicBalance(fixture, 'D035044532')
  assert.equal(result.balanceKwh, 18.5)
  assert.equal(result.readingKwh, 15345.6)
  assert.equal(result.suspensionThresholdKwh, 15100)
  assert.equal(result.observedAt, '2026-08-23T09:15:00-04:00')
  assert.equal(result.cutoffAt, '2026-08-26T14:30:00-04:00')
  assert.equal(result.sourceSummary.balanceRaw, '18.5kWh')
})

test('rejects invalid meter input and markup contract changes', () => {
  assert.equal(isValidCepmMeter('D035044532'), true)
  assert.equal(isValidCepmMeter('D035044532<script>'), false)
  assert.throws(() => parseCepmPublicBalance(fixture.replace('Balance</td>', 'Saldo</td>'), 'D035044532'), /markup changed/)
  assert.throws(() => parseCepmPublicBalance(fixture, 'D999999999'), /does not match/)
})
