import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createDslToolbar } from '../dslToolbar.js'

describe('Observation toolbar', () => {
  let container, toolbar
  function mount(options = {}) {
    toolbar = createDslToolbar(container, {
      onInsert: vi.fn(), getEditorContent: () => 'Escala de Sol', ...options,
    })
    return toolbar
  }
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })
  afterEach(() => {
    toolbar?.destroy()
    container.remove()
    document.getElementById('pm-toolbar-help-modal')?.remove()
  })

  it('keeps four token tools and removes the three crossed-out controls', () => {
    mount()
    expect([...container.querySelectorAll('[data-token]')].map(b => b.dataset.token))
      .toEqual(['alumno', 'contenido', 'sugerencia', 'tarea'])
    expect(container.querySelector('[data-token="medida"]')).toBeNull()
    expect(container.querySelector('[data-token="objetivo"]')).toBeNull()
    expect(container.querySelector('#btn-snippets')).toBeNull()
    expect(container.querySelector('#btn-generar-informe')).toBeNull()
  })

  it.each([
    ['alumno', '#', '#'], ['contenido', '[]', '['],
    ['sugerencia', '()', '('], ['tarea', '{}', '{'],
  ])('preserves token insertion for %s', (token, text, trigger) => {
    const onInsert = vi.fn()
    mount({ onInsert })
    container.querySelector('[data-token="' + token + '"]').click()
    expect(onInsert).toHaveBeenCalledWith(text, 1, trigger)
  })

  it('uses a compact AI label and an accessible full name', () => {
    mount()
    const button = container.querySelector('#btn-analizar-progreso')
    expect(button.textContent).toBe('✨ IA')
    expect(button.getAttribute('aria-label')).toBe('Analizar con IA')
    expect(container.querySelector('.pm-dsl-toolbar').lastElementChild.id)
      .toBe('btn-dictar-observacion')
  })

  it('awaits analysis and restores the compact label after failure', async () => {
    let reject
    const onAnalyzeClick = vi.fn(() => new Promise((resolve, fail) => { reject = fail }))
    mount({ onAnalyzeClick })
    const button = container.querySelector('#btn-analizar-progreso')
    button.click()
    expect(onAnalyzeClick).toHaveBeenCalledWith('Escala de Sol')
    expect(button.disabled).toBe(true)
    reject(new Error('offline'))
    await Promise.resolve()
    await Promise.resolve()
    expect(button.disabled).toBe(false)
    expect(button.textContent).toBe('✨ IA')
    expect(button.getAttribute('aria-busy')).toBe('false')
  })

  it('does not analyze an empty observation', () => {
    const onAnalyzeClick = vi.fn()
    mount({ getEditorContent: () => ' ', onAnalyzeClick })
    container.querySelector('#btn-analizar-progreso').click()
    expect(onAnalyzeClick).not.toHaveBeenCalled()
  })

  it('keeps the structure action connected to the current text', () => {
    const onStructureClick = vi.fn()
    mount({ onStructureClick })
    container.querySelector('#btn-ia-magic').click()
    expect(onStructureClick).toHaveBeenCalledWith('Escala de Sol')
  })

  it('opens updated help with dictation instructions', () => {
    mount()
    container.querySelector('#btn-help').click()
    const modal = document.getElementById('pm-toolbar-help-modal')
    expect(modal.classList.contains('open')).toBe(true)
    expect(modal.textContent).toContain('Dictar observación')
    expect(modal.textContent).not.toContain('Mejorar Texto')
    modal.querySelector('#pm-help-close').click()
    expect(modal.classList.contains('open')).toBe(false)
  })

  it('releases toolbar callbacks on destruction', () => {
    const onInsert = vi.fn()
    mount({ onInsert })
    toolbar.destroy()
    container.querySelector('[data-token="alumno"]').click()
    expect(onInsert).not.toHaveBeenCalled()
  })
})
