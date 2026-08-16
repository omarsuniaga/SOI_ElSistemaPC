import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * generarPdfRutaMaestro.test.js — exportación a PDF de la Ruta Personal del
 * maestro (Unidad → Objetivo → Indicador).
 *
 * `buildRutaMaestroPdfEstructura` es la pieza con lógica real (adjuntar el
 * promedio de nota por indicador desde el Map de agregados) y se prueba sin
 * jsPDF de por medio. `descargarPdfRutaMaestro` se prueba mockeando
 * jsPDF/autoTable, solo para verificar las filas de la tabla y el nombre de
 * archivo — no se prueba el layout visual.
 */

const saveSpy = vi.fn()
const docMock = {
  setFillColor: vi.fn(),
  setTextColor: vi.fn(),
  setFont: vi.fn(),
  setFontSize: vi.fn(),
  rect: vi.fn(),
  roundedRect: vi.fn(),
  text: vi.fn(),
  save: saveSpy,
}

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(function JsPdfMock() {
    return docMock
  }),
}))

const autoTableSpy = vi.fn()
vi.mock('jspdf-autotable', () => ({
  default: (...args) => autoTableSpy(...args),
}))

import {
  buildRutaMaestroPdfFilename,
  buildRutaMaestroPdfEstructura,
  descargarPdfRutaMaestro,
} from '../generarPdfRutaMaestro.js'

describe('buildRutaMaestroPdfFilename', () => {
  it('slugifies the class name and appends the date', () => {
    expect(buildRutaMaestroPdfFilename('Violín Inicial B', '2026-08-16')).toBe('ruta-maestro-violin-inicial-b-2026-08-16.pdf')
  })

  it('falls back to "ruta" when the name is empty', () => {
    expect(buildRutaMaestroPdfFilename('', '2026-08-16')).toBe('ruta-maestro-ruta-2026-08-16.pdf')
  })
})

describe('buildRutaMaestroPdfEstructura', () => {
  const unidades = [
    {
      nombre: 'Postura y emisión de sonido',
      objetivos: [
        {
          nombre: 'Postura',
          indicadores: [
            { id: 'ind-1', nombre: 'Espalda recta' },
            { id: 'ind-2', nombre: 'Hombros relajados' },
          ],
        },
      ],
    },
    {
      nombre: 'Escalas',
      objetivos: [{ nombre: 'Escala mayor', indicadores: [{ id: 'ind-3', nombre: 'Escala de Do mayor' }] }],
    },
  ]

  it('maps unidades directly by name, without grouping by level_id (already a real row)', () => {
    const result = buildRutaMaestroPdfEstructura(unidades)

    expect(result.map((u) => u.unidadNombre)).toEqual(['Postura y emisión de sonido', 'Escalas'])
    expect(result[0].objetivos[0].nombre).toBe('Postura')
  })

  it('attaches promedio/evaluados from the map when present, null/0 otherwise', () => {
    const notasPorIndicador = new Map([['ind-1', { promedio: 3.5, evaluados: 4 }]])
    const result = buildRutaMaestroPdfEstructura(unidades, notasPorIndicador)

    const [espaldaRecta, hombrosRelajados] = result[0].objetivos[0].indicadores
    expect(espaldaRecta).toEqual({ nombre: 'Espalda recta', nota: 3.5, evaluados: 4 })
    expect(hombrosRelajados).toEqual({ nombre: 'Hombros relajados', nota: null, evaluados: 0 })
  })

  it('returns an empty array for a route with no unidades', () => {
    expect(buildRutaMaestroPdfEstructura([])).toEqual([])
  })

  it('handles unidades/objetivos with no children gracefully', () => {
    const result = buildRutaMaestroPdfEstructura([{ nombre: 'Unidad vacía', objetivos: [{ nombre: 'Objetivo vacío' }] }])
    expect(result[0].objetivos[0].indicadores).toEqual([])
  })
})

describe('descargarPdfRutaMaestro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves the PDF with the expected filename', () => {
    descargarPdfRutaMaestro({ claseNombre: 'Violín Inicial', maestroNombre: 'Ana Pérez', unidades: [] })

    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(saveSpy.mock.calls[0][0]).toMatch(/^ruta-maestro-violin-inicial-\d{4}-\d{2}-\d{2}\.pdf$/)
  })

  it('does not call autoTable when there are no unidades (empty state, still saves)', () => {
    descargarPdfRutaMaestro({ claseNombre: 'Violín Inicial', unidades: [] })

    expect(autoTableSpy).not.toHaveBeenCalled()
    expect(saveSpy).toHaveBeenCalledTimes(1)
  })

  it('builds one table row per indicador, prefixing the id_jerarquico only on the first row of each objetivo', () => {
    descargarPdfRutaMaestro({
      claseNombre: 'Violín Inicial',
      unidades: [
        {
          unidadNombre: 'Nivel 1',
          objetivos: [
            {
              nombre: 'Postura',
              indicadores: [
                { nombre: 'Espalda recta', nota: 3.5, evaluados: 4 },
                { nombre: 'Hombros relajados', nota: null, evaluados: 0 },
              ],
            },
          ],
        },
      ],
    })

    expect(autoTableSpy).toHaveBeenCalledTimes(1)
    const [, options] = autoTableSpy.mock.calls[0]
    expect(options.body).toEqual([
      ['Nivel 1', '1.1', 'Postura', 'Espalda recta', '3.5 (n=4)'],
      ['', '', '', 'Hombros relajados', '—'],
    ])
  })

  it('only prints the Unidad name on the first row of each unidad (no repeated label)', () => {
    descargarPdfRutaMaestro({
      claseNombre: 'Violín Inicial',
      unidades: [
        {
          unidadNombre: 'Nivel 1',
          objetivos: [
            { nombre: 'Postura', indicadores: [{ nombre: 'Espalda recta', nota: null, evaluados: 0 }] },
            { nombre: 'Escalas', indicadores: [{ nombre: 'Escala de Do mayor', nota: null, evaluados: 0 }] },
          ],
        },
      ],
    })

    const [, options] = autoTableSpy.mock.calls[0]
    expect(options.body[0][0]).toBe('Nivel 1')
    expect(options.body[1][0]).toBe('')
  })

  it('shows "(sin indicadores)" when an objetivo has no indicadores yet', () => {
    descargarPdfRutaMaestro({
      claseNombre: 'Violín Inicial',
      unidades: [{ unidadNombre: 'Nivel 1', objetivos: [{ nombre: 'Postura', indicadores: [] }] }],
    })

    const [, options] = autoTableSpy.mock.calls[0]
    expect(options.body[0][3]).toBe('(sin indicadores)')
    expect(options.body[0][4]).toBe('—')
  })
})
