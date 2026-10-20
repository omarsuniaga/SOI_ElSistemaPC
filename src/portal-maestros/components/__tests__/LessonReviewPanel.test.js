import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLessonReviewPanel } from '../LessonReviewPanel.js'
const roster = [{ id: 'a', nombre: 'Ana Pérez' }, { id: 'b', nombre: 'Beto López' }]
describe('LessonReviewPanel', () => {
  let host, panel, confirm, attendance, content
  beforeEach(() => {
    host = document.createElement('div'); document.body.appendChild(host)
    confirm = vi.fn(async () => true)
    attendance = { a: 'P', b: 'A' }
    content = 'Practicamos escala de Sol.'
    panel = createLessonReviewPanel(host, {
      getAlumnos: () => roster, getEstado: () => attendance, getContent: () => content, onConfirm: confirm,
    })
    panel.open({ original: content, blocks: [{ source: content, text: content, kind: 'contenido', scope: 'presentes', studentIds: [] }] })
  })
  afterEach(() => { panel.destroy(); host.remove() })
  it('does not apply proposals before confirmation or include absent recipients', () => {
    expect(confirm).not.toHaveBeenCalled()
    expect(host.querySelector('[data-lr-student][value="a"]')).toBeTruthy()
    expect(host.querySelector('[data-lr-student][value="b"]')).toBeNull()
  })
  it('confirms corrected content and requests the existing ratings flow', async () => {
    host.querySelector('textarea').value = 'Practicamos la escala de Sol.'
    host.querySelector('[data-lr-evaluate]').click()
    await vi.waitFor(() => expect(confirm).toHaveBeenCalledWith({
      dsl: '#todos [Practicamos la escala de Sol.]', original: content, evaluate: true,
    }))
  })
  it('requires resolving an ambiguous student selection', async () => {
    const select = host.querySelector('[data-lr-scope]')
    select.value = 'seleccionar'
    select.dispatchEvent(new Event('change', { bubbles: true }))
    host.querySelector('[data-lr-apply]').click()
    await Promise.resolve()
    expect(confirm).not.toHaveBeenCalled()
    expect(host.querySelector('[data-lr-error]').textContent).toContain('Confirma')
  })
  it('rejects a proposal if attendance changed', async () => {
    attendance.b = 'P'
    host.querySelector('[data-lr-apply]').click()
    await Promise.resolve()
    expect(confirm).not.toHaveBeenCalled()
    expect(host.querySelector('[data-lr-error]').textContent).toContain('cambió')
  })
  it('rejects a proposal if dictation changed the source during review', () => {
    content += ' Arco.'
    host.querySelector('[data-lr-apply]').click()
    expect(confirm).not.toHaveBeenCalled()
    expect(host.querySelector('[data-lr-error]').textContent).toContain('cambió')
  })
  it('cancels without altering the editor', () => {
    host.querySelector('[data-lr-cancel]').click()
    expect(confirm).not.toHaveBeenCalled()
    expect(host.querySelector('section').hidden).toBe(true)
  })
})
