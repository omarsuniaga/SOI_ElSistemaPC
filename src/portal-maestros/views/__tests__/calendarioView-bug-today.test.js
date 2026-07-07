import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderCalendarioView } from '../calendarioView.js'
import * as maestroDataService from '../../services/maestroDataService.js'
import * as maestroAuth from '../../auth/maestroAuth.js'

vi.mock('../../auth/maestroAuth.js')
vi.mock('../../services/maestroDataService.js')
vi.mock('../../lib/supabaseClient.js')

describe('calendarioView - Bug 1: Today should not appear green without attendance', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'calendario'
    document.body.appendChild(container)

    // Fix time to 23:00 so that any class with hora_fin <= 22:00 has already ended
    vi.useFakeTimers()
    vi.setSystemTime(new Date().setHours(23, 0, 0, 0))

    // Mock maestro
    maestroAuth.getMaestroLocal.mockReturnValue({ id: 'maestro-1', nombre: 'Test' })
  })

  afterEach(() => {
    container?.remove()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('should show today as pendiente when session has content but NO attendance recorded', async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dateStr = today.toISOString().split('T')[0]
    const [year, month, day] = dateStr.split('-')
    const dayName = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][today.getDay()]

    // Session with content but NO attendance (draft with content only)
    const mockSession = {
      id: 'sesion-1',
      clase_id: 'clase-1',
      fecha: dateStr,
      contenido: 'Notas de clase importantes', // Has content
      asistencia: [], // NO attendance recorded
      borrador: false,
      estado: 'pendiente'
    }

    const mockClass = {
      id: 'clase-1',
      nombre: 'Violín A',
      maestro_id: 'maestro-1'
    }

    const mockHorario = {
      clase_id: 'clase-1',
      dia: dayName,
      hora_inicio: '09:00',
      hora_fin: '10:00'
    }

    maestroDataService.getMisClases.mockResolvedValue([mockClass])
    maestroDataService.getHorariosClases.mockResolvedValue([mockHorario])
    maestroDataService.getSesiones.mockResolvedValue([mockSession])

    await renderCalendarioView(container)

    // Today should be ORANGE (estado-pendiente), not GREEN (estado-registrada)
    const todayCell = container.querySelector(`[data-fecha="${dateStr}"]`)
    expect(todayCell).toBeTruthy()
    expect(todayCell.classList.contains('estado-pendiente')).toBe(true)
    expect(todayCell.classList.contains('estado-registrada')).toBe(false)
  })

  it('should show today as registrada when attendance IS recorded', async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dateStr = today.toISOString().split('T')[0]
    const [year, month, day] = dateStr.split('-')
    const dayName = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][today.getDay()]

    // Session with attendance recorded
    const mockSession = {
      id: 'sesion-1',
      clase_id: 'clase-1',
      fecha: dateStr,
      contenido: 'Notas de clase',
      asistencia: [{ alumno_id: 'a1', presente: true }], // HAS attendance
      borrador: false,
      estado: 'registrada'
    }

    const mockClass = {
      id: 'clase-1',
      nombre: 'Violín A',
      maestro_id: 'maestro-1'
    }

    const mockHorario = {
      clase_id: 'clase-1',
      dia: dayName,
      hora_inicio: '09:00',
      hora_fin: '10:00'
    }

    maestroDataService.getMisClases.mockResolvedValue([mockClass])
    maestroDataService.getHorariosClases.mockResolvedValue([mockHorario])
    maestroDataService.getSesiones.mockResolvedValue([mockSession])

    await renderCalendarioView(container)

    // Today SHOULD be GREEN (estado-registrada) when attendance exists
    const todayCell = container.querySelector(`[data-fecha="${dateStr}"]`)
    expect(todayCell).toBeTruthy()
    expect(todayCell.classList.contains('estado-registrada')).toBe(true)
  })
})
