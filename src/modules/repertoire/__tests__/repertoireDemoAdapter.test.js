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
})
