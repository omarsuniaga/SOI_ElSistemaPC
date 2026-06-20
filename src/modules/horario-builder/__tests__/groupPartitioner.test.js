import { describe, it, expect } from 'vitest'
import { partitionClase, partitionClases } from '../domain/groupPartitioner.js'

const salones = [
  { id: 's1', capacidad: 15, is_active: true },
  { id: 's2', capacidad: 10, is_active: true }
]

describe('partitionClase', () => {
  it('does not split when alumnos <= best salon capacity', () => {
    const groups = partitionClase({ id: 'c1', nombre: 'Violín', total_alumnos: 10 }, salones)
    expect(groups).toHaveLength(1)
    expect(groups[0]._isSubgroup).toBe(false)
  })

  it('splits into ceil(total/capacity) groups when alumnos > capacity', () => {
    const groups = partitionClase({ id: 'c1', nombre: 'Violín', total_alumnos: 40 }, salones)
    expect(groups).toHaveLength(3) // ceil(40/15) = 3
  })

  it('distributes students correctly across groups', () => {
    const groups = partitionClase({ id: 'c1', nombre: 'Violín', total_alumnos: 40 }, salones)
    const totals = groups.map(g => g.total_alumnos)
    expect(totals.reduce((a, b) => a + b, 0)).toBe(40) // sum must equal original
    expect(Math.max(...totals) - Math.min(...totals)).toBeLessThanOrEqual(1) // balanced
  })

  it('names subgroups with Grupo A, B, C suffix', () => {
    const groups = partitionClase({ id: 'c1', nombre: 'Violín', total_alumnos: 40 }, salones)
    expect(groups[0].nombre).toContain('Grupo A')
    expect(groups[1].nombre).toContain('Grupo B')
    expect(groups[2].nombre).toContain('Grupo C')
  })

  it('subgroup IDs are unique and reference original', () => {
    const groups = partitionClase({ id: 'c1', nombre: 'Violín', total_alumnos: 40 }, salones)
    expect(groups[0].id).toBe('c1_grupo_A')
    expect(groups[0]._originalClaseId).toBe('c1')
  })

  it('handles 0 total_alumnos gracefully', () => {
    const groups = partitionClase({ id: 'c1', nombre: 'Violín', total_alumnos: 0 }, salones)
    expect(groups).toHaveLength(1)
  })

  it('handles inactive salones — excludes them from capacity calculation', () => {
    const inactiveSalones = [{ id: 's1', capacidad: 15, is_active: false }]
    expect(() => partitionClase({ id: 'c1', nombre: 'V', total_alumnos: 5 }, inactiveSalones)).not.toThrow()
  })

  it('returns 3 subgroups [14,13,13] for 40 students / cap 15', () => {
    const groups = partitionClase({ id: 'c1', nombre: 'Violín', total_alumnos: 40 }, salones)
    const totals = groups.map(g => g.total_alumnos).sort((a, b) => b - a)
    // ceil(40/15) = 3 groups, balanced: 14, 13, 13
    expect(totals[0]).toBe(14)
    expect(totals[1]).toBe(13)
    expect(totals[2]).toBe(13)
  })

  it('sets _originalClaseId matching parent id', () => {
    const groups = partitionClase({ id: 'abc', nombre: 'Test', total_alumnos: 40 }, salones)
    groups.forEach(g => expect(g._originalClaseId).toBe('abc'))
  })

  it('generates synthetic ids like ${originalId}_grupo_A', () => {
    const groups = partitionClase({ id: 'abc', nombre: 'Test', total_alumnos: 40 }, salones)
    expect(groups[0].id).toBe('abc_grupo_A')
    expect(groups[1].id).toBe('abc_grupo_B')
    expect(groups[2].id).toBe('abc_grupo_C')
  })

  it("appends '— Grupo A/B/C' to nombre", () => {
    const groups = partitionClase({ id: 'c1', nombre: 'Violín', total_alumnos: 40 }, salones)
    expect(groups[0].nombre).toBe('Violín — Grupo A')
    expect(groups[1].nombre).toBe('Violín — Grupo B')
    expect(groups[2].nombre).toBe('Violín — Grupo C')
  })
})

describe('partitionClases', () => {
  it('processes multiple clases', () => {
    const clases = [
      { id: 'c1', nombre: 'Violín', total_alumnos: 40 },
      { id: 'c2', nombre: 'Piano', total_alumnos: 10 },
    ]
    const result = partitionClases(clases, salones)
    expect(result.length).toBeGreaterThan(2) // c1 split into 3, c2 stays 1 = 4 total
  })

  it('returns exactly 4 items: 3 groups for c1 + 1 for c2', () => {
    const clases = [
      { id: 'c1', nombre: 'Violín', total_alumnos: 40 },
      { id: 'c2', nombre: 'Piano', total_alumnos: 10 },
    ]
    const result = partitionClases(clases, salones)
    expect(result).toHaveLength(4)
  })
})
