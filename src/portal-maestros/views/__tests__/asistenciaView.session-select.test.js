import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Regresión: desde 8f791d7 la consulta de la sesión del día pedía una columna
 * `tipo` que NO existe en `sesiones_clase` y omitía `maestro_id`. PostgREST
 * rechaza la consulta entera ante una columna inexistente, así que la vista
 * creía que la clase no tenía sesión: asistencia en 0 y Registro de Clase vacío
 * aunque la base tuviera ambas cosas guardadas. Además, sin `maestro_id` el
 * filtro de pertenencia descartaba cualquier fila.
 *
 * Los mocks genéricos (select → mockReturnThis) no podían detectarlo porque
 * ignoran las columnas pedidas. Este mock se comporta como PostgREST: valida
 * cada columna contra el esquema real y devuelve solo las columnas pedidas.
 */

// Columnas reales de public.sesiones_clase (producción, 2026-10-11).
const SESIONES_CLASE_COLUMNS = new Set([
  'id', 'clase_id', 'horario_id', 'maestro_id', 'salon_id', 'fecha', 'hora_inicio',
  'hora_fin', 'tema_principal', 'contenidos_trabajados', 'observaciones_generales',
  'estado', 'cerrada_en', 'created_at', 'updated_at', 'borrador', 'contenido',
  'contenido_dsl', 'asistencia', 'es_codocencia', 'actividad', 'maestro_auxiliar_id',
  'motivo', 'emergente_id', 'node_id', 'node_origen', 'node_codigo', 'lugar',
  'alcance_tipo', 'alcance_config',
])

const MAESTRO = 'maestro-1'
const SAVED_TEXT = 'Concierto para cuatro violines de Telemann, compases 1-24'

const STORED_ROW = {
  id: 'sesion-registrada-1',
  clase_id: 'clase-2b',
  maestro_id: MAESTRO,
  fecha: '2026-10-09',
  estado: 'registrada',
  borrador: false,
  contenido: SAVED_TEXT,
  asistencia: [
    { alumno_id: 'al-1', estado: 'P' },
    { alumno_id: 'al-2', estado: 'A' },
  ],
  emergente_id: null,
  updated_at: '2026-10-09T23:32:59Z',
}

const sesionesSelects = []

function postgrestLikeSesionesQuery() {
  let columns = '*'
  const q = {
    select: vi.fn((cols = '*') => {
      columns = cols
      sesionesSelects.push(cols)
      return q
    }),
    eq: vi.fn(() => q),
    in: vi.fn(() => q),
    order: vi.fn(() => q),
    limit: vi.fn(() => q),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    single: vi.fn(async () => ({ data: null, error: null })),
    then: (onFulfilled, onRejected) => {
      const requested = columns.split(',').map((c) => c.trim()).filter(Boolean)
      const unknown = requested.filter((c) => c !== '*' && !SESIONES_CLASE_COLUMNS.has(c))
      const result = unknown.length
        ? { data: null, error: { code: '42703', message: `column sesiones_clase.${unknown[0]} does not exist` } }
        : {
            data: [
              requested.includes('*')
                ? { ...STORED_ROW }
                : Object.fromEntries(requested.map((c) => [c, STORED_ROW[c]])),
            ],
            error: null,
          }
      return Promise.resolve(result).then(onFulfilled, onRejected)
    },
  }
  return q
}

function genericQuery() {
  const q = {
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    in: vi.fn(() => q),
    order: vi.fn(() => q),
    limit: vi.fn(() => q),
    ilike: vi.fn(() => q),
    gte: vi.fn(() => q),
    lte: vi.fn(() => q),
    maybeSingle: vi.fn(async () => ({ data: null })),
    single: vi.fn(async () => ({ data: null })),
    then: (onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled),
  }
  return q
}

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => (table === 'sesiones_clase' ? postgrestLikeSesionesQuery() : genericQuery())),
  },
}))

