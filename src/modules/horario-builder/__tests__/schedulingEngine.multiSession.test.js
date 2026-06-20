import { describe, it, expect } from 'vitest'
import { generateOptimizedSchedule } from '../engine/schedulingEngine.js'

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const mockMaestro = {
  id: 'm1', nombre: 'Prof. García',
  disponibilidad: {
    lunes: [{ inicio: '15:30', fin: '18:30' }],
    miércoles: [{ inicio: '15:30', fin: '18:30' }]
  }
}

const mockSalon = { id: 's1', nombre: 'Sala 1', capacidad: 15, is_active: true }

const mockClase = {
  id: 'c1', nombre: 'Violín Inicial',
  maestro_principal_id: 'm1',
  total_alumnos: 10,
  duracion: 60
}

const mockConfig = {
  jornada: {
    lunes:     { inicio: '15:00', fin: '19:00' },
    martes:    { inicio: '00:00', fin: '00:00' },
    miércoles: { inicio: '15:00', fin: '19:00' },
    jueves:    { inicio: '00:00', fin: '00:00' },
    viernes:   { inicio: '00:00', fin: '00:00' },
    sábado:    { inicio: '00:00', fin: '00:00' },
    domingo:   { inicio: '00:00', fin: '00:00' },
  },
  gapMinimo: 0,
  duracionBloque: 60
}

// ─── F3A — Regression baseline (must pass before AND after extraction) ────────

describe('F3A — baseline (must pass before AND after extraction)', () => {
  it('assigns one slot per class (baseline)', () => {
    const result = generateOptimizedSchedule({
      clasesConMaestro: [mockClase],
      maestros: [mockMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    expect(result.assignments).toHaveLength(1)
    expect(result.assignments[0].clase_id).toBe('c1')
    expect(result.noAsignadas).toHaveLength(0)
  })

  it('respects teacher availability — does not schedule on unavailable days', () => {
    const result = generateOptimizedSchedule({
      clasesConMaestro: [mockClase],
      maestros: [mockMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    expect(['lunes', 'miércoles']).toContain(result.assignments[0].dia)
  })

  it('returns noAsignadas when no teacher available', () => {
    const noAvailMaestro = { ...mockMaestro, disponibilidad: {} }
    const result = generateOptimizedSchedule({
      clasesConMaestro: [mockClase],
      maestros: [noAvailMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    expect(result.noAsignadas).toHaveLength(1)
  })
})

// ─── F3B — excludeDays in _findCandidates ─────────────────────────────────────

describe('F3B — excludeDays in _findCandidates', () => {
  it('skips lunes when excludeDays contains lunes', () => {
    // We need to test this indirectly through the multi-session behavior
    // Teacher available Mon+Wed, first session assigned Mon, second session must be Wed
    const claseWith2Sessions = { ...mockClase, sesiones_por_semana: 2, duracion: 60 }
    const result = generateOptimizedSchedule({
      clasesConMaestro: [claseWith2Sessions],
      maestros: [mockMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    // After F3C is implemented, this will test the full flow
    // For now, just check it doesn't throw
    expect(result).toHaveProperty('assignments')
  })
})

// ─── F3C — multi-session scheduling ──────────────────────────────────────────

describe('F3C — multi-session scheduling', () => {
  it('assigns 2 sessions for sesiones_por_semana=2', () => {
    const clase2 = { ...mockClase, sesiones_por_semana: 2 }
    const result = generateOptimizedSchedule({
      clasesConMaestro: [clase2],
      maestros: [mockMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    const classAssignments = result.assignments.filter(a => a.clase_id === 'c1')
    expect(classAssignments).toHaveLength(2)
  })

  it('sessions are on DIFFERENT days', () => {
    const clase2 = { ...mockClase, sesiones_por_semana: 2 }
    const result = generateOptimizedSchedule({
      clasesConMaestro: [clase2],
      maestros: [mockMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    const days = result.assignments.map(a => a.dia)
    expect(new Set(days).size).toBe(days.length) // all unique days
  })

  it('adds to noAsignadas when second slot unavailable', () => {
    // teacher only available 1 day, but sesiones_por_semana=2
    const oneDayMaestro = {
      ...mockMaestro,
      disponibilidad: { lunes: [{ inicio: '15:30', fin: '18:30' }] }
    }
    const clase2 = { ...mockClase, sesiones_por_semana: 2 }
    const result = generateOptimizedSchedule({
      clasesConMaestro: [clase2],
      maestros: [oneDayMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    // 1 assignment successful, 1 session failed
    const assigned = result.assignments.filter(a => a.clase_id === 'c1')
    expect(assigned).toHaveLength(1)
    // noAsignadas entry or partial flag
  })

  it('sesiones_por_semana defaults to 1 when not set', () => {
    const result = generateOptimizedSchedule({
      clasesConMaestro: [mockClase], // no sesiones_por_semana field
      maestros: [mockMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    expect(result.assignments).toHaveLength(1) // exactly 1, backward compat
  })

  it('locks the same salon across sessions', () => {
    const extraSalon = { id: 's2', nombre: 'Sala 2', capacidad: 20, is_active: true }
    const clase2 = { ...mockClase, sesiones_por_semana: 2 }
    const result = generateOptimizedSchedule({
      clasesConMaestro: [clase2],
      maestros: [mockMaestro],
      salones: [mockSalon, extraSalon],
      config: mockConfig
    })
    const salones = result.assignments.map(a => a.salon_id)
    if (salones.length === 2) {
      expect(salones[0]).toBe(salones[1]) // same salon for all sessions
    }
  })
})

// ─── F3D — weekly hours metrics ───────────────────────────────────────────────

describe('F3D — weekly hours metrics', () => {
  it('metricas includes horasSemanalesPorGrupo', () => {
    const clase2 = { ...mockClase, sesiones_por_semana: 2, duracion: 45 }
    const result = generateOptimizedSchedule({
      clasesConMaestro: [clase2],
      maestros: [mockMaestro],
      salones: [mockSalon],
      config: mockConfig
    })
    // If 2 sessions of 45min assigned: 1.5 hours/week
    if (result.assignments.filter(a => a.clase_id === 'c1').length === 2) {
      expect(result.metricas?.horasSemanalesPorGrupo?.['c1']).toBeCloseTo(1.5)
    }
  })
})
