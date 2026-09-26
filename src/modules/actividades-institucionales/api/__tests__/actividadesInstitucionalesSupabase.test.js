import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listarActividades, obtenerActividad, obtenerAfectacionesVigentes } from '../actividadesInstitucionalesSupabase.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn(), auth: { getUser: vi.fn() } },
}))

// Regresión: Postgres devuelve fecha_inicio/fecha_fin como
// "2026-09-24 00:00:00+00" (timestamptz), no "2026-09-24". El primer
// intento de la vista partía ese string por "-" y producía "Invalid Date"
// en pantalla, y un día de semana incorrecto en previsualizarImpacto (que
// terminaba reportando "ninguna clase coincide" aunque sí había clases ese
// día). Encontrado en producción con una actividad real (id 3de1ebfd...).
describe('actividadesInstitucionalesSupabase — normalización de fechas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listarActividades recorta el timestamptz a "YYYY-MM-DD"', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{
          id: 'act-1',
          titulo: 'Feriado',
          categoria: 'suspension',
          alcance: 'institucional',
          fecha_inicio: '2026-09-24 00:00:00+00',
          fecha_fin: '2026-09-24 00:00:00+00',
          estado: 'aprobado',
        }],
        error: null,
      }),
    }
    supabase.from.mockReturnValue(chain)

    const [actividad] = await listarActividades()
    expect(actividad.fechaInicio).toBe('2026-09-24')
    expect(actividad.fechaFin).toBe('2026-09-24')
  })

  it('obtenerActividad también recorta la fecha del evento principal', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'calendario_institucional') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'act-1',
              titulo: 'Feriado',
              categoria: 'suspension',
              alcance: 'institucional',
              fecha_inicio: '2026-09-24 00:00:00+00',
              fecha_fin: '2026-09-24 00:00:00+00',
              estado: 'aprobado',
            },
            error: null,
          }),
        }
      }
      // afectaciones / convocatoria: sin filas, no son el foco de este test.
      // Cadena "thenable": cada .select()/.eq() encadena y también resuelve.
      const resultado = Promise.resolve({ data: [], error: null })
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        then: resultado.then.bind(resultado),
      }
      return chain
    })

    const actividad = await obtenerActividad('act-1')
    expect(actividad.fechaInicio).toBe('2026-09-24')
    expect(actividad.fechaFin).toBe('2026-09-24')
  })

  it('conserva null cuando la fecha viene vacía', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: 'act-2', titulo: 'Sin fecha', categoria: 'feriado', alcance: 'institucional', fecha_inicio: null, fecha_fin: null, estado: 'borrador' }],
        error: null,
      }),
    }
    supabase.from.mockReturnValue(chain)

    const [actividad] = await listarActividades()
    expect(actividad.fechaInicio).toBeNull()
    expect(actividad.fechaFin).toBeNull()
  })
})

describe('actividadesInstitucionalesSupabase — obtenerAfectacionesVigentes (puente a portal-maestros)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve vacío sin consultar la base si no hay clases', async () => {
    const result = await obtenerAfectacionesVigentes([], '2026-10-05')
    expect(result).toEqual([])
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('mapea afectación, actividad de origen y exentos', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    }
    chain.eq.mockImplementation((col) => {
      if (col === 'vigente') {
        return Promise.resolve({
          data: [{
            id: 'af-1',
            clase_id: 'clase-1',
            tipo_afectacion: 'impartida_con_exencion',
            motivo: 'Ensayo general',
            calendario_institucional: { id: 'act-1', titulo: 'Ensayo General Orquesta', descripcion: 'desc' },
            calendario_exenciones_alumno: [{ alumno_id: 'al-1', alumnos: { nombre_completo: 'Juan Pérez' } }],
          }],
          error: null,
        })
      }
      return chain
    })
    supabase.from.mockReturnValue(chain)

    const [af] = await obtenerAfectacionesVigentes(['clase-1'], '2026-10-05')
    expect(af).toEqual({
      claseId: 'clase-1',
      afectacionId: 'af-1',
      tipoAfectacion: 'impartida_con_exencion',
      motivo: 'Ensayo general',
      actividadId: 'act-1',
      actividadTitulo: 'Ensayo General Orquesta',
      actividadDescripcion: 'desc',
      exentos: [{ alumnoId: 'al-1', nombreCompleto: 'Juan Pérez' }],
    })
  })
})
