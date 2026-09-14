import { describe, expect, it, vi } from 'vitest'
import { renderSessionRepertoirePanel } from '../SessionRepertoirePanel.js'

describe('SessionRepertoirePanel', () => {
  it('records multiple work items through the stable adapter and keeps preparation separate', async () => {
    const container = document.createElement('main')
    const create = vi.fn().mockResolvedValue({ id: 'work-1' })
    const addMeasures = vi.fn().mockResolvedValue([])
    const panel = renderSessionRepertoirePanel(container, { sessionId: 'session-1', adapter: { createSessionRepertoireWork: create, addSessionRepertoireWorkMeasures: addMeasures }, montajeOptions: [{ id: 'm-1', obra: { titulo: 'Tchaikovsky' }, filas: [{ id: 'f-1', nombre: 'Violín I' }] }] })
    const form = container.querySelector('form')
    const montajeSelect = form.querySelector('[name="montajeId"]')
    montajeSelect.value = 'm-1'
    montajeSelect.dispatchEvent(new Event('change'))
    form.querySelector('[name="filaId"]').value = 'f-1'
    form.querySelector('[name="measureIds"]').value = '20-22'
    form.querySelector('[value="AFINACION"]').checked = true
    form.querySelector('[value="ARTICULACION"]').checked = true
    form.querySelector('[name="notes"]').value = 'Mejoró la afinación; revisar ataques.'
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(create).toHaveBeenCalled())
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ sessionId: 'session-1', measureIds: ['20', '21', '22'], focusTags: ['AFINACION', 'ARTICULACION'] }))
    await vi.waitFor(() => expect(addMeasures).toHaveBeenCalledWith('work-1', ['20', '21', '22']))
    expect(panel.getRecords()[0].preparationMutation).toBeUndefined()
  })

  it('supports a session without repertoire without breaking the existing editor', () => {
    const container = document.createElement('main')
    renderSessionRepertoirePanel(container, { sessionId: null, adapter: {} })
    expect(container.textContent).toContain('Guarde o abra una sesión existente')
  })
})
