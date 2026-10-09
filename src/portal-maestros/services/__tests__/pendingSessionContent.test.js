import { describe, expect, it } from 'vitest'
import { findPendingSessionContent, pickContentToShow } from '../pendingSessionContent.js'

const item = (over = {}) => ({
  id: 1,
  tabla: 'sesiones_clase',
  operacion: 'update',
  payload: { id: 's1', contenido: 'texto' },
  created_at: '2026-10-08T11:00:00Z',
  ...over,
})

describe('findPendingSessionContent', () => {
  it('encuentra por id de sesión', () => {
    expect(findPendingSessionContent([item()], { sesionId: 's1' })?.contenido).toBe('texto')
  })

  it('encuentra por clase+fecha cuando la sesión aún no existe (insert offline)', () => {
    const q = [item({ operacion: 'insert', payload: { clase_id: 'c1', fecha: '2026-10-08', contenido: 'nuevo' } })]
    expect(findPendingSessionContent(q, { sesionId: null, claseId: 'c1', fecha: '2026-10-08' })?.contenido).toBe('nuevo')
  })

  it('devuelve el más reciente cuando hay varios', () => {
    const q = [
      item({ id: 1, payload: { id: 's1', contenido: 'v1' } }),
      item({ id: 2, payload: { id: 's1', contenido: 'v2' } }),
    ]
    expect(findPendingSessionContent(q, { sesionId: 's1' })?.contenido).toBe('v2')
  })

  it('ignora otras tablas, otras sesiones y payloads sin contenido', () => {
    const q = [
      item({ tabla: 'asistencias' }),
      item({ payload: { id: 'otra', contenido: 'x' } }),
      item({ payload: { id: 's1', asistencia: [] } }),
    ]
    expect(findPendingSessionContent(q, { sesionId: 's1' })).toBeNull()
  })

  it('expone si el item agotó sus reintentos', () => {
    expect(findPendingSessionContent([item({ fallido: true })], { sesionId: 's1' })?.fallido).toBe(true)
  })
})

describe('pickContentToShow', () => {
  it('prefiere el texto pendiente si es más reciente que el servidor', () => {
    const r = pickContentToShow({
      serverContent: 'servidor',
      serverUpdatedAt: '2026-10-08T10:00:00Z',
      pending: { contenido: 'local', created_at: '2026-10-08T11:00:00Z' },
    })
    expect(r).toEqual({ content: 'local', source: 'queue' })
  })

  it('prefiere el servidor si es más nuevo que lo encolado', () => {
    const r = pickContentToShow({
      serverContent: 'servidor',
      serverUpdatedAt: '2026-10-08T12:00:00Z',
      pending: { contenido: 'local', created_at: '2026-10-08T11:00:00Z' },
    })
    expect(r).toEqual({ content: 'servidor', source: 'server' })
  })

  it('sin pendiente usa el servidor', () => {
    expect(pickContentToShow({ serverContent: 'a', serverUpdatedAt: null, pending: null }))
      .toEqual({ content: 'a', source: 'server' })
  })
})
