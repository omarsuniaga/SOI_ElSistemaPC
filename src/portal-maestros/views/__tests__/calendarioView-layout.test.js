import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderCalendarioView } from '../calendarioView.js'
import * as maestroDataService from '../../services/maestroDataService.js'
import * as maestroAuth from '../../auth/maestroAuth.js'

vi.mock('../../auth/maestroAuth.js')
vi.mock('../../services/maestroDataService.js')
vi.mock('../../lib/supabaseClient.js')

describe('calendarioView - layout responsive y estados vacios', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    maestroAuth.getMaestroLocal.mockReturnValue({ id: 'maestro-1', nombre: 'Test' })
  })

  afterEach(() => {
    container?.remove()
    vi.clearAllMocks()
  })

  it('muestra estado vacio amigable cuando el maestro no tiene clases asignadas', async () => {
    maestroDataService.getMisClases.mockResolvedValue([])

    await renderCalendarioView(container)

    expect(container.textContent).toContain('Aun no tienes clases asignadas')
    expect(container.textContent).toContain('Sin clases cargadas')
    expect(container.querySelector('.pm-calendar-empty-card')).toBeTruthy()
  })

  it('renderiza calendario operativo y controles de navegación cuando existen clases', async () => {
    maestroDataService.getMisClases.mockResolvedValue([
      { id: 'clase-1', nombre: 'Violín A', maestro_id: 'maestro-1' },
    ])
    maestroDataService.getHorariosClases.mockResolvedValue([
      { clase_id: 'clase-1', dia: 'miércoles', hora_inicio: '09:00', hora_fin: '10:00' },
    ])
    maestroDataService.getSesiones.mockResolvedValue([])

    await renderCalendarioView(container)

    expect(container.querySelector('.pm-calendar-container')).toBeTruthy()
    expect(container.querySelector('.pm-cal-grid')).toBeTruthy()
    expect(container.querySelector('#pm-cal-prev')).toBeTruthy()
    expect(container.querySelector('#pm-cal-next')).toBeTruthy()
    expect(container.querySelector('#pm-cal-today')).toBeTruthy()
    expect(container.querySelector('.pm-cal-header-copy__eyebrow').textContent).toBe('Calendario operativo')
  })
})
