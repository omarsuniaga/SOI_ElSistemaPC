// Tests para generateDailyReport — cubre clase regular y sesión emergente
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mocks de módulos externos ──────────────────────────────────────────────
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

// openReport y downloadReport: no abrir ventanas/archivos reales en tests
vi.mock('../reportTemplates.js', () => ({
  openReport: vi.fn().mockReturnValue(true),
  downloadReport: vi.fn(),
  wrapDocument: vi.fn((html) => html),
  header: vi.fn(() => ''),
  footer: vi.fn(() => ''),
  metricChips: vi.fn(() => ''),
  attendanceCell: vi.fn((e) => e),
  progressBar: vi.fn(() => ''),
  obsBlock: vi.fn(() => ''),
  contentChips: vi.fn(() => ''),
  compBar: vi.fn(() => ''),
  esc: vi.fn((s) => String(s ?? '')),
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { openReport } from '../reportTemplates.js'
import { generateDailyReport } from '../reportService.js'

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Crea una cadena de supabase que resuelve tras N llamadas a .eq()/.lte()/.in()
 */
function makeChain(data, error = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    // Permite que el último método de la cadena resuelva con data
    then: undefined,
  }
  // Hacer que la cadena misma sea await-able para consultas sin .single()
  Object.defineProperty(chain, Symbol.toStringTag, { value: 'Promise' })
  chain[Symbol.for('nodejs.rejection')] = undefined
  return chain
}

/** Mock que resuelve la cadena directamente (para queries sin .single()) */
function makeResolvingChain(data, error = null) {
  let resolveChain
  const promise = new Promise((res) => { resolveChain = res })
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  }
  // Make the chain itself thenable so `await chain` works
  chain.then = (onFulfilled) => Promise.resolve({ data, error }).then(onFulfilled)
  chain.catch = (onRejected) => Promise.resolve({ data, error }).catch(onRejected)
  return chain
}

// ── Fixtures ───────────────────────────────────────────────────────────────

const SESION_REGULAR = {
  id: 'sesion-1',
  fecha: '2026-05-29',
  clase_id: 'clase-1',
  asistencia: [
    { alumno_id: 'a1', estado: 'P' },
    { alumno_id: 'a2', estado: 'A' },
    { alumno_id: 'a3', estado: 'J' },
  ],
  contenido: 'Escalas mayores\nArpegios',
  maestro_id: null,
  actividad: null,
  motivo: null,
}

const SESION_EMERGENTE = {
  id: 'sesion-emergente-1',
  fecha: '2026-05-29',
  clase_id: null,          // ← emergente: sin clase asignada
  asistencia: [
    { alumno_id: 'a1', estado: 'P' },
    { alumno_id: 'a4', estado: 'P' },
  ],
  contenido: '',
  maestro_id: 'maestro-1',
  actividad: 'Concierto Institucional',
  motivo: 'Concierto',
}

const CLASE_DATA = { id: 'clase-1', nombre: 'Guitarra I', instrumento: 'Guitarra', maestro_id: 'maestro-1' }
const ALUMNOS_CLASE = [
  { alumnos: { id: 'a1', nombre_completo: 'Ana Torres' } },
  { alumnos: { id: 'a2', nombre_completo: 'Bruno Vera' } },
  { alumnos: { id: 'a3', nombre_completo: 'Carlos Ruiz' } },
]
const ALUMNOS_DIRECTO = [
  { id: 'a1', nombre_completo: 'Ana Torres' },
  { id: 'a4', nombre_completo: 'Diana López' },
]

// ── Tests ──────────────────────────────────────────────────────────────────

describe('generateDailyReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Clase regular ──────────────────────────────────────────────────────

  it('clase regular: llama openReport y NO muestra error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'sesiones_clase') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: SESION_REGULAR, error: null }),
          then: (fn) => Promise.resolve({ data: 1, error: null }).then(fn),
          catch: (fn) => Promise.resolve({ data: 1, error: null }).catch(fn),
          // Para el count query
          _count: 3,
        }
      }
      if (table === 'clases') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: CLASE_DATA, error: null }),
        }
      }
      if (table === 'maestros') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { nombre_completo: 'Omar Suniaga' }, error: null }),
        }
      }
      if (table === 'alumnos_clases') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: ALUMNOS_CLASE, error: null }),
        }
      }
      // fallback
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        then: (fn) => Promise.resolve({ count: 1, error: null }).then(fn),
        catch: (fn) => Promise.resolve({ count: 1, error: null }).catch(fn),
      }
    })

    await generateDailyReport('sesion-1')

    expect(openReport).toHaveBeenCalledOnce()
    expect(AppToast.error).not.toHaveBeenCalled()
  })

  it('clase regular: el HTML generado incluye las filas de los alumnos de la clase', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'sesiones_clase') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: SESION_REGULAR, error: null }),
          then: (fn) => Promise.resolve({ count: 1, error: null }).then(fn),
          catch: (fn) => Promise.resolve({ count: 1, error: null }).catch(fn),
        }
      }
      if (table === 'clases')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: CLASE_DATA, error: null }) }
      if (table === 'maestros')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) }
      if (table === 'alumnos_clases')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: ALUMNOS_CLASE, error: null }) }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), lte: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }), then: (fn) => Promise.resolve({ count: 1 }).then(fn), catch: (fn) => Promise.resolve({ count: 1 }).catch(fn) }
    })

    await generateDailyReport('sesion-1')

    const [htmlArg] = openReport.mock.calls[0]
    // Los nombres de los alumnos aparecen en las filas de la tabla de asistencia
    expect(htmlArg).toContain('Ana Torres')
    expect(htmlArg).toContain('Bruno Vera')
    expect(htmlArg).toContain('Carlos Ruiz')
  })

  // ── Sesión emergente ───────────────────────────────────────────────────

  it('sesión emergente (clase_id=null): NO muestra error y llama openReport', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'sesiones_clase')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: SESION_EMERGENTE, error: null }) }
      if (table === 'maestros')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { nombre_completo: 'Omar Suniaga' }, error: null }) }
      if (table === 'alumnos')
        return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: ALUMNOS_DIRECTO, error: null }) }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) }
    })

    await generateDailyReport('sesion-emergente-1')

    expect(AppToast.error).not.toHaveBeenCalled()
    expect(openReport).toHaveBeenCalledOnce()
  })

  it('sesión emergente: el HTML incluye los alumnos del JSONB de la sesión', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'sesiones_clase')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: SESION_EMERGENTE, error: null }) }
      if (table === 'maestros')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) }
      if (table === 'alumnos')
        return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: ALUMNOS_DIRECTO, error: null }) }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) }
    })

    await generateDailyReport('sesion-emergente-1')

    const [htmlArg] = openReport.mock.calls[0]
    // Los alumnos de la sesión emergente aparecen en la tabla de asistencia
    expect(htmlArg).toContain('Ana Torres')
    expect(htmlArg).toContain('Diana López')
    // El filename pasado a openReport incluye la fecha de la sesión
    const [, filenameArg] = openReport.mock.calls[0]
    expect(filenameArg).toContain('20260529')
  })

  it('sesión emergente: los alumnos se cargan desde el JSONB de asistencia (no desde alumnos_clases)', async () => {
    const alumnosClasesMock = vi.fn()
    const alumnosMock = vi.fn().mockResolvedValue({ data: ALUMNOS_DIRECTO, error: null })

    supabase.from.mockImplementation((table) => {
      if (table === 'sesiones_clase')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: SESION_EMERGENTE, error: null }) }
      if (table === 'maestros')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) }
      if (table === 'alumnos_clases')
        return { select: alumnosClasesMock.mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [], error: null }) }
      if (table === 'alumnos')
        return { select: vi.fn().mockReturnThis(), in: alumnosMock }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) }
    })

    await generateDailyReport('sesion-emergente-1')

    // alumnos_clases NO debe haberse consultado para emergentes
    expect(alumnosClasesMock).not.toHaveBeenCalled()
    // alumnos SÍ debe haberse consultado
    expect(alumnosMock).toHaveBeenCalled()
  })

  // ── Error handling ─────────────────────────────────────────────────────

  it('muestra AppToast.error si la sesión no existe', async () => {
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    }))

    await generateDailyReport('sesion-invalida')

    expect(AppToast.error).toHaveBeenCalledWith(expect.stringContaining('Not found'))
    expect(openReport).not.toHaveBeenCalled()
  })

  it('muestra AppToast.error si no hay alumnos en la clase', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'sesiones_clase')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: SESION_REGULAR, error: null }), then: (fn) => Promise.resolve({ count: 1 }).then(fn), catch: (fn) => Promise.resolve({ count: 1 }).catch(fn), lte: vi.fn().mockReturnThis() }
      if (table === 'clases')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: CLASE_DATA, error: null }) }
      if (table === 'maestros')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) }
      if (table === 'alumnos_clases')
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [], error: null }) }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), lte: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }), then: (fn) => Promise.resolve({ count: 0 }).then(fn), catch: (fn) => Promise.resolve({ count: 0 }).catch(fn) }
    })

    await generateDailyReport('sesion-1')

    expect(AppToast.error).toHaveBeenCalledWith(expect.stringContaining('alumnos'))
    expect(openReport).not.toHaveBeenCalled()
  })
})

