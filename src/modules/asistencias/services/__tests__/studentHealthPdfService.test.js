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
    splitTextToSize(text) {
      const value = String(text)
      const lines = []
      for (let i = 0; i < value.length; i += 40) lines.push(value.slice(i, i + 40))
      return lines.length ? lines : ['']
    }
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

vi.mock('../../../progresos/api/progresosApi.js', () => ({
  getStudentProgressBatch: vi.fn(async () => new Map()),
}))

import { downloadStudentHealthPdf } from '../studentHealthPdfService.js'

const cell = (c) => (c && typeof c === 'object' ? String(c.content ?? '') : String(c))
const allCells = () => tables.flatMap((t) => [
  ...(t.head || []).flat().map(cell),
  ...(t.body || []).flat().map(cell),
])
const allTableBodies = () => tables.flatMap((t) => (t.body || []).flat().map(cell))
const renderedText = () => docs.flatMap((d) => d.texts).join('\n')
const tableWithHead = (head) => tables.find((t) => JSON.stringify(t.head) === JSON.stringify([head]))

const dia = (fecha, clases) => ({ fecha, clases })
const clase = (nombre, asistencias, extra = {}) => ({
  clase_id: nombre.toLowerCase().replace(/\s+/g, '-'),
  clase_nombre: nombre,
  maestro_nombre: 'Omar',
  instrumento: 'Violín',
  asistencias,
  ...extra,
})
const fila = (alumno_id, alumno_nombre, estado, extra = {}) => ({ alumno_id, alumno_nombre, estado, ...extra })

const YEAR = 2026
const MONTH = 2 // March
const GENERATED_AT = new Date('2026-03-20T12:00:00Z')

const timeline = [
  dia('2026-02-10', [clase('Violín N2', [fila('a1', 'Ana', 'presente')], { observacion_clase: 'Febrero' })]),
  dia('2026-03-02', [clase('Violín N2', [
    fila('a1', 'Ana', 'ausente'),
    fila('a2', 'Beto', 'presente'),
  ], { observacion_clase: 'Contenido ausente XYZ' })]),
  dia('2026-03-09', [clase('Violín N2', [
    fila('a1', 'Ana', 'presente'),
    fila('a2', 'Beto', 'presente'),
  ], { observacion_clase: 'Clase recibida hoy' })]),
  dia('2026-03-16', [clase('Violín N2', [
    fila('a1', 'Ana', 'ausente'),
    fila('a2', 'Beto', 'presente'),
  ])]),
]

const call = (overrides = {}) => downloadStudentHealthPdf({
  timeline,
  year: YEAR,
  monthIndex: MONTH,
  periodId: 'p1',
  periodName: 'Semestre 1',
  filters: {},
  generatedAt: GENERATED_AT,
  loadProgress: vi.fn(async () => new Map()),
  ...overrides,
})

beforeEach(() => {
  docs.length = 0
  tables.length = 0
})

describe('downloadStudentHealthPdf: file name and save', () => {
  it('saves one PDF named by month, without filter suffix when no filter is active', async () => {
    await call()

    expect(docs).toHaveLength(1)
    expect(docs[0].save).toHaveBeenCalledTimes(1)
    expect(docs[0].save).toHaveBeenCalledWith('Salud_Estudiantes_2026-03.pdf')
  })

  it('adds the _Filtrado suffix when a filter is active', async () => {
    await call({ filters: { busqueda: 'Ana' } })

    expect(docs[0].save).toHaveBeenCalledWith('Salud_Estudiantes_2026-03_Filtrado.pdf')
  })
})

describe('downloadStudentHealthPdf: rendering', () => {
  it('prints the six recommendation fields for a recommended student', async () => {
    await call()

    const cells = allCells()
    for (const label of ['Qué ocurrió', 'Evidencia', 'Por qué importa', 'Acción sugerida', 'Quién decide', 'Cuándo revisar']) {
      expect(cells).toContain(label)
    }
  })

  it('prints "Sin señales en el período" for a student without recommendations', async () => {
    await call()

    expect(allCells()).toContain('Sin señales en el período')
  })

  it('does not print the received-content table with absent or justified session content', async () => {
    await call()

    const received = tableWithHead(['Fecha', 'Clase', 'Contenido'])
    expect(received).toBeDefined()
    const receivedText = received.body.flat().map(cell).join(' | ')
    expect(receivedText).toContain('Clase recibida hoy')
    expect(receivedText).not.toContain('Contenido ausente XYZ')
    expect(allTableBodies()).toContain('Contenido ausente XYZ')
  })

  it('renders the methodology paragraph stating that a named person decides', async () => {
    await call()

    expect(allCells().join(' ')).toMatch(/no son decisiones/i)
  })

  it('produces a valid PDF for an empty month without throwing', async () => {
    await expect(call({ timeline: [] })).resolves.toBeDefined()

    expect(docs[0].save).toHaveBeenCalledTimes(1)
    expect(renderedText()).toContain('Informe de Salud de los Estudiantes')
    expect(allCells()).toContain('Sin recomendaciones en el período')
  })
})

describe('downloadStudentHealthPdf: progress loading', () => {
  it('loads progress for the student ids, period id and the window from first date to end of month', async () => {
    const loadProgress = vi.fn(async () => new Map())

    await call({ loadProgress })

    expect(loadProgress).toHaveBeenCalledTimes(1)
    expect(loadProgress).toHaveBeenCalledWith({
      studentIds: ['a1', 'a2'],
      periodId: 'p1',
      from: '2026-02-10',
      to: '2026-03-31',
    })
  })

  it('still saves the PDF and reports progressAvailable = false when loading progress rejects', async () => {
    const loadProgress = vi.fn(async () => { throw new Error('network') })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const data = await call({ loadProgress })

    expect(docs[0].save).toHaveBeenCalledTimes(1)
    expect(data.summary.progressAvailable).toBe(false)
    expect(data.students.every((s) => s.progress === null)).toBe(true)
    expect(renderedText()).toContain('No se pudieron cargar las evaluaciones')
  })

  it('reports progressAvailable = true when progress loads', async () => {
    const data = await call()

    expect(data.summary.progressAvailable).toBe(true)
  })

  it('does not call loadProgress and does not throw for an empty timeline', async () => {
    const loadProgress = vi.fn(async () => new Map())

    await expect(call({ timeline: [], loadProgress })).resolves.toBeDefined()

    expect(loadProgress).not.toHaveBeenCalled()
  })
})

describe('downloadStudentHealthPdf: detail tables are labeled', () => {
  it('titles the received and the not-received content tables', async () => {
    await call()

    const printed = docs[0].texts
    expect(printed).toContain('Contenido recibido en el mes')
    expect(printed).toContain('Contenido no recibido (ausente o justificado)')
  })
})
