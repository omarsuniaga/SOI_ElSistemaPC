import { vi, beforeEach } from 'vitest'

// Mock global de idb para todos los tests del portal
vi.mock('idb', () => {
  const store = new Map()
  const mockDB = {
    add: vi.fn(async (storeName, item) => {
      const id = item.id || Math.random().toString(36).substr(2, 9)
      store.set(id, { ...item, id })
      return id
    }),
    getAll: vi.fn(async () => [...store.values()]),
    delete: vi.fn(async (storeName, id) => store.delete(id)),
    transaction: vi.fn(() => ({
      store: {
        getAll: vi.fn(async () => [...store.values()]),
        clear:  vi.fn(async () => store.clear()),
      },
      done: Promise.resolve(),
    })),
  }
  return {
    openDB: vi.fn(async () => mockDB),
    __mockDB: mockDB,
    __store: store,
  }
})

// Mock de localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString() }),
    clear: vi.fn(() => { store = {} }),
    removeItem: vi.fn(key => { delete store[key] })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
