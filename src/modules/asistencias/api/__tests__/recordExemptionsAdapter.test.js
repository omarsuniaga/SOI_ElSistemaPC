import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => { vi.resetModules(); vi.stubEnv('VITE_USE_MOCK', 'true') })
describe('exoneración administrativa en Demo', () => {
  it('crea, lista y revoca conservando la evidencia original', async () => {
    const api = await import('../recordExemptionsAdapter.js')
    const saved = await api.createRecordExemption({ claseId: 'c', maestroId: 'm', fecha: '2026-09-29', alcance: 'ambos', motivo: 'Incidencia de registro verificada' })
    expect(await api.listRecordExemptions('m', '2026-09-01', '2026-09-30')).toHaveLength(1)
    await expect(api.createRecordExemption({ claseId: 'c', maestroId: 'm', fecha: '2026-09-29', alcance: 'ambos', motivo: 'Otra exoneración duplicada' })).rejects.toThrow('Ya existe')
    await api.revokeRecordExemption(saved.id, 'Contenido localizado posteriormente')
    const [record] = await api.listRecordExemptions('m', '2026-09-01', '2026-09-30')
    expect(record.motivo).toBe(saved.motivo)
    expect(record.motivo_revocacion).toBe('Contenido localizado posteriormente')
    expect(record.revocado_en).toBeTruthy()
  })
  it('rechaza motivos vacíos y alcances inválidos', async () => {
    const api = await import('../recordExemptionsAdapter.js')
    await expect(api.createRecordExemption({ motivo: ' ', alcance: 'ambos' })).rejects.toThrow('motivo')
    await expect(api.createRecordExemption({ motivo: 'Un motivo suficientemente largo', alcance: 'inventado' })).rejects.toThrow('Alcance')
  })
})
