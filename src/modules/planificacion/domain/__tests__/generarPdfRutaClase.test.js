import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * generarPdfRutaClase.test.js — exportación a PDF de la Ruta de Contenido
 * (Unidad → Objetivo → Indicador) para formalización académica.
 *
 * `buildRutaClasePdfEstructura` es la pieza con lógica real (agrupar por
 * Unidad/Nivel, mismo criterio que MapaClaseView._buildNodos) y se prueba
 * en profundidad sin jsPDF de por medio. `descargarPdfRutaClase` se prueba
 * mockeando jsPDF/autoTable, solo para verificar que arma las filas de la
 * tabla y el nombre de archivo correctamente — no se prueba el layout
 * visual (fuera de alcance de un test unitario).
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
  buildRutaClasePdfFilename,
  buildRutaClasePdfEstructura,
  descargarPdfRutaClase,
} from '../generarPdfRutaClase.js'

describe('buildRutaClasePdfFilename', () => {
  it('slugifies the class name and appends the date', () => {
    expect(buildRutaClasePdfFilename('Violín Inicial B', '2026-08-16')).toBe('ruta-contenido-violin-inicial-b-2026-08-16.pdf')
  })

  it('falls back to "clase" when the name is empty', () => {
    expect(buildRutaClasePdfFilename('', '2026-08-16')).toBe('ruta-contenido-clase-2026-08-16.pdf')
  })
})

describe('buildRutaClasePdfEstructura', () => {
  const niveles = [
    { id: 'nivel-1', nombre: 'Nivel 1' },
    { id: 'nivel-2', nombre: 'Nivel 2' },
  ]
  const objetivos = [
    { id: 'obj-2', nombre: 'Escalas', level_id: 'nivel-2', order_index: 0 },
    { id: 'obj-1', nombre: 'Postura', level_id: 'nivel-1', order_index: 0 },
  ]
  const indicadores = [
    { id: 'ind-1', objetivo_id: 'obj-1', descripcion: 'Espalda recta' },
    { id: 'ind-2', objetivo_id: 'obj-1', descripcion: 'Hombros relajados' },
    { id: 'ind-3', objetivo_id: 'obj-2', descripcion: 'Escala de Do mayor' },
  ]

  it('groups objetivos under their Unidad (Nivel), in the order niveles appears — not insertion order', () => {
    const result = buildRutaClasePdfEstructura(niveles, objetivos, indicadores)

    expect(result.map((u) => u.unidadNombre)).toEqual(['Nivel 1', 'Nivel 2'])
    expect(result[0].objetivos[0].nombre).toBe('Postura')
    expect(result[1].objetivos[0].nombre).toBe('Escalas')
  })

  it('attaches the indicadores that belong to each objetivo', () => {
    const result = buildRutaClasePdfEstructura(niveles, objetivos, indicadores)
    const postura = result.find((u) => u.unidadNombre === 'Nivel 1').objetivos[0]

    expect(postura.indicadores).toEqual(['Espalda recta', 'Hombros relajados'])
  })

  it('attaches estrellas/pctAvance from the map when present, null otherwise', () => {
    const estrellasMap = new Map([['obj-1', { estrellas: 2, pctAvance: 60 }]])
    const result = buildRutaClasePdfEstructura(niveles, objetivos, indicadores, estrellasMap)

    const postura = result.find((u) => u.unidadNombre === 'Nivel 1').objetivos[0]
    const escalas = result.find((u) => u.unidadNombre === 'Nivel 2').objetivos[0]
    expect(postura.estrellas).toBe(2)
    expect(postura.pctAvance).toBe(60)
    expect(escalas.estrellas).toBeNull()
  })

  it('groups objetivos with no resolvable level_id under "Sin unidad", at the end', () => {
    const conHuerfano = [...objetivos, { id: 'obj-3', nombre: 'Huérfano', level_id: 'nivel-inexistente', order_index: 0 }]
    const result = buildRutaClasePdfEstructura(niveles, conHuerfano, [])

    expect(result[result.length - 1].unidadNombre).toBe('Sin unidad')
  })

  it('returns an empty array for a class with no objetivos', () => {
    expect(buildRutaClasePdfEstructura([], [], [])).toEqual([])
  })
})

describe('descargarPdfRutaClase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves the PDF with the expected filename', () => {
    descargarPdfRutaClase({ claseNombre: 'Violín Inicial', maestroNombre: 'Ana Pérez', unidades: [] })

    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(saveSpy.mock.calls[0][0]).toMatch(/^ruta-contenido-violin-inicial-\d{4}-\d{2}-\d{2}\.pdf$/)
  })

  it('does not call autoTable when there are no unidades (empty state, still saves)', () => {
    descargarPdfRutaClase({ claseNombre: 'Violín Inicial', unidades: [] })

    expect(autoTableSpy).not.toHaveBeenCalled()
    expect(saveSpy).toHaveBeenCalledTimes(1)
  })

  it('builds one table row per objetivo, prefixing indicadores with the id_jerarquico (Unidad.Objetivo.Indicador)', () => {
    descargarPdfRutaClase({
      claseNombre: 'Violín Inicial',
      unidades: [
        {
          unidadNombre: 'Nivel 1',
          objetivos: [
            { nombre: 'Postura', estrellas: 2, pctAvance: 66, indicadores: ['Espalda recta', 'Hombros relajados'] },
          ],
        },
      ],
    })

    expect(autoTableSpy).toHaveBeenCalledTimes(1)
    const [, options] = autoTableSpy.mock.calls[0]
    expect(options.body).toEqual([
      ['Nivel 1', '1.1', 'Postura', '1.1.1 Espalda recta\n1.1.2 Hombros relajados', '★★☆', '66%'],
    ])
  })

  it('only prints the Unidad name on the first objetivo row of each unidad (no repeated label)', () => {
    descargarPdfRutaClase({
      claseNombre: 'Violín Inicial',
      unidades: [
        {
          unidadNombre: 'Nivel 1',
          objetivos: [
            { nombre: 'Postura', estrellas: null, pctAvance: null, indicadores: [] },
            { nombre: 'Escalas', estrellas: null, pctAvance: null, indicadores: [] },
          ],
        },
      ],
    })

    const [, options] = autoTableSpy.mock.calls[0]
    expect(options.body[0][0]).toBe('Nivel 1')
    expect(options.body[1][0]).toBe('')
  })

  it('shows "(sin indicadores)" and "—" placeholders when an objetivo has no data yet', () => {
    descargarPdfRutaClase({
      claseNombre: 'Violín Inicial',
      unidades: [{ unidadNombre: 'Nivel 1', objetivos: [{ nombre: 'Postura', estrellas: null, pctAvance: null, indicadores: [] }] }],
    })

    const [, options] = autoTableSpy.mock.calls[0]
    expect(options.body[0][3]).toBe('(sin indicadores)')
    expect(options.body[0][4]).toBe('—')
    expect(options.body[0][5]).toBe('—')
  })
})
