import { describe, test, expect } from 'vitest'
import { buildMensaje, canViewMensaje, marcarLeido } from '../domain/mensaje.js'

describe('buildMensaje', () => {
  const base = {
    hilo_id: 'hilo-1',
    autor_id: 'usr-cajero-1',
    rol_autor: 'cajero',
    contenido: 'Mensaje de prueba',
    tipo: 'texto',
    departamento_destino: ['caja'],
  }

  test('builds mensaje with required fields', () => {
    const m = buildMensaje(base)
    expect(m.hilo_id).toBe('hilo-1')
    expect(m.autor_id).toBe('usr-cajero-1')
    expect(m.contenido).toBe('Mensaje de prueba')
  })

  test('leido_por defaults to empty object', () => {
    const m = buildMensaje(base)
    expect(m.leido_por).toEqual({})
  })

  test('departamento_destino is preserved', () => {
    const m = buildMensaje(base)
    expect(m.departamento_destino).toEqual(['caja'])
  })
})

describe('canViewMensaje', () => {
  test('user role in departamento_destino can view', () => {
    const m = { departamento_destino: ['caja', 'admin'] }
    expect(canViewMensaje(m, 'caja')).toBe(true)
  })

  test('user role not in departamento_destino cannot view', () => {
    const m = { departamento_destino: ['admin'] }
    expect(canViewMensaje(m, 'caja')).toBe(false)
  })

  test('empty departamento_destino allows all roles', () => {
    const m = { departamento_destino: [] }
    expect(canViewMensaje(m, 'caja')).toBe(true)
    expect(canViewMensaje(m, 'admin')).toBe(true)
    expect(canViewMensaje(m, 'representante')).toBe(true)
  })
})

describe('marcarLeido', () => {
  test('adds userId with timestamp to leido_por', () => {
    const m = { leido_por: {} }
    const updated = marcarLeido(m, 'usr-1')
    expect(updated.leido_por['usr-1']).toBeTruthy()
    expect(typeof updated.leido_por['usr-1']).toBe('string')
  })

  test('does not mutate original mensaje', () => {
    const original = { leido_por: {} }
    marcarLeido(original, 'usr-1')
    expect(original.leido_por['usr-1']).toBeUndefined()
  })

  test('preserves existing leido_por entries', () => {
    const m = { leido_por: { 'usr-existing': '2026-01-01T00:00:00Z' } }
    const updated = marcarLeido(m, 'usr-new')
    expect(updated.leido_por['usr-existing']).toBeTruthy()
    expect(updated.leido_por['usr-new']).toBeTruthy()
  })
})
