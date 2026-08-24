import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * historialClasesService.test.js
 *
 * Fuente de datos compartida entre "Mis Clases Dadas" (maestro) y su
 * equivalente en el portal admin. Cubre:
 * - Solo sesiones confirmadas (borrador === false).
 * - Roster resuelto por nombre + causa de justificación.
 * - Respaldo de hora/salón desde clase_horarios cuando la sesión no los trae.
 * - Filtro por clase.
 * - Recibe maestroId explícito — no depende de getMaestroLocal().
 */

const mockGetSesiones = vi.fn()
const mockGetSalones = vi.fn(() => Promise.resolve([]))
const mockGetHorariosClases = vi.fn(() => Promise.resolve([]))

vi.mock('../maestroDataService.js', () => ({
  getSesiones: (...args) => mockGetSesiones(...args),
  getSalones: (...args) => mockGetSalones(...args),
  getHorariosClases: (...args) => mockGetHorariosClases(...args),
}))

vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '../../../lib/supabaseClient.js'
import { cargarHistorialClases } from '../historialClasesService.js'

const CLASES = [
  { id: 'clase-1', nombre: 'Violín 101', maestro_principal_id: 'maestro-1' },
  { id: 'clase-2', nombre: 'Cello 201', maestro_principal_id: 'maestro-1' },
]

const ALUMNOS = [
  { id: 'a1', nombre_completo: 'Ana Torres' },
  { id: 'a2', nombre_completo: 'Bruno Vera' },
  { id: 'a3', nombre_completo: 'Carlos Ruiz' },
]

function sesionBase(overrides) {
  return {
    id: 's1',
    fecha: '2026-08-20', // jueves
    hora_inicio: '14:00:00',
    hora_fin: '15:00:00',
    clase_id: 'clase-1',
    salon_id: null,
    borrador: false,
    contenido: '#Ana [Escalas] práctica de vibrato',
    asistencia: [
      { alumno_id: 'a1', estado: 'P' },
      { alumno_id: 'a2', estado: 'A' },
      { alumno_id: 'a3', estado: 'J' },
    ],
    ...overrides,
  }
}

function setupSupabase({ clases = CLASES, alumnos = ALUMNOS, justificaciones = [] } = {}) {
  supabase.from.mockImplementation((table) => {
    if (table === 'clases') {
      return { select: vi.fn().mockReturnThis(), or: vi.fn().mockResolvedValue({ data: clases, error: null }) }
    }
    if (table === 'alumnos') {
      return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: alumnos, error: null }) }
    }
    if (table === 'justificaciones') {
      return {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: justificaciones, error: null }),
      }
    }
    return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: [], error: null }) }
  })
}

