/**
 * HistorialObjetivoPanel.test.js — TDD tests for T10
 *
 * RED: written before the component exists.
 * Tests: render calls adapter, renders session rows, shows per-student summary.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api/bitacoraAdapter.js', () => ({
  getHistorialContenido: vi.fn(),
  registrarSesion: vi.fn(),
  getSemaforoPorClase: vi.fn(),
  getContenidosDeClase: vi.fn(),
}))

import { getHistorialContenido } from '../api/bitacoraAdapter.js'
import { renderHistorialObjetivoPanel } from '../components/HistorialObjetivoPanel.js'

const HISTORIAL = [
  { fecha: '2026-06-15', alumno_id: 'al-1', nota_cualitativa: 'bien', observacion: null },
  { fecha: '2026-06-15', alumno_id: 'al-2', nota_cualitativa: 'mal', observacion: 'Necesita refuerzo' },
  { fecha: '2026-06-10', alumno_id: 'al-1', nota_cualitativa: 'regular', observacion: null },
]

describe('renderHistorialObjetivoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getHistorialContenido.mockResolvedValue(HISTORIAL)
  })

  it('calls getHistorialContenido with claseId and objetivoId', async () => {
    const container = document.createElement('div')
    await renderHistorialObjetivoPanel(container, {
      claseId: 'clase-001',
      objetivoId: 'obj-1',
    })

    expect(getHistorialContenido).toHaveBeenCalledWith('clase-001', 'obj-1')
  })

  it('renders session dates in the panel', async () => {
    const container = document.createElement('div')
    await renderHistorialObjetivoPanel(container, {
      claseId: 'clase-001',
      objetivoId: 'obj-1',
    })

    expect(container.innerHTML).toContain('2026-06-15')
    expect(container.innerHTML).toContain('2026-06-10')
  })

  it('renders nota_cualitativa values for each row', async () => {
    const container = document.createElement('div')
    await renderHistorialObjetivoPanel(container, {
      claseId: 'clase-001',
      objetivoId: 'obj-1',
    })

    expect(container.innerHTML).toContain('bien')
    expect(container.innerHTML).toContain('mal')
    expect(container.innerHTML).toContain('regular')
  })

  it('renders observacion when present', async () => {
    const container = document.createElement('div')
    await renderHistorialObjetivoPanel(container, {
      claseId: 'clase-001',
      objetivoId: 'obj-1',
    })

    expect(container.innerHTML).toContain('Necesita refuerzo')
  })

  it('shows loading state while fetching', async () => {
    let resolveHistorial
    getHistorialContenido.mockReturnValue(
      new Promise((r) => { resolveHistorial = r })
    )

    const container = document.createElement('div')
    const renderPromise = renderHistorialObjetivoPanel(container, {
      claseId: 'clase-001',
      objetivoId: 'obj-1',
    })

    expect(container.innerHTML).toContain('spinner')

    resolveHistorial(HISTORIAL)
    await renderPromise
  })

  it('renders empty state when no historial rows', async () => {
    getHistorialContenido.mockResolvedValue([])

    const container = document.createElement('div')
    await renderHistorialObjetivoPanel(container, {
      claseId: 'clase-001',
      objetivoId: 'obj-1',
    })

    expect(container.innerHTML).toMatch(/sin\s+historial|no\s+hay\s+sesiones/i)
  })
})
