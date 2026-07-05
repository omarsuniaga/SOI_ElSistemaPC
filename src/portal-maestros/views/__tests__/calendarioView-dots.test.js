import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderCalendarioView } from '../calendarioView.js'
import * as maestroDataService from '../../services/maestroDataService.js'
import * as maestroAuth from '../../auth/maestroAuth.js'

vi.mock('../../auth/maestroAuth.js')
vi.mock('../../services/maestroDataService.js')
vi.mock('../../lib/supabaseClient.js')

describe('calendarioView - puntos por clase y fondo de alerta', () => {
  let container

  // Miércoles fijo de referencia: hoy = 2026-06-17
  const HOY = new Date(2026, 5, 17, 12, 0, 0)

  const clases = [
    { id: 'clase-1', nombre: 'Violín A', maestro_id: 'maestro-1' },
    { id: 'clase-2', nombre: 'Cello B', maestro_id: 'maestro-1' },
  ]

  const horarios = [
    { clase_id: 'clase-1', dia: 'miércoles', hora_inicio: '09:00', hora_fin: '10:00' },
    { clase_id: 'clase-2', dia: 'miércoles', hora_inicio: '10:00', hora_fin: '11:00' },
  ]

  const sesiones = [
    // 06-03: clase-1 registrada, clase-2 en borrador → verde + amarillo, fondo alerta
    {
      id: 's1',
      clase_id: 'clase-1',
      fecha: '2026-06-03',
      estado: 'registrada',
      borrador: false,
      contenido: 'Clase dada',
      asistencia: [{ alumno_id: 'a1', presente: true }],
    },
    {
      id: 's2',
      clase_id: 'clase-2',
      fecha: '2026-06-03',
      estado: 'pendiente',
      borrador: true,
      contenido: 'Notas a medias',
      asistencia: [],
    },
    // 06-10: solo clase-1 registrada; clase-2 sin sesión → verde + rojo, fondo alerta
    {
      id: 's3',
      clase_id: 'clase-1',
      fecha: '2026-06-10',
      estado: 'registrada',
      borrador: false,
      contenido: 'Clase dada',
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

    await renderCalendarioView(container)
  })

  afterEach(() => {
    container?.remove()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('día con una clase registrada y otra en borrador: verde + amarillo, fondo alerta', () => {
    const cell = container.querySelector('[data-fecha="2026-06-03"]')
    expect(cell).toBeTruthy()
    expect(cell.querySelectorAll('.pm-day-dot').length).toBe(2)
    expect(cell.querySelectorAll('.pm-dot-verde').length).toBe(1)
    expect(cell.querySelectorAll('.pm-dot-amarillo').length).toBe(1)
    expect(cell.classList.contains('dia-alerta')).toBe(true)
  })

  it('día con una clase registrada y otra sin registrar: verde + rojo, fondo alerta', () => {
    const cell = container.querySelector('[data-fecha="2026-06-10"]')
    expect(cell).toBeTruthy()
    expect(cell.querySelectorAll('.pm-day-dot').length).toBe(2)
    expect(cell.querySelectorAll('.pm-dot-verde').length).toBe(1)
    expect(cell.querySelectorAll('.pm-dot-rojo').length).toBe(1)
    expect(cell.classList.contains('dia-alerta')).toBe(true)
  })

  it('día futuro con clases programadas: puntos grises, sin fondo alerta', () => {
    const cell = container.querySelector('[data-fecha="2026-06-24"]')
    expect(cell).toBeTruthy()
    expect(cell.querySelectorAll('.pm-day-dot').length).toBe(2)
    expect(cell.querySelectorAll('.pm-dot-gris').length).toBe(2)
    expect(cell.classList.contains('dia-alerta')).toBe(false)
  })

  it('día sin clases programadas: sin puntos y sin fondo alerta', () => {
    // 2026-06-05 es viernes — no hay horario ese día
    const cell = container.querySelector('[data-fecha="2026-06-05"]')
    expect(cell).toBeTruthy()
    expect(cell.querySelectorAll('.pm-day-dot').length).toBe(0)
    expect(cell.classList.contains('dia-alerta')).toBe(false)
  })
})
