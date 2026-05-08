import { vi } from 'vitest'

export const createSupabaseMock = () => {
  const chainable = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    insert: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    lte: vi.fn(),
    gte: vi.fn(),
  }

  // Configurar encadenamiento por defecto
  Object.keys(chainable).forEach(key => {
    if (key !== 'single' && key !== 'maybeSingle' && key !== 'insert' && key !== 'upsert') {
      chainable[key].mockReturnThis()
    }
  })

  // Retornos por defecto para los terminadores
  chainable.single.mockResolvedValue({ data: null, error: null })
  chainable.maybeSingle.mockResolvedValue({ data: null, error: null })
  chainable.insert.mockReturnThis()
  chainable.upsert.mockReturnThis()

  return {
    from: vi.fn(() => chainable),
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    ...chainable
  }
}
