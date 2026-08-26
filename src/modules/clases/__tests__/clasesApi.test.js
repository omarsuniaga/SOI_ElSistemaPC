import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clasesApi from '../api/clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('clasesApi Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.isDemoMode = false
  })

  describe('buscarSalonDisponible', () => {
    function mockRoomSearch({ count = 0, rooms = [], schedules = [] } = {}) {
      supabase.from.mockImplementation((table) => {
        if (table === 'alumnos_clases') {
          const result = { data: null, count, error: null }
          const chain = { select: vi.fn(() => chain), eq: vi.fn(() => chain), then: resolve => resolve(result) }
          return chain
        }
        if (table === 'salones') return { select: vi.fn().mockResolvedValue({ data: rooms, error: null }) }
        if (table === 'clase_horarios') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: schedules, error: null }),
            }),
          }
        }
        throw new Error(`unexpected table ${table}`)
      })
    }

    const search = (overrides = {}) => clasesApi.buscarSalonDisponible({
      claseId: 'c1', dia: 'viernes', horaInicio: '15:30', horaFin: '17:00', ...overrides,
    })

    it('rejects invalid and reversed time intervals', async () => {
      await expect(search({ horaInicio: '25:00' })).rejects.toThrow('no es válido')
      await expect(search({ horaInicio: '15:30:99' })).rejects.toThrow('no es válido')
      await expect(search({ horaInicio: '17:00', horaFin: '15:30' })).rejects.toThrow('no es válido')
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('normalizes a legacy null room capacity to the shared default of 20', async () => {
      mockRoomSearch({ count: 15, rooms: [{ id: 'legacy', nombre: 'Legado', capacidad: null }] })
      await expect(search()).resolves.toMatchObject({ salon: { id: 'legacy', capacidad: 20 } })
    })

    it('does not promote explicit non-positive capacities to the legacy default', async () => {
      mockRoomSearch({
        count: 1,
        rooms: [
          { id: 'zero', capacidad: 0 },
          { id: 'negative', capacidad: -1 },
        ],
      })
      await expect(search()).resolves.toMatchObject({ salon: null, reason: 'NO_CAPACITY' })
    })

    it('uses local fixtures in demo mode without querying Supabase', async () => {
      config.isDemoMode = true
      await expect(search()).resolves.toMatchObject({
        salon: { id: 's-102', capacidad: 15 },
        alumnosActivos: 15,
      })
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('returns NO_CAPACITY when active rooms cannot fit active students', async () => {
      mockRoomSearch({ count: 15, rooms: [{ id: 's1', nombre: 'Pequeño', capacidad: 10 }] })
      await expect(search()).resolves.toMatchObject({ salon: null, alumnosActivos: 15, reason: 'NO_CAPACITY' })
    })

    it('returns NO_AVAILABILITY when capable rooms overlap', async () => {
      mockRoomSearch({
        count: 15,
        rooms: [{ id: 's1', capacidad: 20 }],
        schedules: [{ id: 'h2', clase_id: 'c2', salon_id: 's1', dia: 'viernes', hora_inicio: '16:00', hora_fin: '18:00' }],
      })
      await expect(search()).resolves.toMatchObject({ salon: null, reason: 'NO_AVAILABILITY' })
    })

    it('allows adjacent sessions and selects the smallest fitting room', async () => {
      mockRoomSearch({
        count: 15,
        rooms: [{ id: 'large', nombre: 'Grande', capacidad: 30 }, { id: 'fit', nombre: 'Justo', capacidad: 15 }],
        schedules: [{ id: 'h2', salon_id: 'fit', dia: 'viernes', hora_inicio: '17:00:00', hora_fin: '18:00:00' }],
      })
      await expect(search()).resolves.toMatchObject({ salon: { id: 'fit' }, alumnosActivos: 15, reason: null })
    })

    it('prefers the current room when equal-capacity rooms are available', async () => {
      mockRoomSearch({
        count: 8,
        rooms: [{ id: 'a', nombre: 'Alfa', capacidad: 10 }, { id: 'current', nombre: 'Zulu', capacidad: 10 }],
      })
      await expect(search({ salonActualId: 'current' })).resolves.toMatchObject({
        salon: { id: 'current' }, mantieneSalonActual: true,
      })
    })

    it('excludes rooms disabled through either active flag', async () => {
      mockRoomSearch({
        count: 2,
        rooms: [
          { id: 'disabled-a', capacidad: 2, activo: false },
          { id: 'disabled-b', capacidad: 2, is_active: false },
          { id: 'active', capacidad: 3, activo: true, is_active: true },
        ],
      })
      await expect(search()).resolves.toMatchObject({ salon: { id: 'active' } })
    })

    it('supports classes with zero active students deterministically', async () => {
      mockRoomSearch({
        count: 0,
        rooms: [{ id: 'b', nombre: 'Beta', capacidad: 5 }, { id: 'a', nombre: 'Alfa', capacidad: 5 }],
      })
      await expect(search()).resolves.toMatchObject({ salon: { id: 'a' }, alumnosActivos: 0 })
    })

    it('excludes only the edited schedule, preserving conflicts from another session of the same class', async () => {
      mockRoomSearch({
        count: 4,
        rooms: [{ id: 's1', capacidad: 5 }, { id: 's2', capacidad: 6 }],
        schedules: [
          { id: 'editing', clase_id: 'c1', salon_id: 's1', dia: 'viernes', hora_inicio: '15:30', hora_fin: '17:00' },
          { id: 'other-session', clase_id: 'c1', salon_id: 's1', dia: 'viernes', hora_inicio: '16:00', hora_fin: '18:00' },
        ],
      })
      await expect(search({ horarioId: 'editing', salonActualId: 's1' })).resolves.toMatchObject({
        salon: { id: 's2' }, mantieneSalonActual: false,
      })
    })
  })

  describe('obtenerAlumnosInscritosPorClases', () => {
    it('should fetch enrollments in one bulk query and group them by class', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [
          { id: 'ins-1', clase_id: 'clase-1', alumno: { nombre_completo: 'Ana' } },
          { id: 'ins-2', clase_id: 'clase-2', alumno: { nombre_completo: 'Luis' } },
          { id: 'ins-3', clase_id: 'clase-1', alumno: { nombre_completo: 'María' } },
        ],
        error: null,
      })
      const eq = vi.fn().mockReturnValue({ order })
      const inMock = vi.fn().mockReturnValue({ eq })
      const select = vi.fn().mockReturnValue({ in: inMock })

      supabase.from.mockReturnValue({ select })

      const result = await clasesApi.obtenerAlumnosInscritosPorClases([
        'clase-1',
        'clase-2',
        'clase-1',
      ])

      expect(supabase.from).toHaveBeenCalledTimes(1)
      expect(supabase.from).toHaveBeenCalledWith('alumnos_clases')
      expect(select).toHaveBeenCalledWith('*, alumno:alumnos(*)')
      expect(inMock).toHaveBeenCalledWith('clase_id', ['clase-1', 'clase-2'])
      expect(eq).toHaveBeenCalledWith('activo', true)
      expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result['clase-1']).toHaveLength(2)
      expect(result['clase-2']).toHaveLength(1)
    })

    it('should skip the query when no class ids are provided', async () => {
      await expect(clasesApi.obtenerAlumnosInscritosPorClases([])).resolves.toEqual({})
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('validarHorario', () => {
    it('should return conflicts if salon is occupied', async () => {
      const mockSchedules = [
        { 
          dia: 'lunes', 
          hora_inicio: '08:00', 
          hora_fin: '10:00', 
          salon_id: 's1',
          clases: { nombre: 'Clase Existente', maestro_principal_id: 'm2' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'lunes', hora_inicio: '09:00', hora_fin: '11:00', salon_id: 's1' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(1)
      expect(conflictos[0].tipo).toBe('salón')
      expect(conflictos[0].detalle).toContain('Clase Existente')
    })

    it('should NOT return conflicts if classes are adjacent in time', async () => {
      const mockSchedules = [
        { 
          dia: 'lunes', 
          hora_inicio: '16:00:00', 
          hora_fin: '17:00:00', 
          salon_id: 's1',
          clases: { nombre: 'Clase Existente', maestro_principal_id: 'm2' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'lunes', hora_inicio: '17:00', hora_fin: '18:00', salon_id: 's1' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(0)
    })

    it('should NOT return conflicts if classes are adjacent in time with varying string formats', async () => {
      const mockSchedules = [
        { 
          dia: 'lunes', 
          hora_inicio: '16:00:00.000', 
          hora_fin: '17:00:00', 
          salon_id: 's1',
          clases: { nombre: 'Clase Existente', maestro_principal_id: 'm2' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'lunes', hora_inicio: '5:00 PM', hora_fin: '18:00', salon_id: 's1' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(0)
    })

    it('should return conflicts if classes overlap by even a single minute', async () => {
      const mockSchedules = [
        { 
          dia: 'lunes', 
          hora_inicio: '16:00:00', 
          hora_fin: '17:01:00', 
          salon_id: 's1',
          clases: { nombre: 'Clase Existente', maestro_principal_id: 'm2' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'lunes', hora_inicio: '17:00', hora_fin: '18:00', salon_id: 's1' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(1)
      expect(conflictos[0].tipo).toBe('salón')
    })


    it('should return conflicts if maestro is occupied', async () => {
      const mockSchedules = [
        { 
          dia: 'martes', 
          hora_inicio: '14:00', 
          hora_fin: '16:00', 
          salon_id: 's2',
          clases: { id: 'c1', nombre: 'Clase del Maestro', maestro_principal_id: 'm1' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'martes', hora_inicio: '15:00', hora_fin: '17:00', salon_id: 's3' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(1)
      expect(conflictos[0].tipo).toBe('maestro')
    })
  })

  describe('resolverConflictosClases', () => {
    function makeChain() {
      const chain = {}
      chain.eq = vi.fn(() => chain)
      chain.then = (resolve) => resolve({ data: null, error: null })
      return chain
    }

    function mockTables() {
      const updates = { clase_horarios: [], clases: [] }
      supabase.from.mockImplementation((table) => ({
        update: vi.fn((payload) => {
          const chain = makeChain()
          updates[table]?.push({ payload, chain })
          return chain
        }),
      }))
      return updates
    }

    it('prioritizes the new class and flags the conflicting existing class without changing its room', async () => {
      const updates = mockTables()
      const conflictos = [
        {
          clase_id: 'clase-vieja', tipo: 'salón',
          detalle: 'El salón "A" está ocupado por la clase "Violas".',
          dia: 'miércoles', hora_inicio: '16:30:00', hora_fin: '18:30:00',
        },
      ]

      await clasesApi.resolverConflictosClases(conflictos, {
        prioridad: 'nueva',
        nuevaClaseId: 'clase-nueva',
        nuevaClaseNombre: 'Clase Nueva',
      })

      expect(supabase.from).not.toHaveBeenCalledWith('clase_horarios')
      expect(supabase.from).toHaveBeenCalledWith('clases')
      const claseUpdate = updates.clases[0]
      expect(claseUpdate.payload.necesita_revision).toBe(true)
      expect(claseUpdate.payload.revision_motivo).toContain('Clase Nueva')
      expect(claseUpdate.payload.revision_motivo).toContain('tiene prioridad')
      expect(claseUpdate.chain.eq).toHaveBeenCalledWith('id', 'clase-vieja')
    })

    it('prioritizes existing classes and flags the newly saved class for review', async () => {
      const updates = mockTables()
      const conflictos = [
        { clase_id: 'clase-vieja', tipo: 'maestro', detalle: 'El maestro ya tiene la clase "Violas" en este horario.' },
        { clase_id: 'clase-vieja', tipo: 'alumnos', detalle: '2 alumnos en dos clases a la misma hora.' },
      ]

      await clasesApi.resolverConflictosClases(conflictos, {
        prioridad: 'existentes',
        nuevaClaseId: 'clase-nueva',
        nuevaClaseNombre: 'Clase Nueva',
      })

      expect(supabase.from).not.toHaveBeenCalledWith('clase_horarios')
      expect(updates.clases).toHaveLength(1)
      expect(updates.clases[0].payload.necesita_revision).toBe(true)
      expect(updates.clases[0].payload.revision_motivo).toContain('clases existentes tienen prioridad')
      expect(updates.clases[0].payload.revision_motivo).toContain('El maestro ya tiene')
      expect(updates.clases[0].payload.revision_motivo).toContain('2 alumnos en dos clases')
      expect(updates.clases[0].chain.eq).toHaveBeenCalledWith('id', 'clase-nueva')
    })

    it('does nothing when there are no conflicting class ids', async () => {
      mockTables()
      await clasesApi.resolverConflictosClases([], {
        prioridad: 'nueva',
        nuevaClaseId: 'clase-nueva',
        nuevaClaseNombre: 'Clase Nueva',
      })
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('obtenerAlumnosSinClase', () => {
    it('excludes enrolled students and groups the rest by instrumento_principal, most-missing first', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'alumnos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                { id: 'a1', nombre_completo: 'Ana', instrumento_principal: 'Violín' },
                { id: 'a2', nombre_completo: 'Beto', instrumento_principal: 'Violín' },
                { id: 'a3', nombre_completo: 'Caro', instrumento_principal: 'Piano' },
                { id: 'a4', nombre_completo: 'Dana', instrumento_principal: null },
              ],
              error: null,
            }),
          }
        }
        if (table === 'alumnos_clases') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [{ alumno_id: 'a2' }], error: null }),
          }
        }
        throw new Error(`unexpected table ${table}`)
      })

      const grupos = await clasesApi.obtenerAlumnosSinClase()

      const porInstrumento = Object.fromEntries(grupos.map(g => [g.instrumento, g]))
      expect(porInstrumento['Violín'].total).toBe(1)
      expect(porInstrumento['Violín'].alumnos.map(a => a.id)).toEqual(['a1'])
      expect(porInstrumento['Piano'].total).toBe(1)
      expect(porInstrumento['Sin instrumento definido'].total).toBe(1)
      // El alumno inscrito (a2) no debe aparecer en ningún grupo.
      expect(grupos.flatMap(g => g.alumnos.map(a => a.id))).not.toContain('a2')
    })

    it('returns an empty list when every active student has an active enrollment', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'alumnos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'a1', nombre_completo: 'Ana', instrumento_principal: 'Violín' }],
              error: null,
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [{ alumno_id: 'a1' }], error: null }),
        }
      })

      const grupos = await clasesApi.obtenerAlumnosSinClase()
      expect(grupos).toEqual([])
    })
  })

  describe('obtenerClasesConHorarioYCupo', () => {
    it('trae todas las clases con su horario embebido y cuenta solo inscritos activos', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'c1',
              nombre: 'Violín 101',
              maestro_principal_id: 'm1',
              capacidad_maxima: 15,
              clase_horarios: [{ dia: 'lunes', hora_inicio: '15:30:00', hora_fin: '17:00:00', salon_id: 's1' }],
              alumnos_clases: [{ id: 'a1', activo: true }, { id: 'a2', activo: true }, { id: 'a3', activo: false }],
            },
          ],
          error: null,
        }),
      })

      const clases = await clasesApi.obtenerClasesConHorarioYCupo()

      expect(supabase.from).toHaveBeenCalledWith('clases')
      expect(clases).toHaveLength(1)
      expect(clases[0].horarios).toEqual([{ dia: 'lunes', hora_inicio: '15:30:00', hora_fin: '17:00:00', salon_id: 's1' }])
      // Solo cuenta los 2 activos, el inactivo no suma al cupo ocupado
      expect(clases[0].inscritos).toBe(2)
    })

    it('sin clase_horarios ni alumnos_clases, no rompe — arrays vacíos', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [{ id: 'c1', nombre: 'Violín 101', clase_horarios: null, alumnos_clases: null }],
          error: null,
        }),
      })

      const clases = await clasesApi.obtenerClasesConHorarioYCupo()

      expect(clases[0].horarios).toEqual([])
      expect(clases[0].inscritos).toBe(0)
    })

    it('un error de Supabase se propaga (la vista decide cómo mostrarlo)', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'timeout' } }),
      })

      await expect(clasesApi.obtenerClasesConHorarioYCupo()).rejects.toBeTruthy()
    })
  })
})
