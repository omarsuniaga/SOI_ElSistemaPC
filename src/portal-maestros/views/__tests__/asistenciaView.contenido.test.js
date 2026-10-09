import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * asistenciaView.contenido.test.js
 *
 * Ciclo completo escribir → salir → reabrir sobre la vista REAL (con Supabase y
 * la cola offline simulados en memoria). Cada caso termina reabriendo la clase y
 * comprobando el TEXTO con el que arranca el editor, no que se haya llamado a
 * una función de guardado.
 */

const TITULAR = 'maestro-titular'
const CLASE = 'clase1'
const FECHA = '2026-10-08'

const world = vi.hoisted(() => ({
  rows: [],
  queue: [],
  nextId: 1,
  editorOpts: [],
}))

vi.mock('../../services/rutaTopicStore.js', () => ({
  consumeRutaTema: vi.fn(() => null),
  setRutaTema: vi.fn(),
}))
vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: () => ({ id: TITULAR, user_id: 'user-titular' }),
}))
vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() =>
    Promise.resolve([{ id: 'clase1', nombre: 'Violín 101', maestro_principal_id: 'maestro-titular', maestro_id: null }]),
  ),
  getHorariosClases: vi.fn(() => Promise.resolve([])),
  getInscripcionesClases: vi.fn(() => Promise.resolve([])),
  getSalones: vi.fn(() => Promise.resolve([])),
  getRutasMaestro: vi.fn(() => Promise.resolve([])),
  invalidateClasesCache: vi.fn(),
}))
vi.mock('../../services/rutaService.js', () => ({
  loadRouteTree: vi.fn(async () => []),
  resolveRutaIdForClase: vi.fn(async () => 'ruta1'),
  loadNodesForLevel: vi.fn(async () => []),
  loadIndicatorsForNode: vi.fn(async () => []),
  invalidateSemaphoresForClase: vi.fn(),
}))
vi.mock('../../services/autoDraftService.js', () => ({
  createAutoDraft: vi.fn(() => ({
    onSaved: vi.fn(),
    onInput: vi.fn(),
    flush: vi.fn(),
    destroy: vi.fn(),
  })),
  saveDraft: vi.fn(),
  loadDraft: vi.fn(async () => null),
  discardDraft: vi.fn(),
  saveObservation: vi.fn(),
}))
vi.mock('../../services/evaluationService.js', () => ({
  resolveDSL: vi.fn(),
  saveEvaluaciones: vi.fn(),
  processarEvaluacion: vi.fn(),
}))
vi.mock('../../services/navigationHooks.js', () => ({ invalidateView: vi.fn() }))
vi.mock('../../utils/a11yUtils.js', () => ({ announce: vi.fn() }))
vi.mock('../../services/classEventService.js', () => ({
  getClassEvent: vi.fn(() => Promise.resolve({ data: {} })),
  updateClassEventStatus: vi.fn(),
}))
vi.mock('../../components/LevelCompletionModal.js', () => ({ createLevelCompletionModal: vi.fn() }))
vi.mock('../../components/studentProgressPanel.js', () => ({
  createStudentProgressPanel: vi.fn(() => ({ destroy: vi.fn() })),
}))
vi.mock('../../components/routeTreeBar.js', () => ({
  createRouteTreeBar: vi.fn(() => ({ destroy: vi.fn() })),
}))
vi.mock('../../services/justificacionService.js', () => ({
  guardarJustificacion: vi.fn(),
  obtenerJustificacion: vi.fn(),
  eliminarJustificacion: vi.fn(),
}))
vi.mock('../../components/JustificacionModal.js', () => ({ createJustificacionModal: vi.fn() }))
vi.mock('../../services/substituteAuditService.js', () => ({
  logSubstituteActivity: vi.fn().mockResolvedValue(null),
  isSubstituteAssignment: () => false,
}))

