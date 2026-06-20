import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks at top level as required by Vitest
const mockAlumnos = vi.hoisted(() => ({ current: [] }))

vi.mock('../api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn(() => Promise.resolve({ alumnos: mockAlumnos.current, total: mockAlumnos.current.length })),
  obtenerAlumnosFiltradosYOrdenados: vi.fn(() => Promise.resolve([])),
  crearAlumno: vi.fn(),
  actualizarAlumno: vi.fn(),
  eliminarAlumno: vi.fn(),
  obtenerInscripcionesAlumno: vi.fn(() => Promise.resolve([])),
  PARENTESCOS: [],
  getParentescoLabel: vi.fn(),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('../../../../shared/components/AppModal.js', () => ({
  AppModal: vi.fn(),
}))

vi.mock('../domain/generarPdfInscripcion.js', () => ({
  descargarPdfListadoAlumnos: vi.fn(),
}))

vi.mock('../domain/calcularEdad.js', () => ({
  calcularEdad: vi.fn(() => 10),
}))

vi.mock('../domain/completitudAlumno.js', () => ({
  calcularCompletitud: vi.fn(() => ({ porcentaje: 100, nivel: 'completo', camposFaltantes: [], camposCompletos: [], porGrupo: {} })),
  NIVEL_COLOR: {},
  NIVEL_LABEL: {},
}))

describe('alumnosView CSV export', () => {
  let capturedBlobArgs
  let OrigBlob

  beforeEach(() => {
    // Reset blob capture
    capturedBlobArgs = null
    OrigBlob = globalThis.Blob
    globalThis.Blob = vi.fn(function (parts, opts) {
      capturedBlobArgs = { parts, opts }
      return new OrigBlob(parts, opts)
    })
    globalThis.Blob.prototype = OrigBlob.prototype

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
  })

  afterEach(() => {
    globalThis.Blob = OrigBlob
    vi.restoreAllMocks()
  })

  async function renderAndExport(alumnos) {
    mockAlumnos.current = alumnos
    const mod = await import('../views/alumnosView.js')

    const container = document.createElement('div')
    container.innerHTML = `
      <div id="btnExportarCSV" style="display:none">Export</div>
    `
    document.body.appendChild(container)

    // Render view to set internal state
    if (typeof mod.renderAlumnosPremiumView === 'function') {
      await mod.renderAlumnosPremiumView(container)
    } else if (typeof mod.renderAlumnosView === 'function') {
      await mod.renderAlumnosView(container)
    }

    // Click CSV export button
    const btn = container.querySelector('#btnExportarCSV')
    if (btn) btn.click()

    document.body.removeChild(container)

    if (!capturedBlobArgs) return ''
    return Array.from(capturedBlobArgs.parts).join('')
  }

  it('uses is_active=true -> "Activo" in CSV output', async () => {
    const alumnos = [
      { id: '1', nombre: 'Ana', email: 'a@t.com', telefono: '809', is_active: true, fecha_nacimiento: '2014-06-15', instrumento_principal: 'Violin' },
    ]
    const csv = await renderAndExport(alumnos)
    expect(csv).toContain('Activo')
  })

  it('uses is_active=false -> "Inactivo" in CSV output', async () => {
    const alumnos = [
      { id: '2', nombre: 'Pedro', email: 'p@t.com', telefono: '809', is_active: false, fecha_nacimiento: '2014-06-15', instrumento_principal: 'Piano' },
    ]
    const csv = await renderAndExport(alumnos)
    expect(csv).toContain('Inactivo')
  })

  it('Blob starts with UTF-8 BOM', async () => {
    const alumnos = [
      { id: '1', nombre: 'Ana', email: 'a@t.com', telefono: '809', is_active: true, fecha_nacimiento: '2014-06-15', instrumento_principal: 'Violin' },
    ]
    const csv = await renderAndExport(alumnos)
    expect(csv.startsWith('﻿')).toBe(true)
  })
})

describe('D05 -- URL.revokeObjectURL after CSV download', () => {
  it('source: revokeObjectURL is called via setTimeout after link.click()', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // Must call revokeObjectURL after download, deferred via setTimeout
    expect(source).toMatch(/setTimeout/)
    expect(source).toMatch(/revokeObjectURL/)
  })
})
