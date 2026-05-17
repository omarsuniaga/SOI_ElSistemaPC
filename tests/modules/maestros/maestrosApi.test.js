import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  }
}))

import { supabase } from '../../../src/lib/supabaseClient.js'
import { crearMaestro, obtenerMaestros, actualizarMaestro, eliminarMaestro } from '../../../src/modules/maestros/api/maestrosApi.js'

describe('maestrosApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crearMaestro', () => {
    it('inserts user_id when provided in payload', async () => {
      const insertMock = vi.fn().mockReturnThis()
      const selectMock = vi.fn().mockResolvedValue({
        data: [{
          id: 'new-id',
          user_id: 'auth-user-123',
          nombre_completo: 'Juan Pérez',
          correo: 'juan@test.com',
          especialidad: 'Violín',
          activo: true,
        }],
        error: null
      })

      supabase.from.mockReturnValue({
        insert: insertMock,
        select: selectMock,
      })

      const result = await crearMaestro({
        nombre: 'Juan Pérez',
        email: 'juan@test.com',
        instrumento: 'Violín',
        user_id: 'auth-user-123',
      })

      // Verify the insert was called with user_id
      const insertArg = insertMock.mock.calls[0][0][0]
      expect(insertArg.user_id).toBe('auth-user-123')

      // Verify normalized result preserves user_id
      expect(result.user_id).toBe('auth-user-123')
      expect(result.nombre).toBe('Juan Pérez')
    })

    it('creates maestro without user_id when not provided', async () => {
      const insertMock = vi.fn().mockReturnThis()
      const selectMock = vi.fn().mockResolvedValue({
        data: [{
          id: 'new-id',
          user_id: null,
          nombre_completo: 'Juan Pérez',
          correo: 'juan@test.com',
          activo: true,
        }],
        error: null
      })

      supabase.from.mockReturnValue({
        insert: insertMock,
        select: selectMock,
      })

      const result = await crearMaestro({
        nombre: 'Juan Pérez',
        email: 'juan@test.com',
      })

      const insertArg = insertMock.mock.calls[0][0][0]
      expect(insertArg.user_id).toBeNull()
      expect(result.user_id).toBeNull()
    })

    it('preserves user_id from normalized response', async () => {
      const insertMock = vi.fn().mockReturnThis()
      const selectMock = vi.fn().mockResolvedValue({
        data: [{
          id: 'maestro-1',
          user_id: 'uuid-abc-123',
          nombre_completo: 'Ana García',
          correo: 'ana@test.com',
          activo: true,
        }],
        error: null
      })

      supabase.from.mockReturnValue({
        insert: insertMock,
        select: selectMock,
      })

      const result = await crearMaestro({
        nombre: 'Ana García',
        email: 'ana@test.com',
        user_id: 'uuid-abc-123',
      })

      expect(result.user_id).toBe('uuid-abc-123')
    })

    it('throws error if nombre is empty', async () => {
      await expect(crearMaestro({ email: 'test@test.com' })).rejects.toThrow('obligatorio')
    })
  })
})
