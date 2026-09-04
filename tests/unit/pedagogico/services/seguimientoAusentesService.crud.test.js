/**
 * T1a.3: Unit tests for DataAdapter CRUD service methods
 * Tests: getPeriodoActivo, fetchSeguimientoAusentes, registrarContacto, crearRetencion, levantarRetencion
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFrom = vi.fn()
const mockRpc = vi.fn()

vi.mock('../../../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
    rpc: (...args) => mockRpc(...args),
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })),
    },
  },
}))

import {
  getPeriodoActivo,
  fetchSeguimientoAusentes,
  registrarContacto,
  crearRetencion,
  levantarRetencion,
  enviarSeguimientoAusentismo,
  reiniciarContadorAusencias,
  suspenderAlumno,
  __clearPeriodoCache, // For testing only
} from '../../../../src/modules/pedagogico/services/seguimientoAusentesService.js'

describe('DataAdapter CRUD Service Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __clearPeriodoCache()
  })

  // Create a flexible chain that returns itself for most methods
  const createChain = (resolveValue) => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(resolveValue),
    }
    return chain
  }

  const mockQueryChain = (resolveValue) => createChain(resolveValue)

  const mockRangeChain = (data, totalCount) => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data,
        count: totalCount,
      }),
    }
    return chain
  }

  // ============ getPeriodoActivo ============
  describe('getPeriodoActivo', () => {
    it('returns active periodo from cache if called twice within 5 min', async () => {
      const periodData = { id: 'p1', nombre: 'Sep 2026', fecha_inicio: '2026-09-01', fecha_fin: '2026-09-30' }

      mockFrom.mockImplementation((table) => {
        if (table === 'periodos') {
          return mockQueryChain({ data: periodData })
        }
        return mockQueryChain({ data: null })
      })

      // First call
      const result1 = await getPeriodoActivo()
      expect(result1.id).toBe('p1')

      // Second call should use cache (mockFrom not called again for periodos table)
      const result2 = await getPeriodoActivo()
      expect(result2.id).toBe('p1')

      // Verify mockFrom was called only once for periodos (cache hit on second call)
      expect(mockFrom).toHaveBeenCalledTimes(1)
    })

    it('throws error if no active periodo exists', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'periodos') {
          const chain = createChain({ data: null, error: null })
          chain.single = vi.fn().mockResolvedValue({ data: null, error: null })
          return chain
        }
        return mockQueryChain({ data: null })
      })

      await expect(getPeriodoActivo()).rejects.toThrow('No active periodo found')
    })
  })

  // ============ fetchSeguimientoAusentes ============
  describe('fetchSeguimientoAusentes', () => {
    it('queries view with default params and returns paginated alumnos + totalCount', async () => {
      const alumnoRows = [
        { alumno_id: 'a1', alumno_nombre: 'Alumno 1', nivel: 2, dias_ausente: 2 },
        { alumno_id: 'a2', alumno_nombre: 'Alumno 2', nivel: 1, dias_ausente: 1 },
      ]

      mockFrom.mockImplementation((table) => {
        if (table === 'vw_seguimiento_ausentes') {
          return mockRangeChain(alumnoRows, 100)
        }
        return mockRangeChain([], 0)
      })

      const result = await fetchSeguimientoAusentes()

      expect(result.alumnos).toHaveLength(2)
      expect(result.totalCount).toBe(100)
      expect(result.alumnos[0].alumno_nombre).toBe('Alumno 1')
    })

    it('applies nivel filter when provided', async () => {
      const alumnoRows = [{ alumno_id: 'a2', nivel: 2 }]

      mockFrom.mockImplementation((table) => {
        if (table === 'vw_seguimiento_ausentes') {
          return mockRangeChain(alumnoRows, 1)
        }
        return mockRangeChain([], 0)
      })

      const result = await fetchSeguimientoAusentes({ nivel: 2 })

      expect(result.alumnos[0].nivel).toBe(2)
      // Verify eq('nivel', 2) was called
      const selectChain = mockFrom.mock.results[0].value
      expect(selectChain.eq).toHaveBeenCalledWith('nivel', 2)
    })

    it('applies maestroId filter when provided', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'vw_seguimiento_ausentes') {
          const chain = mockRangeChain([], 0)
          return chain
        }
        return mockRangeChain([], 0)
      })

      await fetchSeguimientoAusentes({ maestroId: 'maestro-1' })

      const selectChain = mockFrom.mock.results[0].value
      // Verify eq('maestro_id', 'maestro-1') was called after first eq
      expect(selectChain.eq).toHaveBeenCalledWith('maestro_id', 'maestro-1')
    })

    it('applies soloSinContacto filter (is null on contacto_telefono)', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'vw_seguimiento_ausentes') {
          return mockRangeChain([], 0)
        }
        return mockRangeChain([], 0)
      })

      await fetchSeguimientoAusentes({ soloSinContacto: true })

      const selectChain = mockFrom.mock.results[0].value
      // Verify is('contacto_telefono', null) was called
      expect(selectChain.is).toHaveBeenCalledWith('contacto_telefono', null)
    })

    it('applies busqueda filter (ilike on alumno_nombre)', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'vw_seguimiento_ausentes') {
          return mockRangeChain([], 0)
        }
        return mockRangeChain([], 0)
      })

      await fetchSeguimientoAusentes({ busqueda: 'Juan' })

      const selectChain = mockFrom.mock.results[0].value
      // Verify ilike('alumno_nombre', ...) was called
      expect(selectChain.ilike).toHaveBeenCalledWith('alumno_nombre', expect.stringContaining('Juan'))
    })

    it('applies pagination (limit + offset + range)', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'vw_seguimiento_ausentes') {
          const chain = mockRangeChain([], 0)
          return chain
        }
        return mockRangeChain([], 0)
      })

      await fetchSeguimientoAusentes({ limit: 25, offset: 50 })

      const selectChain = mockFrom.mock.results[0].value
      // range should be called with (50, 74) for limit 25, offset 50
      expect(selectChain.range).toHaveBeenCalledWith(50, 74)
    })

    it('applies sorting (order by nivel desc, then dias_ausente desc)', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'vw_seguimiento_ausentes') {
          return mockRangeChain([], 0)
        }
        return mockRangeChain([], 0)
      })

      await fetchSeguimientoAusentes()

      const selectChain = mockFrom.mock.results[0].value
      // First order by nivel ascending:false, then by dias_ausente ascending:false
      expect(selectChain.order).toHaveBeenCalledWith('nivel', { ascending: false })
    })
  })

  // ============ registrarContacto ============
  describe('registrarContacto', () => {
    it('inserts comunicaciones_seguimiento row with correct fields', async () => {
      const insertedRow = {
        id: 'comm-1',
        alumno_id: 'a1',
        nivel: 1,
        origen: 'ausentismo',
        canal: 'whatsapp',
        fecha: '2026-09-03T10:00:00Z',
        resultado: 'contactado',
        estado: 'abierto',
      }

      mockFrom.mockImplementation((table) => {
        if (table === 'comunicaciones_seguimiento') {
          return mockQueryChain({ data: insertedRow })
        }
        return mockQueryChain({ data: null })
      })

      const result = await registrarContacto({
        alumnoId: 'a1',
        nivel: 1,
        contactoTelefono: '+18091234567',
        contactoNombre: 'Familia',
      })

      expect(result.id).toBe('comm-1')
      expect(result.nivel).toBe(1)
      expect(result.origen).toBe('ausentismo')
    })

    it('rejects duplicate contact within 120 min (throws CONTACTO_DUPLICADO)', async () => {
      const recentRow = { id: 'comm-recent', fecha: new Date(Date.now() - 60 * 60 * 1000) }

      mockFrom.mockImplementation((table) => {
        if (table === 'comunicaciones_seguimiento') {
          const chain = createChain({ data: {} })
          // Override to return duplicate data on select chain
          chain.select = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({
                    data: [recentRow],
                  }),
                }),
              }),
            }),
          })
          return chain
        }
        return mockQueryChain({ data: null })
      })

      await expect(
        registrarContacto({
          alumnoId: 'a1',
          nivel: 1,
          contactoTelefono: '+18091234567',
          contactoNombre: 'Familia',
        })
      ).rejects.toThrow('CONTACTO_DUPLICADO')
    })

    it('allows second contact after 120 min (outside duplicate window)', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'comunicaciones_seguimiento') {
          const chain = createChain({ data: { id: 'comm-2', nivel: 1, origen: 'ausentismo' } })
          chain.select = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({
                    data: [], // No recent contacts
                  }),
                }),
              }),
            }),
          })
          chain.insert = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'comm-2', nivel: 1, origen: 'ausentismo' },
              }),
            }),
          })
          return chain
        }
        return mockQueryChain({ data: null })
      })

      const result = await registrarContacto({
        alumnoId: 'a1',
        nivel: 1,
        contactoTelefono: '+18091234567',
        contactoNombre: 'Familia',
      })

      expect(result.id).toBe('comm-2')
    })

    it('sets proxima_fecha = now() + 7 days when nivel === 2', async () => {
      const insertedRow = {
        id: 'comm-nivel2',
        nivel: 2,
        proxima_accion: 'contacto_nivel_3',
        proxima_fecha: '2026-09-10', // +7 days
      }

      mockFrom.mockImplementation((table) => {
        if (table === 'comunicaciones_seguimiento') {
          const chain = createChain(insertedRow)
          chain.select = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({ data: [] }),
                }),
              }),
            }),
          })
          chain.insert = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: insertedRow }),
            }),
          })
          return chain
        }
        return mockQueryChain({ data: null })
      })

      const result = await registrarContacto({
        alumnoId: 'a1',
        nivel: 2,
        contactoTelefono: '+18091234567',
        contactoNombre: 'Familia',
      })

      expect(result.nivel).toBe(2)
      expect(result.proxima_accion).toBe('contacto_nivel_3')
      expect(result.proxima_fecha).toBe('2026-09-10')
    })
  })

  // ============ crearRetencion ============
  describe('crearRetencion', () => {
    it('inserts retenciones_instrumento row with estado=retenido', async () => {
      const insertedRow = {
        id: 'ret-1',
        alumno_id: 'a1',
        estado: 'retenido',
        motivo: 'ausentismo_acumulado',
        retenido_en: '2026-09-03T10:00:00Z',
      }

      mockFrom.mockImplementation((table) => {
        if (table === 'retenciones_instrumento') {
          return mockQueryChain({ data: insertedRow })
        }
        return mockQueryChain({ data: null })
      })

      const result = await crearRetencion({
        alumnoId: 'a1',
        motivo: 'ausentismo_acumulado',
        notas: 'Test note',
      })

      expect(result.id).toBe('ret-1')
      expect(result.estado).toBe('retenido')
      expect(result.motivo).toBe('ausentismo_acumulado')
    })

    it('propagates RLS error if user is not ACM', async () => {
      const rlsError = new Error('new row violates row-level security policy')

      mockFrom.mockImplementation((table) => {
        if (table === 'retenciones_instrumento') {
          const chain = createChain({ data: null })
          chain.insert = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ error: rlsError, data: null }),
            }),
          })
          return chain
        }
        return mockQueryChain({ data: null })
      })

      await expect(
        crearRetencion({ alumnoId: 'a1', motivo: 'ausentismo_acumulado' })
      ).rejects.toThrow()
    })
  })

  // ============ levantarRetencion ============
  describe('levantarRetencion', () => {
    it('updates retenciones_instrumento: estado=levantada, acta_firmada_en, fecha_reincorporacion', async () => {
      const updatedRow = {
        id: 'ret-1',
        estado: 'levantada',
        acta_firmada_en: '2026-09-03T10:00:00Z',
        fecha_reincorporacion: '2026-09-03T10:00:00Z',
      }

      mockFrom.mockImplementation((table) => {
        if (table === 'retenciones_instrumento') {
          return mockQueryChain({ data: updatedRow })
        }
        return mockQueryChain({ data: null })
      })

      const result = await levantarRetencion({
        retencionId: 'ret-1',
        notas: 'Reincorporado',
      })

      expect(result.estado).toBe('levantada')
      expect(result.acta_firmada_en).toBeTruthy()
      expect(result.fecha_reincorporacion).toBeTruthy()
    })
  })

  // ============ enviarSeguimientoAusentismo ============
  describe('enviarSeguimientoAusentismo', () => {
    const alumno = {
      alumno_id: 'a1',
      alumno_nombre: 'Lucía Peña',
      instrumento_principal: 'Flauta',
      dias_ausente: 2,
      nivel: 2,
      contacto_telefono: '+18091234567',
      contacto_nombre: 'Rep Peña',
      ultima_ausencia_fecha: '2026-09-01',
      maestro_nombre: 'Prof X',
    }

    it('arma el mensaje del nivel, registra el contacto y devuelve el link wa.me', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'comunicaciones_seguimiento') {
          return mockQueryChain({ data: { id: 'c1', nivel: 2, origen: 'ausentismo' } })
        }
        return mockQueryChain({ data: null })
      })

      const res = await enviarSeguimientoAusentismo({ alumno })

      expect(res.mensaje).toContain('Lucía Peña')
      expect(res.mensaje).toContain('2 inasistencias sin justificar')
      expect(res.waUrl).toContain('wa.me/18091234567')
      expect(res.waUrl).toContain('text=')
      expect(res.registro.id).toBe('c1')
    })

    it('lanza SIN_CONTACTO si el alumno no tiene teléfono', async () => {
      await expect(
        enviarSeguimientoAusentismo({ alumno: { ...alumno, contacto_telefono: null } }),
      ).rejects.toThrow('SIN_CONTACTO')
    })
  })

  // ============ reiniciarContadorAusencias ============
  describe('reiniciarContadorAusencias', () => {
    it('inserta un corte en seguimiento_ausencias_reinicio para el alumno', async () => {
      let inserted = null
      mockFrom.mockImplementation((table) => {
        if (table === 'seguimiento_ausencias_reinicio') {
          return {
            insert: (payload) => {
              inserted = payload
              return { select: () => ({ single: async () => ({ data: { id: 'r1', ...payload } }) }) }
            },
          }
        }
        return mockQueryChain({ data: null })
      })

      const res = await reiniciarContadorAusencias({ alumnoId: 'a1', motivo: 'ok' })
      expect(inserted.alumno_id).toBe('a1')
      expect(inserted.motivo).toBe('ok')
      expect(res.id).toBe('r1')
    })
  })

  // ============ suspenderAlumno ============
  describe('suspenderAlumno', () => {
    it('inserta una suspensión activa con motivo y hasta', async () => {
      let inserted = null
      mockFrom.mockImplementation((table) => {
        if (table === 'alumno_suspensiones') {
          return {
            insert: (payload) => {
              inserted = payload
              return { select: () => ({ single: async () => ({ data: { id: 's1', ...payload } }) }) }
            },
          }
        }
        return mockQueryChain({ data: null })
      })

      await suspenderAlumno({ alumnoId: 'a1', motivo: 'viaje', hasta: '2026-10-01' })
      expect(inserted).toMatchObject({ alumno_id: 'a1', motivo: 'viaje', hasta: '2026-10-01', estado: 'activa' })
    })
  })
})
