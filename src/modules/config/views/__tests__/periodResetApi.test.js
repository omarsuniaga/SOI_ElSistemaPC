import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()

vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: { rpc } }))
vi.mock('../../../periodos/api/periodosApi.js', () => ({ getPeriodos: vi.fn(async () => []) }))

import {
  confirmationPhrase,
  executePeriodReset,
  preparePeriodResetBackup,
  previewPeriodReset,
} from '../../api/periodResetApi.js'

describe('periodResetApi', () => {
  beforeEach(() => rpc.mockReset())

  it('uses the exact confirmation phrase for the cutoff', () => {
    expect(confirmationPhrase('2026-08-10')).toBe('RESETEAR PERIODO 2026-08-10')
  })

  it('sends a preview without changing data', async () => {
    rpc.mockResolvedValue({ data: { run_id: 'run-1', blockers: [] }, error: null })
    await previewPeriodReset('2026-08-10', 'period-1')
    expect(rpc).toHaveBeenCalledWith('admin_preview_period_reset', {
      p_cutoff: '2026-08-10', p_target_period_id: 'period-1',
    })
  })

  it('rejects a backup response that is not ready', async () => {
    rpc.mockResolvedValue({ data: { status: 'failed', error: 'No se pudo respaldar' }, error: null })
    await expect(preparePeriodResetBackup('run-1')).rejects.toThrow('No se pudo respaldar')
  })

  it('rejects a failed execution even when the RPC transport succeeded', async () => {
    rpc.mockResolvedValue({ data: { status: 'failed', error: 'Verificación posterior fallida' }, error: null })
    await expect(executePeriodReset('run-1', 'RESETEAR PERIODO 2026-08-10'))
      .rejects.toThrow('Verificación posterior fallida')
  })

  it('accepts only a completed execution', async () => {
    rpc.mockResolvedValue({ data: { run_id: 'run-1', status: 'completed' }, error: null })
    await expect(executePeriodReset('run-1', 'RESETEAR PERIODO 2026-08-10'))
      .resolves.toMatchObject({ status: 'completed' })
  })
})
