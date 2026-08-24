import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * misClasesView.test.js
 *
 * "Mis Clases Dadas": historial del maestro con el contenido tal cual lo
 * registró, asistencia detallada por alumno (con causa de justificación)
 * y metadatos de cada sesión confirmada. Cubre:
 * - Solo se muestran sesiones confirmadas (borrador === false).
 * - El contenido se muestra literal, sin escapar de más ni de menos.
 * - Los conteos P/A/J salen del JSONB `asistencia` de sesiones_clase.
 * - El roster detallado resuelve nombres y causa de justificación.
 * - El filtro por clase excluye sesiones de otras clases.
 */

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'maestro-1' })),
}))

const mockGetMisClases = vi.fn()
const mockGetSesiones = vi.fn()
const mockGetSalones = vi.fn(() => Promise.resolve([]))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: (...args) => mockGetMisClases(...args),
  getSesiones: (...args) => mockGetSesiones(...args),
  getSalones: (...args) => mockGetSalones(...args),
}))

// misClasesView resuelve nombres de alumnos y causas de justificación con
// consultas directas a supabase (no pasan por maestroDataService) — mismo
// patrón que el resto de las vistas del portal.
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))

vi.mock('../../services/reportService.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, generateDailyReport: vi.fn() }
})

// El reporte de rango arma su propio HTML con estos builders — se dejan
// como passthrough para poder inspeccionar el contenido final, y se
// espía openReport para no abrir un modal real en jsdom.
vi.mock('../../services/reportTemplates.js', () => ({
  header: vi.fn((d) => `[header clase=${d.clase} docente=${d.docente} periodo=${d.periodo}]`),
  footer: vi.fn((p, t) => `[footer ${p}/${t}]`),
  metricChips: vi.fn((m) => `[chips ${m.map((x) => `${x.label}:${x.value}`).join(',')}]`),
  wrapDocument: vi.fn((html) => html),
  openReport: vi.fn(() => true),
  esc: vi.fn((s) => String(s ?? '')),
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { getMaestroLocal } from '../../auth/maestroAuth.js'
import { generateDailyReport } from '../../services/reportService.js'
import { openReport } from '../../services/reportTemplates.js'
import { renderMisClasesView } from '../misClasesView.js'

const CLASES = [
  { id: 'clase-1', nombre: 'Violín 101' },
  { id: 'clase-2', nombre: 'Cello 201' },
]

const ALUMNOS = [
  { id: 'a1', nombre_completo: 'Ana Torres' },
  { id: 'a2', nombre_completo: 'Bruno Vera' },
  { id: 'a3', nombre_completo: 'Carlos Ruiz' },
]

function sesionBase(overrides) {
  return {
    id: 's1',
    fecha: '2026-08-20',
    hora_inicio: '14:00:00',
    hora_fin: '15:00:00',
    clase_id: 'clase-1',
    salon_id: null,
    borrador: false,
    contenido: '#Ana [Escalas] práctica de vibrato',
    asistencia: [
      { alumno_id: 'a1', estado: 'P' },
      { alumno_id: 'a2', estado: 'A' },
      { alumno_id: 'a3', estado: 'J' },
    ],
    ...overrides,
  }
}

/** Setup por defecto: alumnos resuelve ALUMNOS, justificaciones vacío. */
function setupSupabase({ alumnos = ALUMNOS, justificaciones = [] } = {}) {
  supabase.from.mockImplementation((table) => {
    if (table === 'alumnos') {
      return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: alumnos, error: null }) }
    }
    if (table === 'justificaciones') {
      return {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: justificaciones, error: null }),
      }
    }
    return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: [], error: null }) }
  })
}

