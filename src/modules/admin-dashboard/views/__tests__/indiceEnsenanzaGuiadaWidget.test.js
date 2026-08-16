import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * indiceEnsenanzaGuiadaWidget.test.js — Spec D-01/D-02
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * Cubre `buildIndiceEnsenanzaGuiadaData` (la lógica de "quién es destacado")
 * y un renderizado básico de `renderIndiceEnsenanzaGuiadaHTML` — NO se
 * prueba el copy exacto (eso es revisión manual con DIR, ver tasks.md
 * Tarea 4.4). Lo que SÍ se prueba estructuralmente es el requisito MUST NOT
 * de D-02: nunca se nombra a un maestro por debajo del promedio.
 */

vi.mock('../../api/indiceEnsenanzaGuiadaApi.js', () => ({
  getIndiceEnsenanzaGuiada: vi.fn(),
}))

import { getIndiceEnsenanzaGuiada } from '../../api/indiceEnsenanzaGuiadaApi.js'
import {
  buildIndiceEnsenanzaGuiadaData,
  renderIndiceEnsenanzaGuiadaHTML,
  indiceEnsenanzaGuiadaWidget,
} from '../indiceEnsenanzaGuiadaWidget.js'

describe('buildIndiceEnsenanzaGuiadaData', () => {
  it('returns zeroed data when there are no registros with sesiones', () => {
    expect(buildIndiceEnsenanzaGuiadaData([])).toEqual({ promedioInstitucional: 0, totalMaestros: 0, destacados: [] })
    expect(
      buildIndiceEnsenanzaGuiadaData([{ maestroId: 'm1', nombre: 'Ana', totalSesiones: 0, sesionesConIndicador: 0, indice: 0 }])
    ).toEqual({ promedioInstitucional: 0, totalMaestros: 0, destacados: [] })
  })

  it('computes the institutional average only over maestros with at least 1 sesión registrada', () => {
    const registros = [
      { maestroId: 'm1', nombre: 'Ana', totalSesiones: 10, sesionesConIndicador: 8, indice: 0.8 },
      { maestroId: 'm2', nombre: 'Beto', totalSesiones: 10, sesionesConIndicador: 2, indice: 0.2 },
      { maestroId: 'm3', nombre: 'Sin sesiones', totalSesiones: 0, sesionesConIndicador: 0, indice: 0 },
    ]
    const result = buildIndiceEnsenanzaGuiadaData(registros)
    expect(result.totalMaestros).toBe(2)
    expect(result.promedioInstitucional).toBeCloseTo(0.5)
  })

  it('MUST NOT include any maestro below the institutional average in destacados (D-02)', () => {
    const registros = [
      { maestroId: 'm1', nombre: 'Ana (alto)', totalSesiones: 10, sesionesConIndicador: 9, indice: 0.9 },
      { maestroId: 'm2', nombre: 'Beto (bajo)', totalSesiones: 10, sesionesConIndicador: 1, indice: 0.1 },
    ]
    const { destacados, promedioInstitucional } = buildIndiceEnsenanzaGuiadaData(registros)

    expect(destacados.every((d) => d.indice >= promedioInstitucional)).toBe(true)
    expect(destacados.map((d) => d.nombre)).not.toContain('Beto (bajo)')
    expect(destacados.map((d) => d.nombre)).toContain('Ana (alto)')
  })

  it('excludes maestros with indice 0 from destacados even if the institutional average is also 0', () => {
    const registros = [
      { maestroId: 'm1', nombre: 'Solo bitácora', totalSesiones: 5, sesionesConIndicador: 0, indice: 0 },
    ]
    const { destacados } = buildIndiceEnsenanzaGuiadaData(registros)
    expect(destacados).toEqual([])
  })

  it('caps destacados at 5, sorted descending by indice', () => {
    const registros = Array.from({ length: 8 }, (_, i) => ({
      maestroId: `m${i}`,
      nombre: `Maestro ${i}`,
      totalSesiones: 10,
      sesionesConIndicador: 10 - i,
      indice: (10 - i) / 10,
    }))
    const { destacados } = buildIndiceEnsenanzaGuiadaData(registros)
    expect(destacados.length).toBeLessThanOrEqual(5)
    const indices = destacados.map((d) => d.indice)
    expect(indices).toEqual([...indices].sort((a, b) => b - a))
  })
})

describe('renderIndiceEnsenanzaGuiadaHTML', () => {
  it('renders an empty state without throwing when totalMaestros is 0', () => {
    const html = renderIndiceEnsenanzaGuiadaHTML({ promedioInstitucional: 0, totalMaestros: 0, destacados: [] })
    expect(html).toContain('premium-no-data')
  })

  it('renders the institutional average as a percentage and one card per destacado', () => {
    const html = renderIndiceEnsenanzaGuiadaHTML({
      promedioInstitucional: 0.65,
      totalMaestros: 3,
      destacados: [{ maestroId: 'm1', nombre: 'Ana Pérez', totalSesiones: 10, sesionesConIndicador: 9, indice: 0.9 }],
    })
    expect(html).toContain('65%')
    expect(html).toContain('Ana Pérez')
    expect(html).toContain('90%')
    expect((html.match(/ieg-destacado-card/g) || []).length).toBe(1)
  })

  it('escapes maestro names (XSS safety)', () => {
    const html = renderIndiceEnsenanzaGuiadaHTML({
      promedioInstitucional: 0.5,
      totalMaestros: 1,
      destacados: [{ maestroId: 'm1', nombre: '<img src=x onerror=alert(1)>', totalSesiones: 5, sesionesConIndicador: 5, indice: 1 },],
    })
    expect(html).not.toContain('<img src=x')
  })
})

describe('indiceEnsenanzaGuiadaWidget (factory)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = '<div id="ieg-container"></div>'
  })

  it('fetches data and renders it into the container on init', async () => {
    getIndiceEnsenanzaGuiada.mockResolvedValue([
      { maestroId: 'm1', nombre: 'Ana Pérez', totalSesiones: 10, sesionesConIndicador: 9, indice: 0.9 },
    ])

    const widget = indiceEnsenanzaGuiadaWidget('ieg-container')
    await widget.init()

    expect(document.getElementById('ieg-container').innerHTML).toContain('Ana Pérez')
  })

  it('shows an error card instead of throwing when the API call fails', async () => {
    getIndiceEnsenanzaGuiada.mockRejectedValue(new Error('RLS: not authorized'))

    const widget = indiceEnsenanzaGuiadaWidget('ieg-container')
    await widget.init()

    expect(document.getElementById('ieg-container').innerHTML).toContain('No se pudo cargar')
  })

  it('destroy() clears the container', async () => {
    getIndiceEnsenanzaGuiada.mockResolvedValue([])
    const widget = indiceEnsenanzaGuiadaWidget('ieg-container')
    await widget.init()

    widget.destroy()
    expect(document.getElementById('ieg-container').innerHTML).toBe('')
  })
})