vi.mock('../../../modules/repertoire/api/repertoireRuntime.js', async () => {
  class RepertoireUnavailableError extends Error {}
  return {
    RepertoireUnavailableError,
    getRepertoireAdapter: vi.fn(() => {
      throw new RepertoireUnavailableError('no disponible')
    }),
  }
})

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: () => ({ id: MAESTRO, user_id: 'user-1', nombre: 'Maestro Prueba' }),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() =>
    Promise.resolve([
      { id: 'clase-2b', nombre: '2B - Clases de Violines', maestro_principal_id: MAESTRO, maestro_id: MAESTRO },
    ]),
  ),
  getHorariosClases: vi.fn(() => Promise.resolve([])),
  getInscripcionesClases: vi.fn(() =>
    Promise.resolve([
      { alumnos: { id: 'al-1', nombre_completo: 'Alumna Uno', instrumento_principal: 'Violín' } },
      { alumnos: { id: 'al-2', nombre_completo: 'Alumno Dos', instrumento_principal: 'Violín' } },
    ]),
  ),
  getSalones: vi.fn(() => Promise.resolve([])),
  getRutasMaestro: vi.fn(() => Promise.resolve([])),
  invalidateClasesCache: vi.fn(),
}))

vi.mock('../../services/rutaTopicStore.js', () => ({ consumeRutaTema: vi.fn(), setRutaTema: vi.fn() }))
vi.mock('../../services/offlineQueue.js', () => ({
  enqueue: vi.fn(),
  getQueueCount: vi.fn().mockResolvedValue(0),
  getQueue: vi.fn().mockResolvedValue([]),
  dequeue: vi.fn(),
  processQueue: vi.fn(),
  clearQueue: vi.fn(),
}))
vi.mock('../../services/justificacionService.js', () => ({
  guardarJustificacion: vi.fn(),
  actualizarJustificacion: vi.fn(),
  obtenerJustificacion: vi.fn(),
  eliminarJustificacion: vi.fn(),
}))
vi.mock('../../services/substituteAuditService.js', () => ({
  logSubstituteActivity: vi.fn().mockResolvedValue(null),
  isSubstituteAssignment: () => false,
}))
vi.mock('../../utils/a11yUtils.js', () => ({ announce: vi.fn() }))
vi.mock('../../services/navigationHooks.js', () => ({ invalidateView: vi.fn() }))
vi.mock('../../services/notificationService.js', () => ({ fetchNotificaciones: vi.fn().mockResolvedValue([]) }))

import { renderAsistenciaView } from '../asistenciaView.js'

describe('asistenciaView · lectura de la sesión del día desde sesiones_clase', () => {
  let container

  beforeEach(() => {
    sesionesSelects.length = 0
    container = document.createElement('div')
    container.id = 'asistencia-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
    vi.clearAllMocks()
  })

  it('solo pide columnas que existen en sesiones_clase', async () => {
    await renderAsistenciaView('asistencia-container', { claseId: 'clase-2b', fecha: '2026-10-09' })

    expect(sesionesSelects.length).toBeGreaterThan(0)
    for (const cols of sesionesSelects) {
      for (const c of cols.split(',').map((s) => s.trim())) {
        if (c !== '*') expect(SESIONES_CLASE_COLUMNS.has(c), `columna inexistente: ${c}`).toBe(true)
      }
    }
  })

  it('pide maestro_id, que el filtro de pertenencia necesita', async () => {
    await renderAsistenciaView('asistencia-container', { claseId: 'clase-2b', fecha: '2026-10-09' })

    const daySelect = sesionesSelects.find((c) => c.includes('contenido') && c.includes('asistencia'))
    expect(daySelect).toBeDefined()
    expect(daySelect.split(',').map((s) => s.trim())).toContain('maestro_id')
  })

  it('una clase ya registrada muestra su reseña guardada en el Registro de Clase', async () => {
    await renderAsistenciaView('asistencia-container', { claseId: 'clase-2b', fecha: '2026-10-09' })

    expect(container.textContent).not.toMatch(/^\s*Error:/)
    expect(container.querySelector('#pm-dsl-editable')?.textContent).toContain(SAVED_TEXT)
    expect(container.querySelector('#pm-content-save-status')?.dataset.status).toBe('saved')
  })
})
