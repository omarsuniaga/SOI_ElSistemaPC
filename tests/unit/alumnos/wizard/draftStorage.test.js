import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage before importing the module
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    _reset: () => { store = {} },
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

import {
  guardarBorrador,
  cargarBorrador,
  limpiarBorrador,
} from '../../../../src/portal-maestros/components/wizard/draftStorage.js'

const DRAFT_KEY = 'wizard-inscripcion-draft'

beforeEach(() => {
  localStorageMock._reset()
  vi.clearAllMocks()
})

describe('guardarBorrador', () => {
  it('saves draft as JSON string to localStorage', () => {
    const draft = { nombre_completo: 'Ana', fecha_nacimiento: '2010-03-15' }
    guardarBorrador(draft)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      DRAFT_KEY,
      JSON.stringify(draft)
    )
  })
})

describe('cargarBorrador', () => {
  it('returns null when no draft is stored', () => {
    expect(cargarBorrador()).toBeNull()
  })

  it('returns parsed draft object when one is stored', () => {
    const draft = { nombre_completo: 'Pedro', step: 2 }
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(draft))
    const loaded = cargarBorrador()
    expect(loaded).toEqual(draft)
  })

  it('returns null when stored value is invalid JSON', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json{{{')
    expect(cargarBorrador()).toBeNull()
  })
})

describe('limpiarBorrador', () => {
  it('removes the draft key from localStorage', () => {
    limpiarBorrador()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(DRAFT_KEY)
  })
})