describe('misClasesView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMisClases.mockResolvedValue(CLASES)
    mockGetSalones.mockResolvedValue([])
    getMaestroLocal.mockReturnValue({ id: 'maestro-1' })
    setupSupabase()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('muestra el contenido de la sesión literal, sin reformatear', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('#Ana [Escalas] práctica de vibrato')
  })

  it('escapa HTML en el contenido para evitar inyección', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ contenido: '<img src=x onerror=alert(1)>' }),
    ])

    await renderMisClasesView(container)

    expect(container.innerHTML).not.toContain('<img src=x')
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
  })

  it('excluye las sesiones en borrador — no son "clases dadas" todavía', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ id: 's1', borrador: false, contenido: 'confirmada' }),
      sesionBase({ id: 's2', borrador: true, contenido: 'todavia-en-borrador' }),
    ])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('confirmada')
    expect(container.textContent).not.toContain('todavia-en-borrador')
  })

  it('calcula presentes/ausentes/justificados desde el JSONB de asistencia', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('1 P')
    expect(container.textContent).toContain('1 A')
    expect(container.textContent).toContain('1 J')
  })

  it('muestra un aviso cuando la sesión no tiene contenido registrado', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({ contenido: null })])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('Sin contenido registrado')
  })

  it('muestra estado vacío cuando no hay sesiones confirmadas en el rango', async () => {
    mockGetSesiones.mockResolvedValue([])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('No hay clases registradas en este rango')
  })

  it('sin sesión de maestro activa, muestra mensaje y no consulta datos', async () => {
    getMaestroLocal.mockReturnValueOnce(null)

    await renderMisClasesView(container)

    expect(container.textContent).toContain('No hay sesión activa')
    expect(mockGetSesiones).not.toHaveBeenCalled()
  })

  it('filtra por clase cuando el maestro cambia el selector', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ id: 's1', clase_id: 'clase-1', contenido: 'contenido-violin' }),
      sesionBase({ id: 's2', clase_id: 'clase-2', contenido: 'contenido-cello' }),
    ])

    await renderMisClasesView(container)
    expect(container.textContent).toContain('contenido-violin')
    expect(container.textContent).toContain('contenido-cello')

    const selectClase = container.querySelector('#pm-misclases-clase')
    selectClase.value = 'clase-1'
    selectClase.dispatchEvent(new Event('change'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(container.textContent).toContain('contenido-violin')
    expect(container.textContent).not.toContain('contenido-cello')
  })

  // ── Roster detallado: quién asistió, quién faltó, quién justificó ──────

  it('resuelve los nombres de los alumnos en el roster, agrupados por estado', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('Presentes (1)')
    expect(container.textContent).toContain('Ana Torres')
    expect(container.textContent).toContain('Ausentes (1)')
    expect(container.textContent).toContain('Bruno Vera')
    expect(container.textContent).toContain('Justificados (1)')
    expect(container.textContent).toContain('Carlos Ruiz')
  })

  it('muestra la causa de la justificación cuando existe', async () => {
    setupSupabase({
      justificaciones: [{ sesion_id: 's1', alumno_id: 'a3', motivo: 'Cita médica' }],
    })
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('Cita médica')
  })

  it('un alumno ausente sin justificación no muestra motivo', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    await renderMisClasesView(container)

    const listaAusentes = [...container.querySelectorAll('.pm-misclases-roster-grupo')].find((g) =>
      g.textContent.includes('Ausentes'),
    )
    expect(listaAusentes?.querySelector('.pm-misclases-roster-motivo')).toBeFalsy()
  })

  it('un alumno que ya no aparece en alumnos activos igual se muestra por nombre resuelto por id', async () => {
    setupSupabase({ alumnos: [{ id: 'a1', nombre_completo: 'Ana Torres' }] })
    mockGetSesiones.mockResolvedValue([
      sesionBase({ asistencia: [{ alumno_id: 'a1', estado: 'P' }] }),
    ])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('Ana Torres')
  })

  it('el botón de reporte por sesión es solo ícono (sin texto) para no saturar la lista', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])
    await renderMisClasesView(container)

    const btn = container.querySelector('.pm-misclases-btn-reporte')
    expect(btn).toBeTruthy()
    expect(btn.dataset.sesionId).toBe('s1')
    expect(btn.getAttribute('aria-label')).toMatch(/reporte/i)
    // Sin texto visible — solo el ícono
    expect(btn.textContent.trim()).toBe('')
  })

  it('genera el reporte diario al hacer click en el botón por sesión', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])
    await renderMisClasesView(container)

    container.querySelector('.pm-misclases-btn-reporte').click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(generateDailyReport).toHaveBeenCalledWith('s1')
  })

  // ── Reporte del rango completo (todas las clases visibles) ─────────────

  it('el botón "Descargar reporte" del rango está deshabilitado si no hay sesiones', async () => {
    mockGetSesiones.mockResolvedValue([])
    await renderMisClasesView(container)

    const btn = container.querySelector('#pm-misclases-btn-reporte-rango')
    expect(btn.disabled).toBe(true)
  })

  it('el reporte de rango incluye todas las sesiones visibles, con roster y motivo', async () => {
    setupSupabase({
      justificaciones: [{ sesion_id: 's1', alumno_id: 'a3', motivo: 'Cita médica' }],
    })
    mockGetSesiones.mockResolvedValue([
      sesionBase({ id: 's1', fecha: '2026-08-20', contenido: 'contenido sesion 1' }),
      sesionBase({ id: 's2', fecha: '2026-08-13', contenido: 'contenido sesion 2' }),
    ])

    await renderMisClasesView(container)
    container.querySelector('#pm-misclases-btn-reporte-rango').click()

    expect(openReport).toHaveBeenCalledOnce()
    const [htmlArg, , opts] = openReport.mock.calls[0]
    expect(htmlArg).toContain('contenido sesion 1')
    expect(htmlArg).toContain('contenido sesion 2')
    expect(htmlArg).toContain('Ana Torres')
    expect(htmlArg).toContain('Cita médica')
    expect(opts.title).toMatch(/Reporte de Clases/)
  })

  it('el reporte de rango respeta el filtro de clase activo', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ id: 's1', clase_id: 'clase-1', contenido: 'contenido-violin' }),
      sesionBase({ id: 's2', clase_id: 'clase-2', contenido: 'contenido-cello' }),
    ])
    await renderMisClasesView(container)

    const selectClase = container.querySelector('#pm-misclases-clase')
    selectClase.value = 'clase-1'
    selectClase.dispatchEvent(new Event('change'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))

    container.querySelector('#pm-misclases-btn-reporte-rango').click()

    const [htmlArg] = openReport.mock.calls.at(-1)
    expect(htmlArg).toContain('contenido-violin')
    expect(htmlArg).not.toContain('contenido-cello')
  })
})
