import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clasesApi from '../api/clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('clasesApi Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    it('frees the room for a salón conflict and flags the class for review', async () => {
      const updates = mockTables()
      const conflictos = [
        {
          clase_id: 'clase-vieja', tipo: 'salón',
          detalle: 'El salón "A" está ocupado por la clase "Violas".',
          dia: 'miércoles', hora_inicio: '16:30:00', hora_fin: '18:30:00',
        },
      ]

      await clasesApi.resolverConflictosClases(conflictos, 'Clase Nueva')

      expect(supabase.from).toHaveBeenCalledWith('clase_horarios')
      const horarioUpdate = updates.clase_horarios[0]
      expect(horarioUpdate.payload).toEqual({ salon_id: null })
      expect(horarioUpdate.chain.eq).toHaveBeenCalledWith('clase_id', 'clase-vieja')
      expect(horarioUpdate.chain.eq).toHaveBeenCalledWith('dia', 'miércoles')
      expect(horarioUpdate.chain.eq).toHaveBeenCalledWith('hora_inicio', '16:30:00')
      expect(horarioUpdate.chain.eq).toHaveBeenCalledWith('hora_fin', '18:30:00')

      expect(supabase.from).toHaveBeenCalledWith('clases')
      const claseUpdate = updates.clases[0]
      expect(claseUpdate.payload.necesita_revision).toBe(true)
      expect(claseUpdate.payload.revision_motivo).toContain('liberó el salón')
      expect(claseUpdate.chain.eq).toHaveBeenCalledWith('id', 'clase-vieja')
    })

    it('does NOT touch class_horarios for maestro/alumnos conflicts — only flags for human review', async () => {
      const updates = mockTables()
      const conflictos = [
        { clase_id: 'clase-vieja', tipo: 'maestro', detalle: 'El maestro ya tiene la clase "Violas" en este horario.' },
        { clase_id: 'clase-vieja', tipo: 'alumnos', detalle: '2 alumnos en dos clases a la misma hora.' },
      ]

      await clasesApi.resolverConflictosClases(conflictos, 'Clase Nueva')

      expect(supabase.from).not.toHaveBeenCalledWith('clase_horarios')
      expect(updates.clases).toHaveLength(1)
      expect(updates.clases[0].payload.necesita_revision).toBe(true)
      expect(updates.clases[0].payload.revision_motivo).toContain('El maestro ya tiene')
      expect(updates.clases[0].payload.revision_motivo).toContain('2 alumnos en dos clases')
      expect(updates.clases[0].payload.revision_motivo).not.toContain('liberó el salón')
    })

    it('does nothing when there are no conflicting class ids', async () => {
      mockTables()
      await clasesApi.resolverConflictosClases([], 'Clase Nueva')
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
})
