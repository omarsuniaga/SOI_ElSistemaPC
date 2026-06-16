/**
 * BitacoraDashboard.test.js — TDD tests for T8
 *
 * RED: written before the component exists.
 * Tests: render (returns HTML string / element), interaction (buttons call adapters),
 *        semáforo color derivation per objetivo.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock adapter before component import
vi.mock('../api/bitacoraAdapter.js', () => ({
  getSemaforoPorClase: vi.fn(),
  getContenidosDeClase: vi.fn(),
  registrarSesion: vi.fn(),
  getHistorialContenido: vi.fn(),
}))

import {
  getSemaforoPorClase,
  getContenidosDeClase,
} from '../api/bitacoraAdapter.js'
import { renderBitacoraDashboard } from '../components/BitacoraDashboard.js'

const CLASE_ID = 'clase-001'

const CONTENIDOS = [
  { id: 'obj-1', descripcion: 'Escalas mayores', orden: 1 },
  { id: 'obj-2', descripcion: 'Arpegios', orden: 2 },
]

const SEMAFORO_ROWS = [
  { alumno_id: 'al-1', objetivo_id: 'obj-1', bien_count: 7, regular_count: 2, mal_count: 1, total_registros: 10 },
  { alumno_id: 'al-2', objetivo_id: 'obj-1', bien_count: 1, regular_count: 2, mal_count: 6, total_registros: 9 },
  { alumno_id: 'al-1', objetivo_id: 'obj-2', bien_count: 0, regular_count: 0, mal_count: 0, total_registros: 0 },
]

describe('renderBitacoraDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getContenidosDeClase.mockResolvedValue(CONTENIDOS)
    getSemaforoPorClase.mockResolvedValue(SEMAFORO_ROWS)
  })

  it('calls getContenidosDeClase and getSemaforoPorClase with claseId on mount', async () => {
    const container = document.createElement('div')
    await renderBitacoraDashboard(container, { claseId: CLASE_ID })

    expect(getContenidosDeClase).toHaveBeenCalledWith(CLASE_ID)
    expect(getSemaforoPorClase).toHaveBeenCalledWith(CLASE_ID)
  })

  it('renders objetivo descriptions in the DOM', async () => {
    const container = document.createElement('div')
    await renderBitacoraDashboard(container, { claseId: CLASE_ID })

    expect(container.innerHTML).toContain('Escalas mayores')
    expect(container.innerHTML).toContain('Arpegios')
  })

  it('renders semaforo color classes derived from counts', async () => {
    const container = document.createElement('div')
    await renderBitacoraDashboard(container, { claseId: CLASE_ID })

    // al-1 / obj-1 → 7/10 bien = verde
    expect(container.innerHTML).toContain('semaforo--verde')
    // al-2 / obj-1 → 6/9 mal > 50% = rojo
    expect(container.innerHTML).toContain('semaforo--rojo')
    // al-1 / obj-2 → total=0 = gris
    expect(container.innerHTML).toContain('semaforo--gris')
  })

  it('renders a "Registrar" button per objetivo', async () => {
    const container = document.createElement('div')
    await renderBitacoraDashboard(container, { claseId: CLASE_ID })

    const buttons = container.querySelectorAll('[data-action="registrar"]')
    expect(buttons.length).toBe(CONTENIDOS.length)
  })

  it('calls onRegistrar callback when Registrar button is clicked', async () => {
    const onRegistrar = vi.fn()
    const container = document.createElement('div')
    await renderBitacoraDashboard(container, { claseId: CLASE_ID, onRegistrar })

    const btn = container.querySelector('[data-action="registrar"][data-objetivo-id="obj-1"]')
    btn?.click()

    expect(onRegistrar).toHaveBeenCalledWith('obj-1')
  })

  it('calls onVerHistorial callback when historial button is clicked', async () => {
    const onVerHistorial = vi.fn()
    const container = document.createElement('div')
    await renderBitacoraDashboard(container, { claseId: CLASE_ID, onVerHistorial })

    const btn = container.querySelector('[data-action="ver-historial"][data-objetivo-id="obj-1"]')
    btn?.click()

    expect(onVerHistorial).toHaveBeenCalledWith('obj-1')
  })

  it('shows loading state while data is fetching', async () => {
    let resolveContenidos
    getContenidosDeClase.mockReturnValue(
      new Promise((r) => { resolveContenidos = r })
    )

    const container = document.createElement('div')
    const renderPromise = renderBitacoraDashboard(container, { claseId: CLASE_ID })

    // While pending, should show a loading indicator
    expect(container.innerHTML).toContain('spinner')

    resolveContenidos(CONTENIDOS)
    await renderPromise
  })
})
