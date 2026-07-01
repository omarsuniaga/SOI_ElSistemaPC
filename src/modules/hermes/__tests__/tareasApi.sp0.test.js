/**
 * tareasApi.sp0.test.js
 * SP-0 — Substrato de Tareas (Hermes)
 * Tests for new application layer: comments, history, entity, attachments, observarTarea.
 * TDD: tests written BEFORE implementation (strict TDD mode).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Supabase mock ──────────────────────────────────────────────────────────
// Chainable mock supporting the patterns in tareasSupabase.js:
//   supabase.from(t).select(...).eq(...).order()  → thenable
//   supabase.from(t).insert(...).select(...).single()
//   supabase.from(t).update(...).eq(...).select(...).single()
//   supabase.rpc(fn, params)
//   supabase.storage.from(b).createSignedUrl(path, exp)

let _resolveValue = { data: [], error: null }
let _rpcValue = { data: null, error: null }
let _storageSignedUrl = 'https://mock.storage/signed?token=abc'
let _storageError = null

// We need the mock objects to be stable references so vi.mocked() finds them.
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockFrom = vi.fn()
const mockRpc = vi.fn()
const mockCreateSignedUrl = vi.fn()
const mockStorageFrom = vi.fn()

// Wire the chain: each returns the same chain object (fluent API).
const chain = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  order: mockOrder,
  single: mockSingle,
}
mockSelect.mockReturnValue(chain)
mockInsert.mockReturnValue(chain)
mockUpdate.mockReturnValue(chain)
mockEq.mockReturnValue(chain)

// order() is thenable (no .single() needed) AND also returns chain for further chaining
Object.defineProperty(mockOrder, 'mockReturnValue', { writable: true })
mockOrder.mockImplementation(() => {
  // Return a thenable chain
  const thenable = Object.assign({}, chain, {
    then(resolve, reject) {
      return Promise.resolve(_resolveValue).then(resolve, reject)
    },
  })
  return thenable
})

mockSingle.mockImplementation(() => Promise.resolve(_resolveValue))
mockFrom.mockReturnValue(chain)
mockRpc.mockImplementation(() => Promise.resolve(_rpcValue))
mockCreateSignedUrl.mockImplementation(() =>
  Promise.resolve({
    data: _storageError ? null : { signedUrl: _storageSignedUrl },
    error: _storageError,
  }),
)
mockStorageFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl })

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: (...a) => mockFrom(...a),
    rpc: (...a) => mockRpc(...a),
    storage: { from: (...a) => mockStorageFrom(...a) },
  },
}))

// ─── Import AFTER mock ──────────────────────────────────────────────────────
import * as sb from '../api/tareasSupabase.js'

// ─── Helpers ────────────────────────────────────────────────────────────────
const TAREA_ID = 'tarea-test-uuid-001'
const ACTOR = { id: 'actor-uuid-001', nombre: 'Director García' }

beforeEach(() => {
  vi.clearAllMocks()
  // Re-wire chain after clearAllMocks
  mockSelect.mockReturnValue(chain)
  mockInsert.mockReturnValue(chain)
  mockUpdate.mockReturnValue(chain)
  mockEq.mockReturnValue(chain)
  mockFrom.mockReturnValue(chain)
  mockOrder.mockImplementation(() => ({
    ...chain,
    then(resolve, reject) {
      return Promise.resolve(_resolveValue).then(resolve, reject)
    },
  }))
  mockSingle.mockImplementation(() => Promise.resolve(_resolveValue))
  mockRpc.mockImplementation(() => Promise.resolve(_rpcValue))
  mockCreateSignedUrl.mockImplementation(() =>
    Promise.resolve({
      data: _storageError ? null : { signedUrl: _storageSignedUrl },
      error: _storageError,
    }),
  )
  mockStorageFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl })
  // Reset control values
  _resolveValue = { data: [], error: null }
  _rpcValue = { data: null, error: null }
  _storageSignedUrl = 'https://mock.storage/signed?token=abc'
  _storageError = null
})

// ─────────────────────────────────────────────────────────────────────────────
// R4 — listarComentarios
// ─────────────────────────────────────────────────────────────────────────────
describe('listarComentarios', () => {
  it('returns array of comments', async () => {
    const mockComentarios = [
      { id: 'c1', tarea_id: TAREA_ID, autor_nombre: 'Ana', cuerpo: 'Primer comentario', created_at: '2026-06-26T10:00:00Z' },
      { id: 'c2', tarea_id: TAREA_ID, autor_nombre: 'Luis', cuerpo: 'Segundo comentario', created_at: '2026-06-26T11:00:00Z' },
    ]
    _resolveValue = { data: mockComentarios, error: null }

    const result = await sb.listarComentarios(TAREA_ID)

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
    expect(result[0].cuerpo).toBe('Primer comentario')
  })

  it('throws when supabase returns an error', async () => {
    _resolveValue = { data: null, error: { message: 'DB error' } }
    await expect(sb.listarComentarios(TAREA_ID)).rejects.toThrow('DB error')
  })

  it('returns empty array when data is null', async () => {
    _resolveValue = { data: null, error: null }
    const result = await sb.listarComentarios(TAREA_ID)
    expect(result).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// R4 — agregarComentario
// ─────────────────────────────────────────────────────────────────────────────
describe('agregarComentario', () => {
  it('inserts comment with actor identity', async () => {
    const inserted = {
      id: 'new-c',
      tarea_id: TAREA_ID,
      autor_id: ACTOR.id,
      autor_nombre: ACTOR.nombre,
      cuerpo: 'Buen progreso',
      created_at: '2026-06-26T12:00:00Z',
    }
    _resolveValue = { data: inserted, error: null }

    const result = await sb.agregarComentario(TAREA_ID, 'Buen progreso', ACTOR)

    expect(result).toMatchObject({
      autor_id: ACTOR.id,
      autor_nombre: ACTOR.nombre,
      cuerpo: 'Buen progreso',
    })
  })

  it('throws when cuerpo is empty string', async () => {
    await expect(sb.agregarComentario(TAREA_ID, '', ACTOR)).rejects.toThrow(/vacío|empty/i)
  })

  it('throws when cuerpo is whitespace only', async () => {
    await expect(sb.agregarComentario(TAREA_ID, '   ', ACTOR)).rejects.toThrow(/vacío|empty/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// R5 — listarHistorial
// ─────────────────────────────────────────────────────────────────────────────
describe('listarHistorial', () => {
  it('returns array of history entries', async () => {
    const mockHistorial = [
      { id: 'h1', tarea_id: TAREA_ID, campo: 'estado', valor_anterior: 'pendiente', valor_nuevo: 'en_progreso', actor_nombre: ACTOR.nombre, created_at: '2026-06-26T09:00:00Z' },
    ]
    _resolveValue = { data: mockHistorial, error: null }

    const result = await sb.listarHistorial(TAREA_ID)

    expect(Array.isArray(result)).toBe(true)
    expect(result[0].campo).toBe('estado')
    expect(result[0].actor_nombre).toBe(ACTOR.nombre)
  })

  it('returns empty array when history is null', async () => {
    _resolveValue = { data: null, error: null }
    const result = await sb.listarHistorial(TAREA_ID)
    expect(result).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// R2 — actualizarEntidadAsociada
// ─────────────────────────────────────────────────────────────────────────────
describe('actualizarEntidadAsociada', () => {
  it('updates entity fields and actor fields', async () => {
    const updatedTarea = {
      id: TAREA_ID,
      entidad_tipo: 'alumno',
      entidad_id: 'alu-uuid',
      entidad_label: 'Juan Pérez',
      updated_by: ACTOR.id,
      updated_by_nombre: ACTOR.nombre,
    }
    _resolveValue = { data: updatedTarea, error: null }

    const result = await sb.actualizarEntidadAsociada(
      TAREA_ID,
      { tipo: 'alumno', id: 'alu-uuid', label: 'Juan Pérez' },
      ACTOR,
    )

    expect(result).toMatchObject({
      entidad_tipo: 'alumno',
      entidad_label: 'Juan Pérez',
      updated_by: ACTOR.id,
    })
  })

  it('rejects invalid entidad_tipo without hitting the DB', async () => {
    await expect(
      sb.actualizarEntidadAsociada(TAREA_ID, { tipo: 'invalid_type', id: 'x', label: 'X' }, ACTOR),
    ).rejects.toThrow(/tipo.*inválido|invalid.*tipo/i)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('accepts instrumento type (polymorphic — no FK required)', async () => {
    const updated = { id: TAREA_ID, entidad_tipo: 'instrumento', entidad_label: 'Violín 3/4' }
    _resolveValue = { data: updated, error: null }

    const result = await sb.actualizarEntidadAsociada(
      TAREA_ID,
      { tipo: 'instrumento', id: 'inst-uuid', label: 'Violín 3/4' },
      ACTOR,
    )
    expect(result.entidad_tipo).toBe('instrumento')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// R6 — agregarAdjunto
// ─────────────────────────────────────────────────────────────────────────────
describe('agregarAdjunto', () => {
  it('appends adjunto to documentos_adjuntos', async () => {
    const existingTarea = { id: TAREA_ID, documentos_adjuntos: [] }
    const adjunto = {
      id: 'adj-uuid',
      nombre: 'reporte.jpg',
      storage_path: `tareas/${TAREA_ID}/adj-uuid.jpg`,
      mime_type: 'image/jpeg',
      size_bytes: 234000,
      subido_por: ACTOR.id,
      subido_por_nombre: ACTOR.nombre,
      created_at: '2026-06-26T12:00:00Z',
    }
    const afterUpdate = { ...existingTarea, documentos_adjuntos: [adjunto] }

    // First call: select existing adjuntos
    mockSingle
      .mockResolvedValueOnce({ data: existingTarea, error: null })
      // Second call: update result
      .mockResolvedValueOnce({ data: afterUpdate, error: null })

    const result = await sb.agregarAdjunto(TAREA_ID, adjunto)

    expect(Array.isArray(result.documentos_adjuntos)).toBe(true)
    expect(result.documentos_adjuntos).toHaveLength(1)
    expect(result.documentos_adjuntos[0].storage_path).toBe(`tareas/${TAREA_ID}/adj-uuid.jpg`)
  })

  it('throws when adjunto has no storage_path', async () => {
    await expect(sb.agregarAdjunto(TAREA_ID, { nombre: 'sin-path.jpg' }))
      .rejects.toThrow(/storage_path.*requerido|required/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// R6 — urlFirmada
// ─────────────────────────────────────────────────────────────────────────────
describe('urlFirmada', () => {
  it('returns a signed URL string', async () => {
    const result = await sb.urlFirmada(`tareas/${TAREA_ID}/adj-uuid.jpg`)
    expect(typeof result).toBe('string')
    expect(result).toMatch(/https?:\/\//)
  })

  it('throws when storage returns an error', async () => {
    _storageError = { message: 'Storage error' }
    await expect(sb.urlFirmada('bad/path.jpg')).rejects.toThrow('Storage error')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// R1 / D5 — observarTarea
// ─────────────────────────────────────────────────────────────────────────────
describe('observarTarea', () => {
  it('calls fn_observar_tarea RPC with correct params', async () => {
    _rpcValue = { data: null, error: null }

    await sb.observarTarea(TAREA_ID, 'Requiere revisión urgente', ACTOR)

    expect(mockRpc).toHaveBeenCalledWith('fn_observar_tarea', {
      p_tarea_id: TAREA_ID,
      p_comentario: 'Requiere revisión urgente',
      p_actor_id: ACTOR.id,
      p_actor_nombre: ACTOR.nombre,
    })
  })

  it('throws when RPC returns an error', async () => {
    _rpcValue = { data: null, error: { message: 'observar requiere comentario' } }
    await expect(sb.observarTarea(TAREA_ID, 'ok', ACTOR)).rejects.toThrow('observar requiere comentario')
  })

  it('throws locally when comentario is empty (client-side guard)', async () => {
    await expect(sb.observarTarea(TAREA_ID, '', ACTOR)).rejects.toThrow(/vacío|empty|requerido/i)
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('throws locally when comentario is whitespace only', async () => {
    await expect(sb.observarTarea(TAREA_ID, '   ', ACTOR)).rejects.toThrow(/vacío|empty|requerido/i)
    expect(mockRpc).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// tareasMock — SP-0 new fields and methods
// ─────────────────────────────────────────────────────────────────────────────
describe('tareasMock — SP-0 new fields', () => {
  it('tareas have entidad_tipo, entidad_id, entidad_label', async () => {
    const { getTareas } = await import('../api/tareasMock.js')
    const tareas = await getTareas()
    // All tareas must have the SP-0 fields (even if null)
    tareas.forEach((t) => {
      expect(t).toHaveProperty('entidad_tipo')
      expect(t).toHaveProperty('entidad_id')
      expect(t).toHaveProperty('entidad_label')
    })
    // At least one should have entity data (the enriched demos)
    const withEntity = tareas.filter((t) => t.entidad_tipo != null)
    expect(withEntity.length).toBeGreaterThan(0)
  })

  it('tareas have correlation_id as string', async () => {
    const { getTareas } = await import('../api/tareasMock.js')
    const tareas = await getTareas()
    tareas.forEach((t) => {
      expect(t).toHaveProperty('correlation_id')
      expect(typeof t.correlation_id).toBe('string')
    })
  })

  it('tareas have updated_by and updated_by_nombre', async () => {
    const { getTareas } = await import('../api/tareasMock.js')
    const tareas = await getTareas()
    tareas.forEach((t) => {
      expect(t).toHaveProperty('updated_by')
      expect(t).toHaveProperty('updated_by_nombre')
    })
  })

  it('listarComentarios returns array', async () => {
    const { listarComentarios } = await import('../api/tareasMock.js')
    const result = await listarComentarios('tarea-acm-001')
    expect(Array.isArray(result)).toBe(true)
  })

  it('agregarComentario inserts and returns the new comment', async () => {
    const { agregarComentario, listarComentarios } = await import('../api/tareasMock.js')
    const result = await agregarComentario('tarea-acm-001', 'Test comment mock', ACTOR)
    expect(result).toMatchObject({ cuerpo: 'Test comment mock', autor_nombre: ACTOR.nombre })

    const lista = await listarComentarios('tarea-acm-001')
    expect(lista.some((c) => c.cuerpo === 'Test comment mock')).toBe(true)
  })

  it('agregarComentario rejects empty body', async () => {
    const { agregarComentario } = await import('../api/tareasMock.js')
    await expect(agregarComentario('tarea-acm-001', '', ACTOR)).rejects.toThrow(/vacío|empty/i)
  })

  it('listarHistorial returns array', async () => {
    const { listarHistorial } = await import('../api/tareasMock.js')
    const result = await listarHistorial('tarea-acm-001')
    expect(Array.isArray(result)).toBe(true)
  })

  it('observarTarea transitions to observada and inserts comment', async () => {
    const { observarTarea, getTareaById, listarComentarios } = await import('../api/tareasMock.js')
    await observarTarea('tarea-com-001', 'Observada por prueba mock', ACTOR)
    const tarea = await getTareaById('tarea-com-001')
    expect(tarea.estado).toBe('observada')
    const comentarios = await listarComentarios('tarea-com-001')
    expect(comentarios.some((c) => c.cuerpo === 'Observada por prueba mock')).toBe(true)
  })

  it('observarTarea rejects empty comment', async () => {
    const { observarTarea } = await import('../api/tareasMock.js')
    await expect(observarTarea('tarea-log-001', '', ACTOR)).rejects.toThrow(/comentario|vacío|empty/i)
  })

  it('agregarAdjunto appends to documentos_adjuntos', async () => {
    const { agregarAdjunto, getTareaById } = await import('../api/tareasMock.js')
    const adjunto = {
      id: 'mock-adj-test-1',
      nombre: 'doc.pdf',
      storage_path: 'tareas/tarea-dir-001/mock-adj-test-1.pdf',
      mime_type: 'application/pdf',
      size_bytes: 10000,
      subido_por: ACTOR.id,
      subido_por_nombre: ACTOR.nombre,
      created_at: new Date().toISOString(),
    }
    await agregarAdjunto('tarea-dir-001', adjunto)
    const tarea = await getTareaById('tarea-dir-001')
    expect(tarea.documentos_adjuntos.some((a) => a.id === 'mock-adj-test-1')).toBe(true)
  })

  it('urlFirmada returns a placeholder URL string', async () => {
    const { urlFirmada } = await import('../api/tareasMock.js')
    const url = await urlFirmada('tareas/x/y.jpg')
    expect(typeof url).toBe('string')
    expect(url.length).toBeGreaterThan(0)
  })

  it('actualizarEntidadAsociada updates entity and actor', async () => {
    const { actualizarEntidadAsociada, getTareaById } = await import('../api/tareasMock.js')
    await actualizarEntidadAsociada(
      'tarea-fin-001',
      { tipo: 'alumno', id: 'alu-test', label: 'María Rodríguez' },
      ACTOR,
    )
    const tarea = await getTareaById('tarea-fin-001')
    expect(tarea.entidad_tipo).toBe('alumno')
    expect(tarea.entidad_label).toBe('María Rodríguez')
    expect(tarea.updated_by).toBe(ACTOR.id)
    expect(tarea.updated_by_nombre).toBe(ACTOR.nombre)
  })

  it('getTareasFiltradas accepts estado=observada', async () => {
    const { observarTarea, getTareasFiltradas } = await import('../api/tareasMock.js')
    await observarTarea('tarea-log-002', 'Observar log-002 filtro', ACTOR)
    const result = await getTareasFiltradas({ estado: 'observada' })
    expect(Array.isArray(result)).toBe(true)
    result.forEach((t) => expect(t.estado).toBe('observada'))
  })
})

// ─────────────────────────────────────────────────────────────────────────────


describe('Process Backbone V1 - Supabase adapter', () => {
  it('lists active SOI process contracts ordered by process_code', async () => {
    const contracts = [
      { process_code: 'ACM-P02', process_name: 'Asistencia y contenido de clase', active: true },
    ]
    _resolveValue = { data: contracts, error: null }

    const result = await sb.getProcessContracts()

    expect(result).toEqual(contracts)
    expect(mockFrom).toHaveBeenCalledWith('soi_process_contracts')
    expect(mockEq).toHaveBeenCalledWith('active', true)
    expect(mockOrder).toHaveBeenCalledWith('process_code', { ascending: true })
  })

  it('starts a process case through fn_hermes_start_process_case', async () => {
    _rpcValue = { data: 'case-uuid', error: null }

    const result = await sb.startProcessCase({
      process_code: 'FIN-P13',
      title: 'Caso de mora',
      description: 'Representante con deuda vencida',
      requested_by: ACTOR.id,
      requested_by_name: ACTOR.nombre,
    })

    expect(result).toBe('case-uuid')
    expect(mockRpc).toHaveBeenCalledWith('fn_hermes_start_process_case', {
      p_process_code: 'FIN-P13',
      p_title: 'Caso de mora',
      p_description: 'Representante con deuda vencida',
      p_source: 'manual',
      p_priority: 'media',
      p_requested_by: ACTOR.id,
      p_requested_by_name: ACTOR.nombre,
      p_entity_type: null,
      p_entity_id: null,
      p_entity_label: null,
      p_metadata: {},
    })
  })

  it('rejects startProcessCase without process_code before hitting RPC', async () => {
    await expect(sb.startProcessCase({ title: 'Sin contrato' }))
      .rejects.toThrow(/process_code.*requerido/i)
    expect(mockRpc).not.toHaveBeenCalled()
  })
})

describe('Process Backbone V1 - mock implementation', () => {
  it('lists executable contracts including Luteria as LUT task owner', async () => {
    const { getProcessContracts } = await import('../api/tareasMock.js')
    const contracts = await getProcessContracts()

    expect(contracts.some((contract) => contract.process_code === 'ACM-P02')).toBe(true)
    const luteria = contracts.find((contract) => contract.process_code === 'OPR-P10')
    expect(luteria.responsible_departments).toContain('LUT')
  })

  it('opens a process case and creates tasks tied by correlation_id and process_code', async () => {
    const { startProcessCase, getTareasFiltradas } = await import('../api/tareasMock.js')

    const caseId = await startProcessCase({
      process_code: 'FIN-P13',
      title: 'Caso demo de mora',
      requested_by: ACTOR.id,
      requested_by_name: ACTOR.nombre,
    })
    const tasks = await getTareasFiltradas({ process_code: 'FIN-P13' })

    expect(caseId).toMatch(/case-fin-p13/i)
    expect(tasks.length).toBeGreaterThanOrEqual(2)
    tasks.forEach((task) => {
      expect(task.correlation_id).toBe(caseId)
      expect(task.process_code).toBe('FIN-P13')
    })
  })
})

// tareasApi dispatcher — SP-0 export surface
// ─────────────────────────────────────────────────────────────────────────────
describe('tareasApi dispatcher — SP-0 exports', () => {
  it('exports listarComentarios', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.listarComentarios).toBe('function')
  })

  it('exports agregarComentario', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.agregarComentario).toBe('function')
  })

  it('exports listarHistorial', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.listarHistorial).toBe('function')
  })

  it('exports actualizarEntidadAsociada', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.actualizarEntidadAsociada).toBe('function')
  })

  it('exports agregarAdjunto', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.agregarAdjunto).toBe('function')
  })

  it('exports urlFirmada', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.urlFirmada).toBe('function')
  })

  it('exports observarTarea', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.observarTarea).toBe('function')
  })

  it('exports getProcessContracts', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.getProcessContracts).toBe('function')
  })

  it('exports startProcessCase', async () => {
    const api = await import('../api/tareasApi.js')
    expect(typeof api.startProcessCase).toBe('function')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Components structural tests
// ─────────────────────────────────────────────────────────────────────────────
describe('hermes components — SP-0 sub-modules', () => {
  it('taskStatusBadge renders observada with badge', async () => {
    const { renderTaskStatusBadge } = await import('../components/taskStatusBadge.js')
    const html = renderTaskStatusBadge('observada')
    expect(html).toMatch(/observada/i)
    expect(html).toMatch(/badge/)
  })

  it('taskStatusBadge renders all standard states without throwing', async () => {
    const { renderTaskStatusBadge } = await import('../components/taskStatusBadge.js')
    const states = ['pendiente', 'en_progreso', 'completada', 'bloqueada', 'cancelada', 'observada']
    for (const estado of states) {
      const html = renderTaskStatusBadge(estado)
      expect(typeof html).toBe('string')
      expect(html.length).toBeGreaterThan(0)
    }
  })

  it('taskEntityChip renders chip with tipo and label', async () => {
    const { renderTaskEntityChip } = await import('../components/taskEntityChip.js')
    const html = renderTaskEntityChip({ entidad_tipo: 'alumno', entidad_label: 'Juan Pérez' })
    expect(html).toMatch(/alumno/i)
    expect(html).toMatch(/Juan Pérez/)
  })

  it('taskEntityChip returns empty string when no entity', async () => {
    const { renderTaskEntityChip } = await import('../components/taskEntityChip.js')
    expect(renderTaskEntityChip({})).toBe('')
    expect(renderTaskEntityChip({ entidad_tipo: null })).toBe('')
  })

  it('taskCommentsPanel renders comment list and textarea', async () => {
    const { renderTaskCommentsPanel } = await import('../components/taskCommentsPanel.js')
    const comentarios = [
      { id: 'c1', autor_nombre: 'Ana García', cuerpo: 'Revisado', created_at: '2026-06-26T10:00:00Z' },
    ]
    const html = renderTaskCommentsPanel('tarea-1', comentarios)
    expect(html).toMatch(/Revisado/)
    expect(html).toMatch(/Ana García/)
    expect(html).toMatch(/textarea/i)
  })

  it('taskHistoryTimeline renders history entries with actor and fields', async () => {
    const { renderTaskHistoryTimeline } = await import('../components/taskHistoryTimeline.js')
    const historial = [
      { id: 'h1', campo: 'estado', valor_anterior: 'pendiente', valor_nuevo: 'en_progreso', actor_nombre: 'Director', created_at: '2026-06-26T09:00:00Z' },
    ]
    const html = renderTaskHistoryTimeline(historial)
    expect(html).toMatch(/estado/i)
    expect(html).toMatch(/Director/)
    expect(html).toMatch(/pendiente/)
    expect(html).toMatch(/en_progreso/)
  })

  it('taskHistoryTimeline renders empty state for empty array', async () => {
    const { renderTaskHistoryTimeline } = await import('../components/taskHistoryTimeline.js')
    const html = renderTaskHistoryTimeline([])
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)
  })

  it('taskAttachmentsPanel renders adjunto list with filename', async () => {
    const { renderTaskAttachmentsPanel } = await import('../components/taskAttachmentsPanel.js')
    const adjuntos = [
      { id: 'a1', nombre: 'reporte.jpg', storage_path: 'tareas/t1/a1.jpg', mime_type: 'image/jpeg', size_bytes: 50000, subido_por_nombre: 'Omar', created_at: '2026-06-26T10:00:00Z' },
    ]
    const html = renderTaskAttachmentsPanel('tarea-1', adjuntos)
    expect(html).toMatch(/reporte\.jpg/)
    expect(html).toMatch(/Omar/)
  })

  it('taskAttachmentsPanel renders empty state string when no adjuntos', async () => {
    const { renderTaskAttachmentsPanel } = await import('../components/taskAttachmentsPanel.js')
    const html = renderTaskAttachmentsPanel('tarea-1', [])
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)
  })
})