// Cola offline en memoria (la misma forma que usa la vista y pendingSessionContent).
vi.mock('../../services/offlineQueue.js', () => ({
  enqueue: vi.fn(async (item) => {
    world.queue.push({ ...item, id: world.queue.length + 1, intentos: 0, created_at: new Date().toISOString() })
  }),
  getQueue: vi.fn(async () => world.queue),
  getQueueCount: vi.fn(async () => world.queue.length),
  dequeue: vi.fn(),
  processQueue: vi.fn(),
  clearQueue: vi.fn(),
}))

function genericQuery() {
  const q = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    single: vi.fn().mockResolvedValue({ data: null }),
    then: (ok) => Promise.resolve({ data: [], error: null }).then(ok),
  }
  return q
}

/** "Tabla" sesiones_clase en memoria: select / insert().select().single() / update().eq('id'). */
function sesionesQuery() {
  let mode = 'select'
  let payload = null
  const filters = {}
  const q = {
    select: () => q,
    order: () => q,
    eq: (col, val) => {
      filters[col] = val
      return q
    },
    insert: (arr) => {
      mode = 'insert'
      payload = arr[0]
      return q
    },
    update: (p) => {
      mode = 'update'
      payload = p
      return q
    },
    single: () => {
      const row = { ...payload, id: `s${world.nextId++}`, updated_at: new Date().toISOString() }
      world.rows.push(row)
      return Promise.resolve({ data: { id: row.id }, error: null })
    },
    maybeSingle: () => Promise.resolve({ data: null }),
    then: (ok) => {
      if (mode === 'update') {
        const row = world.rows.find((r) => r.id === filters.id)
        if (row) Object.assign(row, payload)
        return Promise.resolve({ error: null }).then(ok)
      }
      const data = world.rows.filter(
        (r) => (!filters.clase_id || r.clase_id === filters.clase_id) && (!filters.fecha || r.fecha === filters.fecha),
      )
      return Promise.resolve({ data, error: null }).then(ok)
    },
  }
  return q
}

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => (table === 'sesiones_clase' ? sesionesQuery() : genericQuery())),
  },
}))

// El editor real depende de innerText (jsdom no lo implementa): se captura su
// configuración para "escribir" llamando a onChange y para ver con qué texto abre.
vi.mock('../../components/dslEditor.js', () => ({
  createDslEditor: vi.fn((_container, opts) => {
    world.editorOpts.push(opts)
    return {
      insertText: vi.fn(),
      getValue: vi.fn(() => opts.initialContent),
      setValue: vi.fn(),
      setContext: vi.fn(),
      on: vi.fn(),
      destroy: vi.fn(),
    }
  }),
}))
vi.mock('../../components/dslToolbar.js', () => ({
  createDslToolbar: vi.fn(() => ({ setContext: vi.fn(), destroy: vi.fn() })),
}))

import { renderAsistenciaView } from '../asistenciaView.js'

function setOnline(value) {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true })
}

/** Abre la clase y devuelve { container, cleanup, escribir, textoInicial, estado }. */
async function abrirClase() {
  // El router reemplaza la vista anterior: no deben convivir dos con los mismos id.
  document.body.innerHTML = ''
  const container = document.createElement('div')
  document.body.appendChild(container)
  world.editorOpts.length = 0
  const cleanup = await renderAsistenciaView(container, { claseId: CLASE, fecha: FECHA })
  const opts = world.editorOpts[world.editorOpts.length - 1]
  return {
    container,
    cleanup,
    textoInicial: opts.initialContent,
    escribir: (texto) => opts.onChange(texto),
    estado: () => container.querySelector('#pm-content-save-status')?.textContent,
  }
}

const sesionRegistrada = (over = {}) => ({
  id: 's0',
  clase_id: CLASE,
  fecha: FECHA,
  maestro_id: TITULAR,
  borrador: false,
  estado: 'registrada',
  asistencia: [],
  contenido: 'Original',
  updated_at: '2026-10-08T10:00:00Z',
  ...over,
})

