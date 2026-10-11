import { describe, it, expect, vi, beforeEach } from 'vitest'

const { docs, tables } = vi.hoisted(() => ({ docs: [], tables: [] }))

vi.mock('jspdf', () => {
  class FakeJsPDF {
    constructor() {
      this.internal = {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
        getNumberOfPages: () => 1,
      }
      this.lastAutoTable = { finalY: 40 }
      this.texts = []
      this.save = vi.fn()
      docs.push(this)
    }

    setFillColor() {}
    setDrawColor() {}
    rect() {}
    setFont() {}
    setFontSize() {}
    setTextColor() {}
    setPage() {}
    addPage() {}
    text(value) {
      this.texts.push(String(value))
    }
  }
  return { default: FakeJsPDF }
})

vi.mock('jspdf-autotable', () => ({
  default: (doc, options) => {
    tables.push(options)
    doc.lastAutoTable.finalY += 10
  },
}))

import { downloadClassHealthPdf } from '../classHealthPdfService.js'
import { buildClassHealthData } from '../classHealthService.js'

const timeline = [
  {
    fecha: '2026-08-27',
    clases: [{
      clase_id: 'c1',
      clase_nombre: 'Violín N2',
      maestro_nombre: 'Omar',
      instrumento: 'Violín',
      presentes: 1,
      justificados: 1,
      ausentes: 2,
      observacion_sesion: 'Escalas mayores',
      asistencias: [],
    }],
  },
  {
    fecha: '2026-09-03',
    clases: [{
      clase_id: 'c1',
      clase_nombre: 'Violín N2',
      maestro_nombre: 'Omar',
      instrumento: 'Violín',
      presentes: 0,
      justificados: 0,
      ausentes: 0,
      observacion_sesion: 'Escalas mayores en tono de do',
      asistencias: [
        { alumno_id: 'a1', alumno_nombre: 'Ana', estado: 'presente' },
        { alumno_id: 'a2', alumno_nombre: 'Luis', estado: 'tarde' },
        { alumno_id: 'a3', alumno_nombre: 'Marta', estado: 'justificado' },
        { alumno_id: 'a4', alumno_nombre: 'Pedro', estado: 'ausente' },
      ],
    }],
  },
  {
    fecha: '2026-09-10',
    clases: [
      {
        clase_id: 'c1',
        clase_nombre: 'Violín N2',
        maestro_nombre: 'Omar',
        instrumento: 'Violín',
        presentes: 4,
        justificados: 0,
        ausentes: 0,
        observacion_sesion: 'Escalas mayores en tono de sol',
        asistencias: [],
      },
      {
        clase_id: 'c2',
        clase_nombre: 'Viola N1',
        maestro_nombre: 'Omar',
        instrumento: 'Viola',
        presentes: 2,
        justificados: 0,
        ausentes: 0,
        observacion_sesion: null,
        asistencias: [],
      },
    ],
  },
]

const PERIOD = { year: 2026, monthIndex: 8 }
const GENERATED = new Date('2026-09-30T12:00:00')

function renderedText() {
  return docs[0].texts.join(' | ')
}

function allTableBodies() {
  return JSON.stringify(tables.map((t) => t.body))
}

function call(overrides = {}) {
  return downloadClassHealthPdf({
    timeline,
    year: PERIOD.year,
    monthIndex: PERIOD.monthIndex,
    periodName: 'Período Test',
    filters: { catedra: 'todas', clase: 'Todas', maestro: 'todos', busqueda: '' },
    generatedAt: GENERATED,
    ...overrides,
  })
}

describe('downloadClassHealthPdf', () => {
  beforeEach(() => {
    docs.length = 0
    tables.length = 0
  })

  it('saves one PDF named by month, without filter suffix when no filter is active', async () => {
    await call()

    expect(docs).toHaveLength(1)
    expect(docs[0].save).toHaveBeenCalledTimes(1)
    expect(docs[0].save).toHaveBeenCalledWith('Salud_Clases_2026-09.pdf')
  })

  it('adds the _Filtrado suffix when a filter is active', async () => {
    await call({ filters: { catedra: 'Violín', clase: 'Todas', maestro: 'todos', busqueda: '' } })

    expect(docs[0].save).toHaveBeenCalledWith('Salud_Clases_2026-09_Filtrado.pdf')
  })

  it('returns the same data as buildClassHealthData', async () => {
    const result = await call()

    expect(result).toEqual(buildClassHealthData(timeline, PERIOD))
  })

  it('renders a null month-over-month delta as "Sin datos" and a positive delta with a plus sign', async () => {
    await call()
    const bodies = allTableBodies()

    expect(bodies).toContain('Sin datos')
    expect(bodies).toContain('+50 pts')
  })

  it('produces a valid PDF for an empty month without throwing', async () => {
    await expect(call({ timeline: [] })).resolves.toEqual(
      buildClassHealthData([], PERIOD),
    )

    expect(docs[0].save).toHaveBeenCalledTimes(1)
    expect(allTableBodies()).toContain('Sin registros en el mes')
    expect(renderedText()).toContain('Informe de Salud de las Clases')
  })
})