describe('historialClasesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSalones.mockResolvedValue([])
    mockGetHorariosClases.mockResolvedValue([])
    setupSupabase()
  })

  it('excluye las sesiones en borrador', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ id: 's1', borrador: false, contenido: 'confirmada' }),
      sesionBase({ id: 's2', borrador: true, contenido: 'en-borrador' }),
    ])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones.map((s) => s.contenido)).toEqual(['confirmada'])
  })

  it('filtra por clase cuando se pasa un claseId específico', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ id: 's1', clase_id: 'clase-1' }),
      sesionBase({ id: 's2', clase_id: 'clase-2' }),
    ])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30, claseId: 'clase-1' })

    expect(sesiones).toHaveLength(1)
    expect(sesiones[0].claseId).toBe('clase-1')
  })

  it('resuelve el roster con nombres y agrupa por estado', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    const roster = sesiones[0].roster
    expect(roster.find((r) => r.alumnoId === 'a1')).toMatchObject({ nombre: 'Ana Torres', estado: 'P' })
    expect(roster.find((r) => r.alumnoId === 'a2')).toMatchObject({ nombre: 'Bruno Vera', estado: 'A' })
    expect(roster.find((r) => r.alumnoId === 'a3')).toMatchObject({ nombre: 'Carlos Ruiz', estado: 'J' })
  })

  it('adjunta la causa de justificación cuando existe', async () => {
    setupSupabase({ justificaciones: [{ sesion_id: 's1', alumno_id: 'a3', motivo: 'Cita médica' }] })
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones[0].roster.find((r) => r.alumnoId === 'a3').motivo).toBe('Cita médica')
  })

  it('un alumno sin justificación no trae motivo', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones[0].roster.find((r) => r.alumnoId === 'a2').motivo).toBeNull()
  })

  // ── Respaldo de hora/salón desde el horario recurrente ──────────────────

  it('usa el horario recurrente cuando la sesión no tiene hora propia', async () => {
    mockGetHorariosClases.mockResolvedValue([
      { clase_id: 'clase-1', dia: 'jueves', hora_inicio: '15:30:00', hora_fin: '17:00:00', salon_id: null },
    ])
    mockGetSesiones.mockResolvedValue([
      sesionBase({ fecha: '2026-08-20', hora_inicio: null, hora_fin: null }),
    ])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones[0].horaInicio).toBe('15:30:00')
    expect(sesiones[0].horaFin).toBe('17:00:00')
  })

  it('respeta la hora propia de la sesión si existe, sin usar el horario recurrente', async () => {
    mockGetHorariosClases.mockResolvedValue([
      { clase_id: 'clase-1', dia: 'jueves', hora_inicio: '15:30:00', hora_fin: '17:00:00', salon_id: null },
    ])
    mockGetSesiones.mockResolvedValue([
      sesionBase({ fecha: '2026-08-20', hora_inicio: '09:00:00', hora_fin: '10:00:00' }),
    ])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones[0].horaInicio).toBe('09:00:00')
  })

  it('elige el horario del día correcto cuando la clase se reúne varios días con horas distintas', async () => {
    mockGetHorariosClases.mockResolvedValue([
      { clase_id: 'clase-1', dia: 'jueves', hora_inicio: '14:00:00', hora_fin: '17:00:00', salon_id: null },
      { clase_id: 'clase-1', dia: 'sábado', hora_inicio: '09:00:00', hora_fin: '13:00:00', salon_id: null },
    ])
    // 2026-08-22 es sábado
    mockGetSesiones.mockResolvedValue([
      sesionBase({ fecha: '2026-08-22', hora_inicio: null, hora_fin: null }),
    ])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones[0].horaInicio).toBe('09:00:00')
  })

  it('resuelve el salón desde el horario recurrente cuando la sesión no trae salon_id', async () => {
    mockGetHorariosClases.mockResolvedValue([
      { clase_id: 'clase-1', dia: 'jueves', hora_inicio: '15:30:00', hora_fin: '17:00:00', salon_id: 'salon-1' },
    ])
    mockGetSalones.mockResolvedValue([{ id: 'salon-1', nombre: 'Aula Magna' }])
    mockGetSesiones.mockResolvedValue([sesionBase({ fecha: '2026-08-20', salon_id: null })])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones[0].salonNombre).toBe('Aula Magna')
  })

  it('sin horario recurrente disponible no rompe, deja hora/salón en null', async () => {
    mockGetHorariosClases.mockResolvedValue([])
    mockGetSesiones.mockResolvedValue([
      sesionBase({ fecha: '2026-08-20', hora_inicio: null, hora_fin: null }),
    ])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones[0].horaInicio).toBeNull()
    expect(sesiones[0].salonNombre).toBeNull()
  })

  it('un alumno que ya no está inscrito activo igual aparece por nombre resuelto por id', async () => {
    setupSupabase({ alumnos: [{ id: 'a1', nombre_completo: 'Ana Torres' }] })
    mockGetSesiones.mockResolvedValue([
      sesionBase({ asistencia: [{ alumno_id: 'a1', estado: 'P' }] }),
    ])

    const { sesiones } = await cargarHistorialClases({ maestroId: 'maestro-1', dias: 30 })

    expect(sesiones[0].roster[0].nombre).toBe('Ana Torres')
  })

  it('recibe maestroId explícito y lo pasa a getSesiones — no depende de sesión local', async () => {
    mockGetSesiones.mockResolvedValue([])

    await cargarHistorialClases({ maestroId: 'maestro-cualquiera', dias: 7 })

    expect(mockGetSesiones).toHaveBeenCalledWith('maestro-cualquiera', expect.any(String), expect.any(String))
  })
})
