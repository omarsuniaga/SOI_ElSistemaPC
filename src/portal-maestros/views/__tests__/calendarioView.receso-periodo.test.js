import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderCalendarioView } from '../calendarioView.js'
import * as maestroDataService from '../../services/maestroDataService.js'
import * as maestroAuth from '../../auth/maestroAuth.js'
import * as asistenciasSupabase from '../../../modules/asistencias/api/asistenciasSupabase.js'

/**
 * calendarioView.receso-periodo.test.js
 *
 * Bug reportado por el usuario con capturas de pantalla: julio y junio 2026
 * (fuera del período activo "Vacaciones Verano", 2026-07-06 a 2026-08-09)
 * seguían mostrando puntos pendiente/vencida en el calendario del Portal
 * Maestros para fechas de un semestre ya cerrado.
 *
 * Causa: `_calcularEstadoMes` tenía una excepción (`&& !tieneSesionRealEnFecha`)
 * que saltaba el blanqueo "Receso Académico" cuando la fecha SÍ tenía una
 * sesión real registrada — que es el caso de casi todas las fechas de un
 * semestre pasado. Se eliminó esa excepción: ahora estar fuera del rango del
 * período activo blanquea la fecha SIEMPRE, sin importar el historial.
 */

vi.mock('../../auth/maestroAuth.js')
vi.mock('../../services/maestroDataService.js')
vi.mock('../../lib/supabaseClient.js')
vi.mock('../../../modules/asistencias/api/asistenciasSupabase.js')

describe('calendarioView — Receso Académico blanquea fechas fuera del período activo', () => {
  let container

  // Hoy = 2026-08-09, período activo "Vacaciones Verano" 2026-07-06..2026-08-09
  const HOY = new Date(2026, 7, 9, 12, 0, 0)

  const clases = [
    { id: 'clase-1', nombre: 'Violín A', maestro_id: 'maestro-1' },
  ]

  const horarios = [
    { clase_id: 'clase-1', dia: 'miércoles', hora_inicio: '09:00', hora_fin: '10:00' },
  ]

  // 2026-06-10 es miércoles, y pertenece al semestre YA CERRADO (fuera del
  // período activo). Tiene una sesión REAL registrada — exactamente el caso
  // que antes anulaba el blanqueo.
  const sesiones = [
    {
      id: 's-jun',
      clase_id: 'clase-1',
      fecha: '2026-06-10',
      estado: 'registrada',
      borrador: false,
      contenido: 'Clase dada el semestre pasado',
      asistencia: [{ alumno_id: 'a1', presente: true }],
    },
  ]

  beforeEach(async () => {
    container = document.createElement('div')
    document.body.appendChild(container)

    vi.useFakeTimers()
    vi.setSystemTime(HOY)

    maestroAuth.getMaestroLocal.mockReturnValue({ id: 'maestro-1', nombre: 'Test' })
    maestroDataService.getMisClases.mockResolvedValue(clases)
    maestroDataService.getHorariosClases.mockResolvedValue(horarios)
    maestroDataService.getSesiones.mockResolvedValue(sesiones)

    asistenciasSupabase.getPeriodoActivo.mockResolvedValue({
      id: 'per-verano',
      nombre: 'Vacaciones Verano',
      fecha_inicio: '2026-07-06',
      fecha_fin: '2026-08-09',
      activo: true,
    })
    asistenciasSupabase.obtenerEstadoCumplimientoMaestro.mockResolvedValue({ esCompleto: true, pendientesCount: 0 })
  })

  afterEach(() => {
    container?.remove()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('una fecha con sesión real pero fuera del período activo se muestra en blanco (receso-academico, sin puntos)', async () => {
    await renderCalendarioView(container)

    // El calendario abre en el mes actual (agosto); navegar un mes atrás a junio.
    const flush = async () => {
      for (let i = 0; i < 10; i++) await Promise.resolve()
    }
    container.querySelector('#pm-cal-prev').click()
    await flush()
    container.querySelector('#pm-cal-prev').click()
    await flush()

    const cell = container.querySelector('[data-fecha="2026-06-10"]')
    expect(cell).toBeTruthy()
    expect(cell.classList.contains('estado-receso-academico')).toBe(true)
    expect(cell.classList.contains('dia-alerta')).toBe(false)
    expect(cell.querySelectorAll('.pm-day-dot').length).toBe(0)
  })

  it('una fecha dentro del período activo con sesión pendiente SÍ muestra su punto (no se blanquea todo)', async () => {
    // 2026-08-05 (miércoles) está dentro del período activo, sin sesión
    // registrada → debería mostrarse como pendiente/vencida con su punto,
    // no como receso-academico.
    await renderCalendarioView(container)

    const cell = container.querySelector('[data-fecha="2026-08-05"]')
    expect(cell).toBeTruthy()
    expect(cell.classList.contains('estado-receso-academico')).toBe(false)
  })
})
