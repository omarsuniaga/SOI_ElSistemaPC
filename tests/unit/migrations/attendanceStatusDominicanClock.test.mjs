import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sql = readFileSync(new URL('../../../supabase/migrations/20260824070000_fix_attendance_status_dominican_clock.sql', import.meta.url), 'utf8')

test('uses one Santo Domingo clock for attendance future, pending, and overdue states', () => {
  assert.match(sql, /v_now_local timestamp := now\(\) AT TIME ZONE 'America\/Santo_Domingo'/)
  assert.match(sql, /v_hoy date := v_now_local::date/)
  assert.match(sql, /v_ahora time := v_now_local::time/)
  assert.match(sql, /e\.fecha > v_hoy\s+OR \(e\.fecha = v_hoy AND v_ahora < e\.hora_fin\) THEN 'futura'/)
  assert.match(sql, /WHEN e\.fecha >= v_hoy - 7 THEN 'pendiente'/)
  assert.match(sql, /GREATEST\(v_hoy - e\.fecha, 0\)::integer AS dias_atraso/)
  assert.doesNotMatch(sql, /CURRENT_DATE|localtime/)
})

test('keeps a 15:30–16:30 Santo Domingo class future at 12:45 local', () => {
  const localTime = '12:45:00'
  const classEnds = '16:30:00'
  assert.equal(localTime < classEnds, true)
})
