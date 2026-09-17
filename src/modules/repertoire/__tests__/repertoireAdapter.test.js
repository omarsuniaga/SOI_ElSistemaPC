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

  it('records session repertoire context through the existing session boundary', async () => {
    const { client, insert } = clientFor({ id: 'work-1' })
    const adapter = createRepertoireAdapter(client)
    const work = await adapter.createSessionRepertoireWork({ sessionId: 'session-1', montajeId: 'montaje-1', createdBy: 'maestro-1', measureIds: ['20', '21'], focusTags: ['RITMO'] })
    expect(work.measureIds).toEqual(['20', '21'])
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ sesion_id: 'session-1', montaje_id: 'montaje-1', focus_tags: ['RITMO'] }))
  })

  it('exposes the explicit fila-assignment lifecycle through the real adapter seam', () => {
    const { client } = clientFor()
    const adapter = createRepertoireAdapter(client)
    expect(adapter.listFilaAssignments).toEqual(expect.any(Function))
    expect(adapter.createFilaAssignment).toEqual(expect.any(Function))
    expect(adapter.updateFilaAssignment).toEqual(expect.any(Function))
    expect(adapter.archiveFilaAssignment).toEqual(expect.any(Function))
  })
})

describe('repertoire adapter · identidad del compás', () => {
  /**
   * El id que la vista tiene de un compás es el de `montaje_compases` —así lo
   * arma `listMontajes` al fusionar la fila de la obra con su estado— y es el
   * que espera el RPC. El adaptador, en cambio, lo buscaba en `obra_compases`,
   * donde ese id no existe: `.single()` fallaba y toda edición moría antes de
   * salir a la red, con el mensaje "No se pudo guardar; se revirtió".
   */
  it('no busca el compás en obra_compases cuando ya sabe el montaje', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { affected: 1 }, error: null })
    const from = vi.fn(() => { throw new Error('no debe consultar tablas para esto') })
    const adapter = createRepertoireAdapter({ from, rpc }, { actorId: 'maestro-1' })

    await adapter.updateMeasureState('montaje-compas-1', 'DOMINADO', { montageId: 'montaje-1', filaId: 'fila-1' })

    expect(from).not.toHaveBeenCalled()
    expect(rpc).toHaveBeenCalledWith('fn_repertoire_update_preparation', expect.objectContaining({
      p_montage_id: 'montaje-1',
      p_measure_id: 'montaje-compas-1',
      p_new_state: 'DOMINADO',
      p_fila_id: 'fila-1',
      p_scope: 'collective',
    }))
  })

  it('resuelve el montaje desde montaje_compases cuando no se lo pasan', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { affected: 1 }, error: null })
    const single = vi.fn().mockResolvedValue({ data: { montaje_id: 'montaje-9' }, error: null })
    const eq = vi.fn(() => ({ single }))
    const select = vi.fn(() => ({ eq }))
    const from = vi.fn(() => ({ select }))
    const adapter = createRepertoireAdapter({ from, rpc }, { actorId: 'maestro-1' })

    await adapter.updateMeasureState('montaje-compas-2', 'CONSOLIDADO')

    expect(from).toHaveBeenCalledWith('montaje_compases')
    expect(rpc).toHaveBeenCalledWith('fn_repertoire_update_preparation', expect.objectContaining({ p_montage_id: 'montaje-9' }))
  })
})

describe('repertoire adapter · aplicabilidad', () => {
  /**
   * La aplicabilidad (TOCA / TACET / SILENCIO) es lo que decide si un compás
   * muestra su estado de preparación o se pinta como ajeno a la fila. El RPC
   * autoriza a la misma fila asignada que la preparación, pero el adaptador
   * nunca declaraba la capacidad: el maestro veía "Aplicabilidad: solo lectura"
   * y la rejilla entera quedaba atrapada en "Desconocido".
   */
  it('no ofrece editar aplicabilidad sin filas asignadas', () => {
    const adapter = createRepertoireAdapter({ from: vi.fn() }, { actorId: 'maestro-1' })
    expect(adapter.canEditApplicability).toBe(false)
  })

  it('la ofrece cuando el maestro tiene una fila editable', () => {
    const adapter = createRepertoireAdapter({ from: vi.fn() }, { actorId: 'maestro-1', editableFilaIds: ['fila-1'] })
    expect(adapter.canEditApplicability).toBe(true)
  })

  it('manda la fila al RPC de aplicabilidad', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 'TOCA', error: null })
    const adapter = createRepertoireAdapter({ from: vi.fn(), rpc }, { actorId: 'maestro-1', editableFilaIds: ['fila-1'] })

    await adapter.updateMeasureApplicability('compas-1', 'TOCA', { montageId: 'montaje-1', filaId: 'fila-1' })

    expect(rpc).toHaveBeenCalledWith('fn_repertoire_update_applicability', {
      p_montage_id: 'montaje-1', p_measure_id: 'compas-1', p_applicability: 'TOCA', p_fila_id: 'fila-1',
    })
  })
})
