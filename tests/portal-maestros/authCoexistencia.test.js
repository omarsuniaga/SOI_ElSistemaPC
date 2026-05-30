import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de supabaseClient
vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../../src/lib/supabaseClient.js'
import {
  loginMaestro,
  detectarRolMaestro,
  STORAGE_KEY,
} from '../../src/portal-maestros/auth/maestroAuth.js'

describe('Auth Coexistence - Maestros & Admins', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('loginMaestro', () => {
    it('Debe iniciar sesión exitosamente para un MAESTRO (debe consultar y validar contra la base de datos)', async () => {
      // 1. Simular inicio de sesión en Supabase Auth exitoso con rol de maestro
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'maestro-tok-123' },
          user: {
            id: 'uid-maestro',
            email: 'maestro@test.com',
            user_metadata: { full_name: 'Juan Maestro', rol: 'maestro' },
          },
        },
        error: null,
      })

      // 2. Simular respuestas distintas según la tabla consultada
      const maestroDbMock = {
        id: 'maestro-id-999',
        user_id: 'uid-maestro',
        nombre_completo: 'Juan Maestro',
        correo: 'maestro@test.com',
        instrumento: 'Violín',
      }

      const singleMock = vi.fn()
      singleMock.mockResolvedValueOnce({ data: { rol: 'maestro' }, error: null }) // profiles
      singleMock.mockResolvedValueOnce({ data: maestroDbMock, error: null }) // maestros

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: singleMock,
      })

      // 3. Ejecutar el login
      const result = await loginMaestro('maestro@test.com', 'clave123')

      // 4. Verificaciones
      expect(result.success).toBe(true)
      expect(result.maestro.nombre_completo).toBe('Juan Maestro')
      expect(result.maestro.instrumento).toBe('Violín')
      expect(result.maestro.es_admin).toBeUndefined() // No es admin
      expect(localStorage.getItem(STORAGE_KEY)).toContain('Juan Maestro')
      expect(supabase.from).toHaveBeenCalledWith('profiles') // Lee profiles.rol primero
      expect(supabase.from).toHaveBeenCalledWith('maestros') // Luego consulta maestros
    })

    it('Debe iniciar sesión exitosamente para un ADMINISTRADOR (bypasseando la tabla maestros)', async () => {
      // 1. Simular inicio de sesión en Supabase Auth exitoso con rol de admin
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'admin-tok-456' },
          user: {
            id: 'uid-admin-777',
            email: 'admin@soi.com',
            user_metadata: { full_name: 'María Admin', rol: 'admin' },
          },
        },
        error: null,
      })

      // 2. Mock de profiles.rol como fuente primaria
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { rol: 'admin' }, error: null }),
      })

      // 3. Ejecutar el login
      const result = await loginMaestro('admin@soi.com', 'claveAdmin123')

      // 4. Verificaciones
      expect(result.success).toBe(true)
      expect(result.maestro.nombre_completo).toBe('María Admin')
      expect(result.maestro.es_admin).toBe(true) // Perfil virtual de admin
      expect(result.maestro.instrumento).toBe('Todos (Admin)')
      expect(localStorage.getItem(STORAGE_KEY)).toContain('María Admin')
      expect(supabase.from).toHaveBeenCalledWith('profiles') // Lee profiles.rol como fuente primaria
      expect(supabase.from).not.toHaveBeenCalledWith('maestros') // No toca la tabla maestros
    })

    it('Debe rebotar el inicio de sesión si el usuario no tiene rol admin y NO existe en la tabla maestros', async () => {
      // 1. Simular inicio de sesión en Supabase Auth con usuario común (sin rol admin)
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'comun-tok' },
          user: {
            id: 'uid-comun',
            email: 'intruso@test.com',
            user_metadata: { full_name: 'Intruso', rol: 'usuario' },
          },
        },
        error: null,
      })

      // 2. Simular que no existe en la tabla maestros
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
      })

      // 3. Ejecutar el login
      const result = await loginMaestro('intruso@test.com', 'clave123')

      // 4. Verificaciones
      expect(result.success).toBe(false)
      expect(result.error).toContain('No tienes acceso de maestro')
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled() // Le cerró la sesión por seguridad
    })
  })

  describe('detectarRolMaestro', () => {
    it('Debe detectar y retornar al MAESTRO desde Supabase si no está en caché', async () => {
      // 1. Simular sesión activa en Supabase Auth
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'uid-maestro-2',
              email: 'm2@test.com',
              user_metadata: { full_name: 'Maestro Dos', rol: 'maestro' },
            },
          },
        },
        error: null,
      })

      // 2. Simular respuestas distintas según la tabla
      const maestroDbMock = {
        id: 'maestro-id-2',
        user_id: 'uid-maestro-2',
        nombre_completo: 'Maestro Dos',
        correo: 'm2@test.com',
      }
      const singleMock = vi.fn()
      singleMock.mockResolvedValueOnce({ data: { rol: 'maestro' }, error: null }) // profiles
      singleMock.mockResolvedValueOnce({ data: maestroDbMock, error: null }) // maestros

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: singleMock,
      })

      // 3. Detectar rol
      const result = await detectarRolMaestro()

      // 4. Verificaciones
      expect(result).not.toBeNull()
      expect(result.nombre_completo).toBe('Maestro Dos')
      expect(localStorage.getItem(STORAGE_KEY)).toContain('Maestro Dos')
    })

    it('Debe detectar y retornar al ADMIN de forma virtual si la sesión activa es de rol admin', async () => {
      // 1. Simular sesión activa en Supabase Auth con rol admin
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'uid-admin-recuperado',
              email: 'admin@test.com',
              user_metadata: { full_name: 'Admin Recuperado', rol: 'admin' },
            },
          },
        },
        error: null,
      })

      // 2. Mock de profiles.rol como fuente primaria
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { rol: 'admin' }, error: null }),
      })

      // 3. Detectar rol
      const result = await detectarRolMaestro()

      // 4. Verificaciones
      expect(result).not.toBeNull()
      expect(result.nombre_completo).toBe('Admin Recuperado')
      expect(result.es_admin).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('profiles') // Lee profiles.rol como fuente primaria
      expect(supabase.from).not.toHaveBeenCalledWith('maestros') // No toca la tabla maestros
      expect(localStorage.getItem(STORAGE_KEY)).toContain('Admin Recuperado')
    })
  })
})
