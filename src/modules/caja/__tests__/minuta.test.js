import { describe, test, expect } from 'vitest'
import { buildMinuta, canViewMinuta, validateMinuta } from '../domain/minuta.js'

describe('buildMinuta', () => {
  const base = {
    titulo: 'Reunión junio',
    fecha_reunion: '2026-06-22',
    participantes: ['usr-1'],
    puntos_tratados: ['Morosidad'],
    acuerdos: ['Llamar a familia'],
    responsables: ['usr-1'],
    visibilidad: 'cajero',
    creado_por: 'usr-admin-1',
  }

  test('builds minuta with required fields', () => {
    const m = buildMinuta(base)
    expect(m.titulo).toBe('Reunión junio')
    expect(m.visibilidad).toBe('cajero')
    expect(m.creado_por).toBe('usr-admin-1')
  })

  test('participantes is an array', () => {
    const m = buildMinuta(base)
    expect(Array.isArray(m.participantes)).toBe(true)
  })
})

describe('canViewMinuta', () => {
  test('visibilidad=cajero: cajero can view', () => {
    expect(canViewMinuta({ visibilidad: 'cajero' }, 'cajero')).toBe(true)
  })

  test('visibilidad=cajero: admin can view', () => {
    expect(canViewMinuta({ visibilidad: 'cajero' }, 'admin')).toBe(true)
  })

  test('visibilidad=cajero: representante cannot view', () => {
    expect(canViewMinuta({ visibilidad: 'cajero' }, 'representante')).toBe(false)
  })

  test('visibilidad=admin: only admin can view', () => {
    expect(canViewMinuta({ visibilidad: 'admin' }, 'admin')).toBe(true)
    expect(canViewMinuta({ visibilidad: 'admin' }, 'cajero')).toBe(false)
    expect(canViewMinuta({ visibilidad: 'admin' }, 'representante')).toBe(false)
  })

  test('visibilidad=todos: all roles can view', () => {
    expect(canViewMinuta({ visibilidad: 'todos' }, 'cajero')).toBe(true)
    expect(canViewMinuta({ visibilidad: 'todos' }, 'admin')).toBe(true)
    expect(canViewMinuta({ visibilidad: 'todos' }, 'representante')).toBe(true)
  })
})

describe('validateMinuta', () => {
  const base = {
    titulo: 'Reunión',
    fecha_reunion: '2026-06-22',
    participantes: ['usr-1'],
    puntos_tratados: ['Punto 1'],
    acuerdos: [],
    responsables: [],
    visibilidad: 'cajero',
    creado_por: 'usr-1',
  }

  test('valid minuta passes', () => {
    const r = validateMinuta(base)
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  test('invalid when titulo is missing', () => {
    const r = validateMinuta({ ...base, titulo: '' })
    expect(r.valid).toBe(false)
    expect(r.errors).toContain('titulo es requerido')
  })

  test('invalid when fecha_reunion is missing', () => {
    const r = validateMinuta({ ...base, fecha_reunion: '' })
    expect(r.valid).toBe(false)
    expect(r.errors).toContain('fecha_reunion es requerida')
  })

  test('invalid when creado_por is missing', () => {
    const r = validateMinuta({ ...base, creado_por: '' })
    expect(r.valid).toBe(false)
    expect(r.errors).toContain('creado_por es requerido')
  })
})
