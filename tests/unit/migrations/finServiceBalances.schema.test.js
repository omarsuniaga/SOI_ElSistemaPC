import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(__dirname, '../../..')
const migration = readFileSync(
  resolve(ROOT, 'supabase/migrations/20260823000000_fin_service_balances.sql'),
  'utf8',
)
const refreshFunction = readFileSync(
  resolve(ROOT, 'supabase/functions/refresh-service-balances/index.ts'),
  'utf8',
)
const myDayView = readFileSync(
  resolve(ROOT, 'src/portales/soi-finanzas/src/views/MyDayView.tsx'),
  'utf8',
)

describe('FIN service balances foundation', () => {
  it('creates canonical provider, account, immutable snapshot, and refresh audit records', () => {
    expect(migration).toMatch(/CREATE TABLE IF NOT EXISTS public\.fin_service_providers/)
    expect(migration).toMatch(/CREATE TABLE IF NOT EXISTS public\.fin_service_accounts/)
    expect(migration).toMatch(/CREATE TABLE IF NOT EXISTS public\.fin_service_balance_snapshots/)
    expect(migration).toMatch(/CREATE TABLE IF NOT EXISTS public\.fin_service_refresh_runs/)
    expect(migration).toMatch(/UNIQUE \(service_account_id, source_snapshot_key\)/)
  })

  it('keeps browser access behind a role-checked dashboard RPC', () => {
    expect(migration).toMatch(/get_user_role\(\) IN \('admin', 'superadmin', 'finanzas'\)/)
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.fn_fin_service_dashboard\(\)/)
    expect(migration).toMatch(/SECURITY DEFINER/)
    expect(migration).toMatch(/REVOKE ALL ON TABLE public\.fin_service_providers/)
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.fn_fin_service_dashboard\(\) TO authenticated/)
  })

  it('uses a backend lease and never places provider secrets in schema or connector code', () => {
    expect(migration).toMatch(/fn_fin_acquire_service_refresh_lock/)
    expect(refreshFunction).toMatch(/connector_unconfigured/)
    expect(refreshFunction).toMatch(/cepm: unsupportedConnector\('CEPM'\)/)
    expect(refreshFunction).not.toMatch(/CEPM_API_(KEY|TOKEN|PASSWORD)/)
    expect(migration).not.toMatch(/CEPM_API_(KEY|TOKEN|PASSWORD)/)
  })

  it('removes hardcoded CEPM monetary cards from the authoritative dashboard area', () => {
    expect(myDayView).not.toMatch(/formatDOP\(3620000\)/)
    expect(myDayView).toMatch(/authoritativeServiceBalances/)
    expect(myDayView).toMatch(/Sin balance confirmado por el proveedor/)
  })
})
