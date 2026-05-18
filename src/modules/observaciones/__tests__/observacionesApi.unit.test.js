import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import {
  crearObservacion,
  actualizarObservacion,
  eliminarObservacion,
  agregarSeguimiento,
  resolverObservacion,
} from '../api/observacionesApi.js'

function makeChain(terminalMap = {}) {
  const chain = {}
  const methods = ['insert', 'update', 'delete', 'select', 'eq', 'single', 'not', 'order']
  methods.forEach(m => {
    if (terminalMap[m] !== undefined) {
      chain[m] = vi.fn().mockResolvedValue(terminalMap[m])
    } else {
      chain[m] = vi.fn().mockReturnValue(chain)
    }
  })
  return chain
}

const VALID_OBS = {
  alumno_id: 'a1',
  titulo: 'Titulo largo válido',
  descripcion: 'Descripcion suficientemente larga para pasar la validación del modelo',
  tipo: 'academica',
}

describe('observacionesApi — structured error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crearObservacion', () => {
    it('should throw VALIDATION error with validTipos when model validation fails', async () => {
      await expect(
        crearObservacion({ titulo: 'Ab', descripcion: 'short', tipo: 'academica' })
      ).rejects.toMatchObject({ code: 'VALIDATION', errors: expect.any(Array) })
    })

    it('should include validTipos in VALIDATION error', async () => {
      let caughtError
      try {
        await crearObservacion({ titulo: 'Ab', descripcion: 'short', tipo: 'academica' })
      } catch (e) {
        caughtError = e
      }
      expect(caughtError?.validTipos).toEqual(
        expect.arrayContaining(['academica', 'conductual', 'asistencia'])
      )
    })

    it('should throw RLS_DENIED when Supabase returns error code 42501', async () => {
      const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'row-level security' } } })
      supabase.from.mockReturnValue(chain)

      await expect(crearObservacion(VALID_OBS)).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })

    it('should throw RLS_DENIED when Supabase returns row-level security message', async () => {
      const chain = makeChain({ select: { data: null, error: { code: 'PGRST301', message: 'row-level security policy violation' } } })
      supabase.from.mockReturnValue(chain)

      await expect(crearObservacion(VALID_OBS)).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })
  })

  describe('actualizarObservacion', () => {
    it('should throw RLS_DENIED on 42501 during update', async () => {
      // First from() call: select original row
      const readChain = makeChain({ single: {
        data: {
          id: '1', alumno_id: 'a1', titulo: 'Titulo valido largo',
          descripcion: 'Descripcion suficientemente larga para pasar', tipo: 'academica',
          prioridad: 'media', estado: 'abierta', seguimiento_observacion: '',
        },
        error: null,
      } })
      // Second from() call: update — select is terminal
      const writeChain = makeChain({ select: { data: null, error: { code: '42501', message: 'rls' } } })

      supabase.from
        .mockReturnValueOnce(readChain)
        .mockReturnValueOnce(writeChain)

      await expect(actualizarObservacion('1', {})).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })
  })

  describe('eliminarObservacion', () => {
    it('should throw RLS_DENIED on 42501 during delete', async () => {
      // delete().eq() is the terminal
      const chain = makeChain({ eq: { error: { code: '42501', message: 'rls' } } })
      supabase.from.mockReturnValue(chain)

      await expect(eliminarObservacion('obs-1')).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })
  })

  describe('agregarSeguimiento', () => {
    it('should throw RLS_DENIED on 42501', async () => {
      const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'rls' } } })
      supabase.from.mockReturnValue(chain)

      await expect(agregarSeguimiento('obs-1', 'nota')).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })
  })

  describe('resolverObservacion', () => {
    it('should throw RLS_DENIED on 42501', async () => {
      const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'rls' } } })
      supabase.from.mockReturnValue(chain)

      await expect(resolverObservacion('obs-1')).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })
  })
})
