import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createObservationDictation } from '../observationDictation.js'

describe('Observation dictation', () => {
  let button, status, controller, onInsert, instances
  const result = (text, isFinal = true) => Object.assign([{ transcript: text }], { isFinal })
  beforeEach(() => {
    instances = []
    class Recognition {
      constructor() {
        instances.push(this)
        this.start = vi.fn()
        this.stop = vi.fn()
        this.abort = vi.fn()
      }
    }
    vi.stubGlobal('SpeechRecognition', Recognition)
    button = document.createElement('button')
    status = document.createElement('p')
    document.body.append(button, status)
    onInsert = vi.fn()
    controller = createObservationDictation(button, status, {
      onInsert, getEditorContent: () => 'Contenido previo.',
    })
  })
  afterEach(() => {
    controller.destroy()
    button.remove()
    status.remove()
    vi.unstubAllGlobals()
  })

  it('starts only after a click, in Spanish, with visible listening state', () => {
    expect(instances).toHaveLength(0)
    button.click()
    const recognition = instances[0]
    expect(recognition.lang).toBe('es-DO')
    expect(recognition.start).toHaveBeenCalledTimes(1)
    recognition.onstart()
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(status.textContent).toContain('Escuchando')
  })

  it('shows interim text live and inserts final text once without repeated indexes', () => {
    button.click()
    const recognition = instances[0]
    expect(recognition.interimResults).toBe(true)
    recognition.onstart()
    recognition.onresult({ resultIndex: 0, results: [result('Escala', false)] })
    expect(onInsert).not.toHaveBeenCalled()
    expect(status.textContent).toContain('«Escala»')
    recognition.onresult({ resultIndex: 0, results: [result('Escala de Sol')] })
    recognition.onresult({ resultIndex: 0, results: [result('Escala de Sol'), result('Arco recto')] })
    expect(onInsert.mock.calls).toEqual([[' Escala de Sol '], [' Arco recto ']])
  })

  it('waits for final results when stopped and permits another dictation', () => {
    button.click()
    const recognition = instances[0]
    button.click()
    expect(recognition.stop).toHaveBeenCalledTimes(1)
    expect(button.disabled).toBe(true)
    recognition.onresult({ resultIndex: 0, results: [result('Última frase')] })
    recognition.onend()
    expect(onInsert).toHaveBeenCalledWith(' Última frase ')
    expect(button.disabled).toBe(false)
    expect(button.getAttribute('aria-pressed')).toBe('false')
    button.click()
    expect(instances).toHaveLength(2)
  })

  it('keeps listening after the browser ends the session on silence, until the user stops', () => {
    button.click()
    instances[0].onstart()
    instances[0].onend()
    expect(instances).toHaveLength(2)
    expect(instances[1].start).toHaveBeenCalledTimes(1)
    instances[1].onstart()
    button.click()
    instances[1].onend()
    expect(instances).toHaveLength(2)
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  it('does not restart after an error', () => {
    button.click()
    instances[0].onerror({ error: 'not-allowed' })
    expect(instances).toHaveLength(1)
  })

  it('explains denied microphone permission and can retry', () => {
    button.click()
    instances[0].onerror({ error: 'not-allowed' })
    expect(status.textContent).toContain('Permite el acceso')
    expect(instances[0].abort).toHaveBeenCalled()
    expect(button.disabled).toBe(false)
    button.click()
    expect(instances).toHaveLength(2)
  })

  it('explains the keyboard fallback if recognition is unavailable', () => {
    vi.stubGlobal('SpeechRecognition', undefined)
    vi.stubGlobal('webkitSpeechRecognition', undefined)
    button.click()
    expect(status.textContent).toContain('micrófono del teclado')
    expect(onInsert).not.toHaveBeenCalled()
  })

  it('supports prefixed browser recognition', () => {
    const Recognition = window.SpeechRecognition
    vi.stubGlobal('SpeechRecognition', undefined)
    vi.stubGlobal('webkitSpeechRecognition', Recognition)
    button.click()
    expect(instances).toHaveLength(1)
  })

  it('recovers when starting recognition throws', () => {
    const start = vi.fn(() => { throw new Error('blocked') })
    vi.stubGlobal('SpeechRecognition', class { start = start; abort = vi.fn() })
    button.click()
    expect(start).toHaveBeenCalled()
    expect(button.disabled).toBe(false)
    expect(status.textContent).toContain('No se pudo activar')
  })

  it('aborts and ignores late results when unmounted', () => {
    button.click()
    const recognition = instances[0]
    const lateResult = recognition.onresult
    controller.destroy()
    lateResult({ resultIndex: 0, results: [result('No insertar')] })
    expect(recognition.abort).toHaveBeenCalled()
    expect(onInsert).not.toHaveBeenCalled()
    button.click()
    expect(instances).toHaveLength(1)
  })

  it('stops on pagehide and ignores detached editors', () => {
    button.click()
    const recognition = instances[0]
    button.remove()
    recognition.onresult({ resultIndex: 0, results: [result('Otra clase')] })
    expect(onInsert).not.toHaveBeenCalled()
    window.dispatchEvent(new Event('pagehide'))
    expect(recognition.abort).toHaveBeenCalled()
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })
})
