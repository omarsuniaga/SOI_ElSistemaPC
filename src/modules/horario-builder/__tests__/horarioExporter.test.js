import { describe, it, expect, vi } from 'vitest'
import {
  filterAssignmentsByScope,
  buildScopeLabel,
  groupAssignmentsByEntity,
  exportBatchPDF
} from '../utils/horarioExporter.js'

const assignments = [
  { clase_id: 'c-1', clase_nombre: 'Violín I', maestro_id: 'm-1', maestro_nombre: 'Jaime', salon_id: 's-1', salon_nombre: 'Sala A', dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', alumnos_ids: ['a-1', 'a-2'] },
  { clase_id: 'c-2', clase_nombre: 'Piano I', maestro_id: 'm-2', maestro_nombre: 'María', salon_id: 's-2', salon_nombre: 'Sala B', dia: 'martes', hora_inicio: '10:00', hora_fin: '11:00', alumnos_ids: ['a-1'] },
  { clase_id: 'c-3', clase_nombre: 'Violín II', maestro_id: 'm-1', maestro_nombre: 'Jaime', salon_id: 's-1', salon_nombre: 'Sala A', dia: 'miércoles', hora_inicio: '08:00', hora_fin: '09:00', alumnos_ids: ['a-3'] }
]

describe('filterAssignmentsByScope', () => {
  it('returns all assignments when scope is null', () => {
    expect(filterAssignmentsByScope(assignments, null)).toEqual(assignments)
  })

  it('returns all assignments when scope.type is general', () => {
    expect(filterAssignmentsByScope(assignments, { type: 'general' })).toEqual(assignments)
  })

  it('filters by maestro id', () => {
    const result = filterAssignmentsByScope(assignments, { type: 'maestro', id: 'm-1' })
    expect(result).toHaveLength(2)
    expect(result.every(a => a.maestro_id === 'm-1')).toBe(true)
  })

  it('filters by clase id', () => {
    const result = filterAssignmentsByScope(assignments, { type: 'clase', id: 'c-2' })
    expect(result).toEqual([assignments[1]])
  })

  it('filters by salon id', () => {
    const result = filterAssignmentsByScope(assignments, { type: 'salon', id: 's-1' })
    expect(result).toHaveLength(2)
  })

  it('filters by alumno id using alumnos_ids membership', () => {
    const result = filterAssignmentsByScope(assignments, { type: 'alumno', id: 'a-1' })
    expect(result).toHaveLength(2)
    expect(result.map(a => a.clase_id)).toEqual(['c-1', 'c-2'])
  })

  it('returns empty array when no assignment matches the scope id', () => {
    expect(filterAssignmentsByScope(assignments, { type: 'maestro', id: 'unknown' })).toEqual([])
  })
})

describe('buildScopeLabel', () => {
  it('returns general labels with no entityName when scope is null', () => {
    const labels = buildScopeLabel(null, 'S1-2026')
    expect(labels.entityName).toBeNull()
    expect(labels.subtitle).toContain('Reporte Oficial')
  })

  it('returns a maestro-specific subtitle and entityName', () => {
    const labels = buildScopeLabel({ type: 'maestro', id: 'm-1', name: 'Jaime' }, 'S1-2026')
    expect(labels.entityName).toBe('Jaime')
    expect(labels.subtitle).toContain('Horario del Maestro')
  })

  it('falls back to a generic label for unknown scope types', () => {
    const labels = buildScopeLabel({ type: 'weird', id: 'x', name: 'X' }, 'S1-2026')
    expect(labels.subtitle).toContain('Horario Personalizado')
  })
})

describe('groupAssignmentsByEntity', () => {
  it('groups by maestro and sorts by name', () => {
    const groups = groupAssignmentsByEntity(assignments, 'maestro')
    expect(groups.map(g => g.name)).toEqual(['Jaime', 'María'])
    expect(groups[0].assignments).toHaveLength(2)
    expect(groups[1].assignments).toHaveLength(1)
  })

  it('groups by salon', () => {
    const groups = groupAssignmentsByEntity(assignments, 'salon')
    expect(groups.map(g => g.id)).toEqual(['s-1', 's-2'])
  })

  it('skips assignments with no id for the given type', () => {
    const withMissing = [...assignments, { clase_id: 'c-4', clase_nombre: 'Sin maestro' }]
    const groups = groupAssignmentsByEntity(withMissing, 'maestro')
    expect(groups).toHaveLength(2)
  })
})

describe('exportBatchPDF', () => {
  it('calls exportToPDF once per distinct entity found in assignments', async () => {
    vi.doMock('jspdf', () => ({
      jsPDF: vi.fn().mockImplementation(function FakeJsPDF() {
        return {
          setFillColor: vi.fn(), rect: vi.fn(), setTextColor: vi.fn(), setFont: vi.fn(),
          setFontSize: vi.fn(), text: vi.fn(), setDrawColor: vi.fn(), setLineWidth: vi.fn(),
          line: vi.fn(), save: vi.fn()
        }
      })
    }))
    vi.doMock('jspdf-autotable', () => ({ default: vi.fn() }))

    const count = await exportBatchPDF(assignments, 'maestro', { period: 'S1-2026' })
    expect(count).toBe(2)
  })
})
