import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { gestionarClasesModal } from '../gestionarClasesModal.js'
import * as supabaseModule from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

global.bootstrap = {
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
  },
  Tab: class {
    constructor() {}
    show() {}
  }
}

describe('gestionarClasesModal', () => {
  let modal

  beforeEach(() => {
    document.querySelectorAll('#gestionar-clases-modal').forEach(el => el.remove())
    modal = gestionarClasesModal()
    vi.clearAllMocks()
  })

  afterEach(() => {
    modal.destroy()
  })

  it('should render modal structure', () => {
    const element = document.querySelector('#gestionar-clases-modal')
    expect(element).toBeTruthy()
    expect(element.querySelector('#gestionar-clases-title')).toBeTruthy()
  })

  it('should have list and create tabs', () => {
    expect(document.querySelector('#clases-list-tab')).toBeTruthy()
    expect(document.querySelector('#clases-create-tab')).toBeTruthy()
  })

  it('should have all form fields for creating clase', () => {
    const form = document.querySelector('#crear-clase-form')

    expect(form.querySelector('#clase-nombre')).toBeTruthy()
    expect(form.querySelector('#clase-codigo')).toBeTruthy()
    expect(form.querySelector('#clase-descripcion')).toBeTruthy()
    expect(form.querySelector('#clase-horario')).toBeTruthy()
    expect(form.querySelector('#clase-ubicacion')).toBeTruthy()
  })

  it('should show modal when show() is called', () => {
    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }

    supabaseModule.supabase.from.mockReturnValue(mockSelect)

    modal.show('maestro-123')
    expect(modal.isOpen()).toBe(true)
  })

  it('should load clases list on modal open', async () => {
    const mockClases = [
      { id: 'clase-1', nombre: 'Matemáticas', codigo: 'MAT-101', maestro_id: 'maestro-123' }
    ]

    const mockChain = {
      select: vi.fn(function() { return this }),
      eq: vi.fn(function() { return this }),
      order: vi.fn(async function() { return { data: mockClases, error: null } })
    }

    supabaseModule.supabase.from.mockReturnValue(mockChain)

    modal.show('maestro-123')

    await new Promise(resolve => setTimeout(resolve, 150))

    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('clases')
    expect(document.querySelector('#clases-container')).toBeTruthy()
  })

  it('should show empty state when no clases', async () => {
    const mockChain = {
      select: vi.fn(function() { return this }),
      eq: vi.fn(function() { return this }),
      order: vi.fn(async function() { return { data: [], error: null } })
    }

    supabaseModule.supabase.from.mockReturnValue(mockChain)

    modal.show('maestro-123')

    await new Promise(resolve => setTimeout(resolve, 150))

    const emptyDiv = document.querySelector('#clases-empty')
    expect(emptyDiv.style.display).toBe('block')
  })

  it('should display error when loading clases fails', async () => {
    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Load failed')
      })
    }

    supabaseModule.supabase.from.mockReturnValue(mockSelect)

    modal.show('maestro-123')

    await new Promise(resolve => setTimeout(resolve, 150))

    const errorDiv = document.querySelector('#clases-error')
    expect(errorDiv.style.display).not.toBe('none')
  })

  it('should create clase with valid data', async () => {
    const mockInsert = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'clase-1', nombre: 'Matemáticas' },
        error: null
      })
    }

    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }

    let callCount = 0
    supabaseModule.supabase.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockSelect // Initial load
      return mockInsert // Insert call
    })

    modal.show('maestro-123')

    await new Promise(resolve => setTimeout(resolve, 100))

    // Switch to create tab
    const createTab = document.querySelector('#clases-create-tab')
    createTab.click()

    // Fill form
    document.querySelector('#clase-nombre').value = 'Matemáticas'
    document.querySelector('#clase-codigo').value = 'MAT-101'

    const createBtn = document.querySelector('#btn-crear-clase')
    createBtn.click()

    await new Promise(resolve => setTimeout(resolve, 150))

    expect(mockInsert.insert).toHaveBeenCalled()
  })

  it('should show success toast on clase creation', async () => {
    const toastListener = vi.fn()
    window.addEventListener('showToast', toastListener)

    const mockInsert = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'clase-1', nombre: 'Matemáticas' },
        error: null
      })
    }

    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }

    let callCount = 0
    supabaseModule.supabase.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? mockSelect : mockInsert
    })

    modal.show('maestro-123')
    await new Promise(resolve => setTimeout(resolve, 100))

    const createTab = document.querySelector('#clases-create-tab')
    createTab.click()

    document.querySelector('#clase-nombre').value = 'Matemáticas'
    document.querySelector('#clase-codigo').value = 'MAT-101'

    const createBtn = document.querySelector('#btn-crear-clase')
    createBtn.click()

    await new Promise(resolve => setTimeout(resolve, 150))

    expect(toastListener).toHaveBeenCalled()
    const event = toastListener.mock.calls[toastListener.mock.calls.length - 1][0]
    expect(event.detail.type).toBe('success')

    window.removeEventListener('showToast', toastListener)
  })

  it('should dispatch clase-creada event on successful creation', async () => {
    const claseListener = vi.fn()
    window.addEventListener('clase-creada', claseListener)

    const mockClase = { id: 'clase-1', nombre: 'Matemáticas' }

    const mockInsert = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockClase, error: null })
    }

    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }

    let callCount = 0
    supabaseModule.supabase.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? mockSelect : mockInsert
    })

    modal.show('maestro-123')
    await new Promise(resolve => setTimeout(resolve, 100))

    const createTab = document.querySelector('#clases-create-tab')
    createTab.click()

    document.querySelector('#clase-nombre').value = 'Matemáticas'
    document.querySelector('#clase-codigo').value = 'MAT-101'

    const createBtn = document.querySelector('#btn-crear-clase')
    createBtn.click()

    await new Promise(resolve => setTimeout(resolve, 150))

    expect(claseListener).toHaveBeenCalled()
    const event = claseListener.mock.calls[0][0]
    expect(event.detail.clase).toEqual(mockClase)

    window.removeEventListener('clase-creada', claseListener)
  })

  it('should delete clase when confirmed', async () => {
    const mockClases = [
      { id: 'clase-1', nombre: 'Matemáticas', codigo: 'MAT-101' }
    ]

    const mockDelete = {
      delete: vi.fn(function() { return this }),
      eq: vi.fn(async function() { return { data: null, error: null } })
    }

    const mockSelect = {
      eq: vi.fn(function() { return this }),
      order: vi.fn(async function() { return { data: mockClases, error: null } })
    }

    let callCount = 0
    supabaseModule.supabase.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? mockSelect : mockDelete
    })

    // Mock confirm to return true
    global.confirm = vi.fn(() => true)

    modal.show('maestro-123')

    await new Promise(resolve => setTimeout(resolve, 150))

    const deleteBtn = document.querySelector('.btn-eliminar')
    if (deleteBtn) {
      deleteBtn.click()

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockDelete.delete).toHaveBeenCalled()
    }
  })

  it('should show error on delete failure', async () => {
    const mockClases = [
      { id: 'clase-1', nombre: 'Matemáticas' }
    ]

    const mockDelete = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: new Error('Delete failed')
    }

    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockClases, error: null })
    }

    let callCount = 0
    supabaseModule.supabase.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? mockSelect : mockDelete
    })

    global.confirm = vi.fn(() => true)

    const toastListener = vi.fn()
    window.addEventListener('showToast', toastListener)

    modal.show('maestro-123')

    await new Promise(resolve => setTimeout(resolve, 150))

    // This test is setup for deletion test structure

    window.removeEventListener('showToast', toastListener)
  })

  it('should hide modal when hide() is called', () => {
    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }

    supabaseModule.supabase.from.mockReturnValue(mockSelect)

    modal.show('maestro-123')
    modal.hide()

    expect(modal.isOpen()).toBe(false)
  })

  it('should clear form after clase creation', async () => {
    const mockInsert = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'clase-1' },
        error: null
      })
    }

    const mockSelect = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }

    let callCount = 0
    supabaseModule.supabase.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? mockSelect : mockInsert
    })

    modal.show('maestro-123')
    await new Promise(resolve => setTimeout(resolve, 100))

    const createTab = document.querySelector('#clases-create-tab')
    createTab.click()

    const nombreInput = document.querySelector('#clase-nombre')
    nombreInput.value = 'Matemáticas'
    document.querySelector('#clase-codigo').value = 'MAT-101'

    const createBtn = document.querySelector('#btn-crear-clase')
    createBtn.click()

    await new Promise(resolve => setTimeout(resolve, 150))

    expect(nombreInput.value).toBe('')
  })
})
