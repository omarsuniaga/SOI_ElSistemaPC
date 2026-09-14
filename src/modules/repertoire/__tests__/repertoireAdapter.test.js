import { describe, expect, it, vi } from 'vitest'
import { createRepertoireAdapter } from '../api/repertoireAdapter.js'

function clientFor(data = { id: 'row-1' }) {
  const single = vi.fn().mockResolvedValue({ data, error: null })
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ insert, select }))
  return { client: { from }, from, insert, select, single }
}

describe('repertoire adapter', () => {
  it('persists the Obra → Version → Montaje foundation through the adapter seam', async () => {
    const { client, from, insert } = clientFor()
    const adapter = createRepertoireAdapter(client)
    await adapter.createObra({ titulo: 'Sinfonía n.º 5' })
    await adapter.createVersion({ obra_id: 'obra-1', nombre: 'Edición de estudio' })
    await adapter.createMontaje({ obra_version_id: 'version-1', evento_id: 'evento-1', fecha_inicio: '2026-10-01', fecha_objetivo: '2026-12-18' })
    expect(from).toHaveBeenCalledTimes(3)
    expect(insert).toHaveBeenNthCalledWith(1, { titulo: 'Sinfonía n.º 5' })
    expect(insert).toHaveBeenNthCalledWith(3, expect.objectContaining({ estado: 'PLANIFICADO', evento_id: 'evento-1' }))
  })

  it('rejects invalid state and incomplete foundation records before persistence', async () => {
    const { client, from } = clientFor()
    const adapter = createRepertoireAdapter(client)
    await expect(adapter.createObra({ titulo: '' })).rejects.toThrow('título')
    await expect(adapter.createMontaje({ obra_version_id: 'v1', estado: 'INVALIDO' })).rejects.toThrow('estado inválido')
    expect(from).not.toHaveBeenCalled()
  })

  it('rejects forged row mutation outside the assigned fila scope', async () => {
    const { client, from } = clientFor()
    const adapter = createRepertoireAdapter(client, { editableFilaIds: ['flauta'] })
    await expect(adapter.updateRowPreparation('measure-1', 'DOMINADO', { filaId: 'oboe' })).rejects.toThrow('alcance editable')
    expect(from).not.toHaveBeenCalled()
  })
})
