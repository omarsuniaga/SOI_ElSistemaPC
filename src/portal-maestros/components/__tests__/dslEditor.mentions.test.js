import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
const roster = [
  { id: 'santa', nombre: 'Santa Isaura Castillo Diaz' },
  { id: 'gerali', nombre: 'Gerali Denisse Lugo Batista' },
]
const mocks = vi.hoisted(() => ({
  visible: false, callback: null,
  show: vi.fn(), hide: vi.fn(), options: vi.fn(), record: vi.fn(),
}))
vi.mock('../AutocompletePopup.js', () => ({
  default: { show: mocks.show, hide: mocks.hide },
  getCursorPosition: () => ({ x: 0, y: 0 }),
  isOpen: () => mocks.visible,
  handleKeyDown: vi.fn(),
}))
vi.mock('../../services/catalogService.js', () => ({
  getOptionsForTrigger: mocks.options, recordSelection: mocks.record,
}))
import { createDslEditor } from '../dslEditor.js'

describe('Student mention insertion', () => {
  let host, component, editable, innerTextDescriptor
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.visible = false
    mocks.callback = null
    mocks.options.mockResolvedValue(roster)
    mocks.show.mockImplementation((_options, callback) => { mocks.visible = true; mocks.callback = callback })
    mocks.hide.mockImplementation(() => { mocks.visible = false })
    innerTextDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText')
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
      configurable: true, get() { return this.textContent }, set(value) { this.textContent = value },
    })
    host = document.createElement('div')
    document.body.appendChild(host)
    component = createDslEditor(host, { onChange: vi.fn() })
    component.setContext({ getAlumnos: () => roster })
    editable = host.querySelector('#pm-dsl-editable')
  })
  afterEach(() => {
    component.destroy?.()
    host.remove()
    window.getSelection().removeAllRanges()
    vi.clearAllTimers()
    vi.useRealTimers()
    if (innerTextDescriptor) Object.defineProperty(HTMLElement.prototype, 'innerText', innerTextDescriptor)
    else delete HTMLElement.prototype.innerText
  })
  async function choose(option) {
    component.insertText('#', 1, '#')
    await vi.advanceTimersByTimeAsync(60)
    expect(mocks.callback).toBeTypeOf('function')
    mocks.callback(option)
    mocks.visible = false
  }

  it('reproduces the screenshot: two selected students become two independent chips in insertion order', async () => {
    await choose(roster[0])
    await choose(roster[1])
    expect([...editable.querySelectorAll('.pm-student-mention')].map(node => node.dataset.studentId))
      .toEqual(['santa', 'gerali'])
    expect(component.getValue()).toBe('#Santa Isaura Castillo Diaz #Gerali Denisse Lugo Batista ')
    expect(editable.textContent).not.toContain('##')
  })

  it('keeps typing after the most recent chip instead of before previous students', async () => {
    await choose(roster[0])
    await choose(roster[1])
    component.insertText('[Escala de Do]')
    expect(component.getValue()).toBe('#Santa Isaura Castillo Diaz #Gerali Denisse Lugo Batista [Escala de Do]')
    expect(editable.querySelectorAll('[contenteditable="false"]')).toHaveLength(2)
  })

  it('replaces the typed #query including its trigger, without leaving loose hashes', async () => {
    component.insertText('#San')
    editable.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(310)
    mocks.callback(roster[0])
    expect(component.getValue()).toBe('#Santa Isaura Castillo Diaz ')
    expect(editable.querySelectorAll('.pm-student-mention')).toHaveLength(1)
  })

  it('rehydrates saved canonical tags without changing persisted plain text', () => {
    component.setValue('#Santa Isaura Castillo Diaz [Escala]')
    expect(editable.querySelector('.pm-student-mention')?.dataset.studentId).toBe('santa')
    expect(component.getValue()).toBe('#Santa Isaura Castillo Diaz [Escala]')
  })

  it('discards stale asynchronous suggestions after the source changes', async () => {
    let resolve
    mocks.options.mockImplementationOnce(() => new Promise(done => { resolve = done }))
    component.insertText('#', 1, '#')
    await vi.advanceTimersByTimeAsync(60)
    component.setValue('Contenido nuevo')
    resolve(roster)
    await Promise.resolve()
    await Promise.resolve()
    expect(mocks.show).not.toHaveBeenCalled()
    expect(component.getValue()).toBe('Contenido nuevo')
  })

  it('does not append another pending # when the toolbar is pressed twice', async () => {
    component.insertText('#', 1, '#')
    component.insertText('#', 1, '#')
    await vi.advanceTimersByTimeAsync(60)
    expect(component.getValue()).toBe('#')
    mocks.callback(roster[0])
    expect(component.getValue()).toBe('#Santa Isaura Castillo Diaz ')
  })

  it('deletes the last tag as one unit with Backspace', async () => {
    await choose(roster[0])
    await choose(roster[1])
    editable.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
    expect(component.getValue()).toBe('#Santa Isaura Castillo Diaz ')
    expect(editable.querySelectorAll('.pm-student-mention')).toHaveLength(1)
  })

  it('keeps the caret after existing tags across blur and focus', async () => {
    await choose(roster[0])
    editable.blur()
    await choose(roster[1])
    expect(component.getValue()).toBe('#Santa Isaura Castillo Diaz #Gerali Denisse Lugo Batista ')
  })

  it('cancels pending work on destruction', async () => {
    component.insertText('#', 1, '#')
    expect(component.destroy).toBeTypeOf('function')
    component.destroy()
    await vi.advanceTimersByTimeAsync(400)
    expect(mocks.show).not.toHaveBeenCalled()
  })
})