// ── Tests de openReport y downloadReport ──────────────────────────────────
describe('openReport / downloadReport', () => {
  // Estos tests verifican el comportamiento importando directamente de reportTemplates
  // Para evitar el mock completo del módulo, reimportamos con vi.importActual
  it('openReport retorna true cuando window.open tiene éxito', async () => {
    const { openReport: realOpenReport } = await vi.importActual('../reportTemplates.js')

    const mockWindow = {
      document: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
      closed: false,
      onload: null,
    }
    const originalOpen = window.open
    window.open = vi.fn().mockReturnValue(mockWindow)

    const result = realOpenReport('<html><body>test</body></html>', 'reporte-test')

    expect(result).toBe(true)
    expect(window.open).toHaveBeenCalledWith('', '_blank')
    expect(mockWindow.document.write).toHaveBeenCalledWith('<html><body>test</body></html>')

    window.open = originalOpen
  })

  it('openReport retorna false y descarga como archivo cuando window.open está bloqueado', async () => {
    const { openReport: realOpenReport } = await vi.importActual('../reportTemplates.js')

    const originalOpen = window.open
    window.open = vi.fn().mockReturnValue(null) // bloqueado

    // Mock para URL.createObjectURL y el anchor click
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    URL.revokeObjectURL = vi.fn()

    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    const result = realOpenReport('<html><body>test</body></html>', 'mi-reporte')

    expect(result).toBe(false)
    expect(URL.createObjectURL).toHaveBeenCalled()

    window.open = originalOpen
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('downloadReport crea un anchor con el nombre de archivo correcto', async () => {
    const { downloadReport: realDownloadReport } = await vi.importActual('../reportTemplates.js')

    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock')
    URL.revokeObjectURL = vi.fn()

    const anchors = []
    const originalAppend = document.body.appendChild.bind(document.body)
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'A') anchors.push(el)
    })
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    realDownloadReport('<html>test</html>', 'informe-pedagogico-2026-05')

    expect(anchors[0]?.download).toMatch(/informe-pedagogico-2026-05-\d{4}-\d{2}-\d{2}\.html/)

    vi.restoreAllMocks()
  })
})