describe('asistenciaView — contenido del registro de clase: escribir → salir → reabrir', () => {
  beforeEach(() => {
    world.rows.length = 0
    world.queue.length = 0
    world.nextId = 1
    document.body.innerHTML = ''
    localStorage.clear()
    setOnline(true)
  })
  afterEach(() => {
    vi.useRealTimers()
    setOnline(true)
  })

  it('borrador escrito y abandonado antes de los 2 s reaparece al reabrir', async () => {
    const vista = await abrirClase()
    expect(vista.textoInicial).toBe('')

    vi.useFakeTimers()
    vista.escribir('Trabajamos arcadas')
    await vi.advanceTimersByTimeAsync(500) // el debounce de 2 s aún no venció
    expect(world.rows).toHaveLength(0)

    vista.cleanup() // el maestro sale de la vista
    await vi.advanceTimersByTimeAsync(0)
    vi.useRealTimers()
    await vi.waitFor(() => expect(world.rows).toHaveLength(1))

    const reabierta = await abrirClase()
    expect(reabierta.textoInicial).toBe('Trabajamos arcadas')
    expect(reabierta.estado()).toBe('Guardado')
  })

  it('con el debounce vencido guarda sin salir de la vista y muestra «Guardado»', async () => {
    const vista = await abrirClase()
    vi.useFakeTimers()
    vista.escribir('Hola')
    await vi.advanceTimersByTimeAsync(2000)
    vi.useRealTimers()
    await vi.waitFor(() => expect(world.rows[0]?.contenido).toBe('Hola'))
    await vi.waitFor(() => expect(vista.estado()).toBe('Guardado'))
  })

  it('edita una sesión ya registrada sin devolverla a borrador', async () => {
    world.rows.push(sesionRegistrada())
    const vista = await abrirClase()
    expect(vista.textoInicial).toBe('Original')

    vista.escribir('Original corregido')
    vista.cleanup()
    await vi.waitFor(() => expect(world.rows[0].contenido).toBe('Original corregido'))

    expect(world.rows[0].borrador).toBe(false)
    expect(world.rows[0].estado).toBe('registrada')
    const reabierta = await abrirClase()
    expect(reabierta.textoInicial).toBe('Original corregido')
  })

  it('sin red: queda «Pendiente de sincronizar» y el texto reaparece al reabrir offline', async () => {
    world.rows.push(sesionRegistrada({ borrador: true, estado: 'pendiente', contenido: 'Viejo' }))
    setOnline(false)

    const vista = await abrirClase()
    vista.escribir('Escrito sin red')
    vista.cleanup()
    await vi.waitFor(() => expect(world.queue).toHaveLength(1))

    expect(world.rows[0].contenido).toBe('Viejo') // el servidor no lo tiene
    expect(world.queue[0].preservar).toBe(true)
    expect(world.queue[0].payload.contenido).toBe('Escrito sin red')

    const reabierta = await abrirClase()
    expect(reabierta.textoInicial).toBe('Escrito sin red')
    expect(reabierta.estado()).toBe('Pendiente de sincronizar')
  })

  it('al reconectar y vaciarse la cola, el estado pasa a «Guardado»', async () => {
    world.rows.push(sesionRegistrada({ borrador: true, estado: 'pendiente', contenido: 'Viejo' }))
    setOnline(false)
    const vista = await abrirClase()
    vista.escribir('Escrito sin red')
    vista.cleanup()
    await vi.waitFor(() => expect(world.queue).toHaveLength(1))

    const reabierta = await abrirClase()
    expect(reabierta.estado()).toBe('Pendiente de sincronizar')

    // main-maestros drenó la cola hacia el servidor y avisa a las vistas abiertas
    world.rows[0].contenido = 'Escrito sin red'
    world.queue.length = 0
    setOnline(true)
    window.dispatchEvent(new CustomEvent('pm:sync-complete'))
    await vi.waitFor(() => expect(reabierta.estado()).toBe('Guardado'))
  })
})
