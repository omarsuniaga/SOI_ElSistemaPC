import { describe, it, expect, vi, beforeEach } from 'vitest'
import { crearUsuario, listarUsuariosPorRol } from '../adminUsuariosApi.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    functions: { invoke: vi.fn() },
    from: vi.fn(),
  },
}))

function createSelectChain(resolvedValue) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled)),
  }
  return chain
}

describe('adminUsuariosApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crearUsuario', () => {
    it('invoca la edge function create-user con el payload y devuelve el usuario creado', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { ok: true, user: { id: 'u1', email: 'a@b.com', rol: 'admin', estado: 'activo' } },
        error: null,
      })

      const result = await crearUsuario({
        nombre: 'Ana',
        email: 'A@B.com',
        password: 'Secret123',
        rol: 'admin',
      })

      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-user', {
        body: { nombre: 'Ana', email: 'A@B.com', password: 'Secret123', rol: 'admin' },
      })
      expect(result.id).toBe('u1')
      expect(result.rol).toBe('admin')
    })

    it('lanza error con el mensaje del backend cuando la function falla', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { error: 'El email ya está registrado' },
        error: null,
      })

      await expect(
        crearUsuario({ nombre: 'Ana', email: 'a@b.com', password: 'Secret123', rol: 'admin' }),
      ).rejects.toThrow('El email ya está registrado')
    })

    it('lanza error cuando supabase.functions.invoke devuelve error de transporte', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      })

      await expect(
        crearUsuario({ nombre: 'Ana', email: 'a@b.com', password: 'Secret123', rol: 'admin' }),
      ).rejects.toThrow('Network error')
    })

    it('valida campos obligatorios antes de invocar', async () => {
      await expect(
        crearUsuario({ nombre: '', email: 'a@b.com', password: 'Secret123', rol: 'admin' }),
      ).rejects.toThrow()
      expect(supabase.functions.invoke).not.toHaveBeenCalled()
    })
  })

  describe('listarUsuariosPorRol', () => {
    it('consulta profiles filtrando por rol y devuelve las filas', async () => {
      const rows = [{ id: 'u1', email: 'a@b.com', nombre_completo: 'Ana', estado: 'activo' }]
      const chain = createSelectChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await listarUsuariosPorRol('admin')

      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(chain.eq).toHaveBeenCalledWith('rol', 'admin')
      expect(result).toEqual(rows)
    })

    it('lanza error si la query falla', async () => {
      const chain = createSelectChain({ data: null, error: { message: 'boom' } })
      supabase.from.mockReturnValue(chain)

      await expect(listarUsuariosPorRol('admin')).rejects.toThrow('boom')
    })
  })
})
