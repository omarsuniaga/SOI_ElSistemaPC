import { describe, expect, it } from 'vitest'
import { createRepertoireDemoAdapter } from '../demo/repertoireDemoAdapter.js'

describe('repertoire demo passage and linked-group operations', () => {
  it('creates, edits and archives a non-contiguous passage', async () => {
    const adapter = createRepertoireDemoAdapter()
    const passage = await adapter.createPassage({ name: 'Patrón de corcheas', difficulty: 3, focusTags: ['RITMO', 'ARTICULACION'], measureIds: ['1', '4', '8', '16'] })
    expect(passage.measureIds).toEqual(['1', '4', '8', '16'])
    expect((await adapter.updatePassage(passage.id, { description: 'Entrada' })).description).toBe('Entrada')
    expect((await adapter.archivePassage(passage.id)).archived_at).toBeTruthy()
  })

  it('supports linked membership removal and breaking the group', async () => {
    const adapter = createRepertoireDemoAdapter()
    const group = await adapter.createLinkedGroup({ nombre: 'Patrón A' })
    await adapter.addLinkedMeasures(['1', '4', '8', '16'].map((montaje_compas_id) => ({ grupo_id: group.id, montaje_compas_id })))
    await adapter.removeLinkedMeasure(group.id, '16')
    expect(await adapter.renameLinkedGroup(group.id, 'Patrón B')).toMatchObject({ nombre: 'Patrón B', measureIds: ['1', '4', '8'] })
    expect((await adapter.breakLinkedGroup(group.id)).measureIds).toEqual(['1', '4', '8'])
  })

  it('updates all linked measures deterministically', async () => {
    const adapter = createRepertoireDemoAdapter()
    const montage = (await adapter.listMontajes())[0]
    const group = await adapter.createLinkedGroup({ nombre: 'Patrón A' })
    await adapter.addLinkedMeasures(['demo-compas-1', 'demo-compas-4'].map((montaje_compas_id) => ({ grupo_id: group.id, montaje_compas_id })))
    expect(await adapter.updateLinkedGroupState(group.id, 'DOMINADO')).toEqual({ affected: 2 })
    expect(montage.compases[0].estado_preparacion).not.toBe('DOMINADO')
    expect((await adapter.listMontajes())[0].compases.slice(0, 4).map((item) => item.estado_preparacion)).toEqual(['DOMINADO', 'SIN_ESTUDIAR', 'CON_DIFICULTAD', 'DOMINADO'])
  })

  it('keeps session work history queryable in both directions and observation context optional', async () => {
    const adapter = createRepertoireDemoAdapter()
    const first = await adapter.createSessionRepertoireWork({ sessionId: 'session-1', montajeId: 'montaje-1', filaId: 'fila-1', passageId: 'passage-1', createdBy: 'maestro-1', measureIds: ['20', '21'], focusTags: ['AFINACION'] })
    await adapter.addSessionRepertoireWorkMeasures(first.id, ['20', '21'])
    const second = await adapter.createSessionRepertoireWork({ sessionId: 'session-1', montajeId: 'montaje-1', filaId: 'fila-1', createdBy: 'maestro-1', measureIds: ['72', '76'], focusTags: ['RITMO'] })
    await adapter.addSessionRepertoireWorkMeasures(second.id, ['72', '76'])
    await adapter.linkObservationToSessionRepertoire('observation-1', first.id)
    expect(await adapter.historyBySession('session-1')).toHaveLength(2)
    expect(await adapter.historyByMontaje('montaje-1')).toHaveLength(2)
    expect(await adapter.historyByFila('montaje-1', 'fila-1')).toHaveLength(2)
    expect(await adapter.historyByPassage('passage-1')).toHaveLength(1)
    expect(await adapter.historyByMeasureRange('montaje-1', 'fila-1', ['72', '76'])).toHaveLength(1)
  })
})
