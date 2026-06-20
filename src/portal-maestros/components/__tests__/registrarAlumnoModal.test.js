import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { registrarAlumnoModal } from '../registrarAlumnoModal.js'
import * as supabase from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

// Mock Bootstrap Modal
globalThis.bootstrap = {
  Modal: class {
    constructor() {}
    show() {}
    hide() {}
    static getInstance() {
      return {
        show: vi.fn(),
        hide: vi.fn()
      }
    }
  }
}

describe('registrarAlumnoModal', () => {
  let modal

  beforeEach(() => {
    // Clear any existing modals from DOM
    document.querySelectorAll('#registrar-alumno-modal').forEach(el => el.remove())
    modal = registrarAlumnoModal()
    vi.clearAllMocks()
  })

  afterEach(() => {
    modal.destroy()
  })

  it('should render modal structure in DOM', () => {
    const element = document.querySelector('#registrar-alumno-modal')
    expect(element).toBeTruthy()
    expect(element.querySelector('#registrar-alumno-title')).toBeTruthy()
  })

  it('should have all required form fields', () => {
    const form = document.querySelector('#registrar-alumno-form')

    expect(form.querySelector('#alumno-nombre')).toBeTruthy()
    expect(form.querySelector('#alumno-apellido')).toBeTruthy()
    expect(form.querySelector('#alumno-email')).toBeTruthy()
    expect(form.querySelector('#alumno-dni')).toBeTruthy()
    expect(form.querySelector('#alumno-estado')).toBeTruthy()
  })

  it('should show modal when show() is called', () => {
    modal.show('maestro-123')
    expect(modal.isOpen()).toBe(true)
  })

  it('should hide modal when hide() is called', () => {
    modal.show('maestro-123')
    modal.hide()
    expect(modal.isOpen()).toBe(false)
  })

  it('should focus first input when modal opens', async () => {
    const firstInput = document.querySelector('#alumno-nombre')
    modal.show('maestro-123')

    await new Promise(resolve => setTimeout(resolve, 300))

    expect(document.activeElement).toBe(firstInput)
  })

  it('should validate required fields before submission', async () => {
    modal.show('maestro-123')

    const submitBtn = document.querySelector('#btn-registrar-alumno')
    submitBtn.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    // Form should still be open if validation failed
    expect(modal.isOpen()).toBe(true)
  })

  it('should submit form with valid data', async () => {
    const mockInsert = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'alumno-123',
          nombre: 'Juan',
          apellido: 'Pérez',
          estado: 'activo'
        },
        error: null
      })
    }

    supabase.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue(mockInsert)
    })

    modal.show('maestro-123')

    // Fill in required fields
    document.querySelector('#alumno-nombre').value = 'Juan'
    document.querySelector('#alumno-apellido').value = 'Pérez'
    document.querySelector('#alumno-tlf').value = '8091234567'
    document.querySelector('#alumno-estado').value = 'activo'

    const submitBtn = document.querySelector('#btn-registrar-alumno')
    submitBtn.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(supabase.supabase.from).toHaveBeenCalledWith('alumnos')
    expect(mockInsert.select).toHaveBeenCalled()
    expect(mockInsert.single).toHaveBeenCalled()
  })

  it('should show error message on submission failure', async () => {
    const mockError = new Error('Database error')
    const mockInsert = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    }

    supabase.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue(mockInsert)
    })

    modal.show('maestro-123')

    // Fill in fields
    document.querySelector('#alumno-nombre').value = 'Juan'
    document.querySelector('#alumno-apellido').value = 'Pérez'
    document.querySelector('#alumno-tlf').value = '8091234567'
    document.querySelector('#alumno-estado').value = 'activo'

    const submitBtn = document.querySelector('#btn-registrar-alumno')
    submitBtn.click()

    await new Promise(resolve => setTimeout(resolve, 150))

    const errorDiv = document.querySelector('#registrar-alumno-error')
    expect(errorDiv.classList.contains('d-none')).toBe(false)
    expect(document.querySelector('#registrar-alumno-error-message').textContent).toContain('Database error')
  })

  it('should clear form after successful submission', async () => {
    const mockInsert = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'alumno-123' },
        error: null
      })
    }

    supabase.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue(mockInsert)
    })

    modal.show('maestro-123')

    const nombreInput = document.querySelector('#alumno-nombre')
    nombreInput.value = 'Juan'
    document.querySelector('#alumno-apellido').value = 'Pérez'
    document.querySelector('#alumno-tlf').value = '8091234567'
    document.querySelector('#alumno-estado').value = 'activo'

    const submitBtn = document.querySelector('#btn-registrar-alumno')
    submitBtn.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(nombreInput.value).toBe('')
  })

  it('should dispatch showToast event on successful registration', async () => {
    const toastListener = vi.fn()
    window.addEventListener('showToast', toastListener)

    const mockInsert = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'alumno-123' },
        error: null
      })
    }

    supabase.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue(mockInsert)
    })

    modal.show('maestro-123')

    document.querySelector('#alumno-nombre').value = 'Juan'
    document.querySelector('#alumno-apellido').value = 'Pérez'
    document.querySelector('#alumno-tlf').value = '8091234567'
    document.querySelector('#alumno-estado').value = 'activo'

    const submitBtn = document.querySelector('#btn-registrar-alumno')
    submitBtn.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(toastListener).toHaveBeenCalled()
    const event = toastListener.mock.calls[0][0]
    expect(event.detail.type).toBe('success')

    window.removeEventListener('showToast', toastListener)
  })

  it('should dispatch alumno-registrado event on successful registration', async () => {
    const alumnoListener = vi.fn()
    window.addEventListener('alumno-registrado', alumnoListener)

    const mockData = {
      id: 'alumno-123',
      nombre: 'Juan',
      apellido: 'Pérez',
      estado: 'activo'
    }

    const mockInsert = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockData,
        error: null
      })
    }

    supabase.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue(mockInsert)
    })

    modal.show('maestro-123')

    document.querySelector('#alumno-nombre').value = 'Juan'
    document.querySelector('#alumno-apellido').value = 'Pérez'
    document.querySelector('#alumno-tlf').value = '8091234567'
    document.querySelector('#alumno-estado').value = 'activo'

    const submitBtn = document.querySelector('#btn-registrar-alumno')
    submitBtn.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(alumnoListener).toHaveBeenCalled()
    const event = alumnoListener.mock.calls[0][0]
    expect(event.detail.alumno).toEqual(mockData)

    window.removeEventListener('alumno-registrado', alumnoListener)
  })

  it('should disable submit button while submitting', async () => {
    let resolveSubmit
    const mockInsert = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn(() => new Promise(resolve => {
        resolveSubmit = resolve
      }))
    }

    supabase.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue(mockInsert)
    })

    modal.show('maestro-123')

    document.querySelector('#alumno-nombre').value = 'Juan'
    document.querySelector('#alumno-apellido').value = 'Pérez'
    document.querySelector('#alumno-tlf').value = '8091234567'
    document.querySelector('#alumno-estado').value = 'activo'

    const submitBtn = document.querySelector('#btn-registrar-alumno')
    submitBtn.click()

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(submitBtn.disabled).toBe(true)

    // Resolve the submission
    resolveSubmit({
      data: { id: 'alumno-123' },
      error: null
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(submitBtn.disabled).toBe(false)
  })
})
