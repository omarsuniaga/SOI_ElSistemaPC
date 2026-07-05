import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabaseClient
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  }
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { getProfileStatus, isProfileActive } from '../rlsHelpers.js'

describe('rlsHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfileStatus', () => {
    it('returns profile status when user is authenticated', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null
      })

      const mockProfile = { estado: 'activo', rol: 'maestro' }
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      })

      const result = await getProfileStatus()

      expect(result).toEqual({ estado: 'activo', rol: 'maestro' })
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(supabase.auth.getSession).toHaveBeenCalled()
    })

    it('returns null when there is no session', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const result = await getProfileStatus()

      expect(result).toBeNull()
    })

    it('returns null when Supabase query fails', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'No rows' } })
      })

      const result = await getProfileStatus()

      expect(result).toBeNull()
    })
  })

  describe('isProfileActive', () => {
    it('returns true when profile estado is activo', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { estado: 'activo', rol: 'maestro' }, error: null })
      })

      const result = await isProfileActive()
      expect(result).toBe(true)
    })

    it('returns false when profile estado is pendiente', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { estado: 'pendiente', rol: 'maestro' }, error: null })
      })

      const result = await isProfileActive()
      expect(result).toBe(false)
    })

    it('returns false when profile estado is rechazado', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { estado: 'rechazado', rol: 'maestro' }, error: null })
      })

      const result = await isProfileActive()
      expect(result).toBe(false)
    })

    it('returns false when no session exists', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const result = await isProfileActive()
      expect(result).toBe(false)
    })
  })
})
