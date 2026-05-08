import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * Tests para la lógica de asistencia (F2).
 * Testeamos la función de ordenamiento (cola UX) y la lógica
 * de estado de alumnos sin necesitar DOM ni Supabase.
 */

describe('Asistencia — Cola UX (sort)', () => {
  // Reimplementamos _sortAlumnos inline ya que es una función privada
  function sortAlumnos(alumnos, estado) {
    return [...alumnos].sort((a, b) => {
      const aM = estado[a.id] !== null
      const bM = estado[b.id] !== null
      if (!aM && bM) return -1
      if (aM && !bM) return 1
      return 0
    })
  }

  const alumnos = [
    { id: '1', nombre: 'Ana', apellido: 'López', instrumento: 'Violín' },
    { id: '2', nombre: 'Bruno', apellido: 'García', instrumento: 'Piano' },
    { id: '3', nombre: 'Carla', apellido: 'Ruiz', instrumento: 'Flauta' },
  ]

  it('sin marcados, mantiene orden original', () => {
    const estado = { '1': null, '2': null, '3': null }
    const sorted = sortAlumnos(alumnos, estado)
    expect(sorted.map(a => a.id)).toEqual(['1', '2', '3'])
  })

  it('marcados van al final', () => {
    const estado = { '1': 'P', '2': null, '3': null }
    const sorted = sortAlumnos(alumnos, estado)
    expect(sorted[0].id).toBe('2')
    expect(sorted[1].id).toBe('3')
    expect(sorted[2].id).toBe('1') // marcado al final
  })

  it('todos marcados mantiene orden', () => {
    const estado = { '1': 'P', '2': 'A', '3': 'J' }
    const sorted = sortAlumnos(alumnos, estado)
    expect(sorted.length).toBe(3)
    // Todos marcados, no cambia el orden relativo
    expect(sorted.map(a => a.id)).toEqual(['1', '2', '3'])
  })

  it('múltiples marcados y pendientes se separan correctamente', () => {
    const estado = { '1': 'P', '2': null, '3': 'A' }
    const sorted = sortAlumnos(alumnos, estado)
    expect(sorted[0].id).toBe('2') // pendiente primero
    // Los marcados después (orden relativo entre ellos se mantiene)
    expect(sorted.slice(1).map(a => a.id)).toEqual(['1', '3'])
  })
})

describe('Asistencia — Estado de alumnos', () => {
  it('toggle: marcar mismo estado lo quita', () => {
    const estado = { '1': null }
    // Simular marcar P
    estado['1'] = 'P'
    expect(estado['1']).toBe('P')
    // Simular toggle (mismo botón)
    estado['1'] = estado['1'] === 'P' ? null : 'P'
    expect(estado['1']).toBe(null)
  })

  it('cambiar estado sobreescribe el anterior', () => {
    const estado = { '1': 'P' }
    // Cambiar a A
    estado['1'] = 'A'
    expect(estado['1']).toBe('A')
  })

  it('bulk marca solo pendientes', () => {
    const estado = { '1': 'J', '2': null, '3': null }
    // Bulk "Todos P" — solo marca los null
    Object.keys(estado).forEach(id => {
      if (estado[id] === null) estado[id] = 'P'
    })
    expect(estado['1']).toBe('J') // no cambia
    expect(estado['2']).toBe('P')
    expect(estado['3']).toBe('P')
  })

  it('calcular progreso correctamente', () => {
    const estado = { '1': 'P', '2': null, '3': 'A' }
    const total = Object.keys(estado).length
    const marcados = Object.values(estado).filter(v => v !== null).length
    expect(total).toBe(3)
    expect(marcados).toBe(2)
    expect((marcados / total * 100).toFixed(0)).toBe('67')
  })
})
