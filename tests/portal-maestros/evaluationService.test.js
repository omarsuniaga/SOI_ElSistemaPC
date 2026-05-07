import { describe, it, expect } from 'vitest'
import {
  parseToBlocks,
  expandTodos,
  resolveDSL,
  calculateSemaphore,
} from '../../src/portal-maestros/services/evaluationService.js'

// ─────────────────────────────────────────────────────────────────────────────
// parseToBlocks
// ─────────────────────────────────────────────────────────────────────────────
describe('parseToBlocks', () => {
  it('parses a single line with alumno, nota, obs, tarea', () => {
    const blocks = parseToBlocks('#Pedro 3/5 (buen arco) {practicar escala}')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].alumnos).toContain('Pedro')
    expect(blocks[0].nota).toBe(3)
    expect(blocks[0].observacion).toBe('buen arco')
    expect(blocks[0].tarea).toBe('practicar escala')
  })

  it('parses multiple lines into multiple blocks', () => {
    const raw = '#Ana 4/5 (bien)\n#Luis 2/5 (mejorar)'
    const blocks = parseToBlocks(raw)
    expect(blocks).toHaveLength(2)
    expect(blocks[0].alumnos).toContain('Ana')
    expect(blocks[1].alumnos).toContain('Luis')
  })

  it('parses #todos line', () => {
    const blocks = parseToBlocks('#todos 3/5')
    expect(blocks[0].alumnos).toContain('todos')
    expect(blocks[0].nota).toBe(3)
  })

  it('returns nota null when no calificacion on line', () => {
    const blocks = parseToBlocks('#Pedro (sin nota)')
    expect(blocks[0].nota).toBeNull()
  })

  it('skips empty lines', () => {
    const blocks = parseToBlocks('#Pedro 3/5\n\n#Ana 4/5')
    expect(blocks).toHaveLength(2)
  })

  it('handles multiple alumnos on same line', () => {
    const blocks = parseToBlocks('#Ana #Luis 4/5')
    expect(blocks[0].alumnos).toContain('Ana')
    expect(blocks[0].alumnos).toContain('Luis')
    expect(blocks[0].nota).toBe(4)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// expandTodos
// ─────────────────────────────────────────────────────────────────────────────
const presentes = [
  { id: 'a1', nombre_completo: 'Ana García' },
  { id: 'a2', nombre_completo: 'Luis Pérez' },
  { id: 'a3', nombre_completo: 'Pedro Martínez' },
]

describe('expandTodos', () => {
  it('#todos sets base nota for all presentes', () => {
    const blocks = [{ alumnos: ['todos'], nota: 3, observacion: null, tarea: null }]
    const result = expandTodos(blocks, presentes)
    expect(result).toHaveLength(3)
    expect(result.every(r => r.nota === 3)).toBe(true)
  })

  it('specific #name overrides #todos regardless of order (specific after todos)', () => {
    const blocks = [
      { alumnos: ['todos'], nota: 3, observacion: null, tarea: null },
      { alumnos: ['Pedro'], nota: 5, observacion: null, tarea: null },
    ]
    const result = expandTodos(blocks, presentes)
    const pedro = result.find(r => r.alumno_id === 'a3')
    expect(pedro.nota).toBe(5)
    // Others remain at 3
    const ana = result.find(r => r.alumno_id === 'a1')
    expect(ana.nota).toBe(3)
  })

  it('specific #name overrides #todos regardless of order (specific before todos)', () => {
    const blocks = [
      { alumnos: ['Pedro'], nota: 5, observacion: null, tarea: null },
      { alumnos: ['todos'], nota: 3, observacion: null, tarea: null },
    ]
    const result = expandTodos(blocks, presentes)
    const pedro = result.find(r => r.alumno_id === 'a3')
    expect(pedro.nota).toBe(5) // specific ALWAYS wins
    const ana = result.find(r => r.alumno_id === 'a1')
    expect(ana.nota).toBe(3)
  })

  it('matches by substring of nombre_completo (case-insensitive)', () => {
    const blocks = [{ alumnos: ['ana'], nota: 4, observacion: null, tarea: null }]
    const result = expandTodos(blocks, presentes)
    const ana = result.find(r => r.alumno_id === 'a1')
    expect(ana).toBeDefined()
    expect(ana.nota).toBe(4)
  })

  it('returns no duplicates when student mentioned twice', () => {
    const blocks = [
      { alumnos: ['Ana'], nota: 3, observacion: null, tarea: null },
      { alumnos: ['Ana'], nota: 5, observacion: null, tarea: null },
    ]
    const result = expandTodos(blocks, presentes)
    const anas = result.filter(r => r.alumno_id === 'a1')
    expect(anas).toHaveLength(1)
  })

  it('last specific mention wins when mentioned multiple times', () => {
    const blocks = [
      { alumnos: ['Ana'], nota: 3, observacion: null, tarea: null },
      { alumnos: ['Ana'], nota: 5, observacion: null, tarea: null },
    ]
    const result = expandTodos(blocks, presentes)
    const ana = result.find(r => r.alumno_id === 'a1')
    expect(ana.nota).toBe(5)
  })

  it('returns empty array when no blocks and no todos', () => {
    const blocks = []
    const result = expandTodos(blocks, presentes)
    expect(result).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// resolveDSL
// ─────────────────────────────────────────────────────────────────────────────
describe('resolveDSL', () => {
  it('full pipeline with #todos covers everyone — missing is empty', () => {
    const raw = '#todos 3/5'
    const result = resolveDSL(raw, 'ind-1', presentes)
    expect(result.indicador_id).toBe('ind-1')
    expect(result.evaluaciones).toHaveLength(3)
    expect(result.missing).toHaveLength(0)
  })

  it('detects missing students when no #todos and not all mentioned', () => {
    const raw = '#Ana 4/5'
    const result = resolveDSL(raw, 'ind-1', presentes)
    expect(result.missing).toHaveLength(2)
    // missing should contain Luis and Pedro names
    expect(result.missing.some(m => m.toLowerCase().includes('luis'))).toBe(true)
    expect(result.missing.some(m => m.toLowerCase().includes('pedro'))).toBe(true)
  })

  it('evaluaciones contain alumno_id, nota, observacion, tarea', () => {
    const raw = '#todos 4/5 (bien) {practicar}'
    const result = resolveDSL(raw, 'ind-2', presentes)
    const ev = result.evaluaciones[0]
    expect(ev).toHaveProperty('alumno_id')
    expect(ev).toHaveProperty('nota')
    expect(ev).toHaveProperty('observacion')
    expect(ev).toHaveProperty('tarea')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// calculateSemaphore
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateSemaphore', () => {
  it('returns gray when no evaluations', () => {
    expect(calculateSemaphore([], 3)).toBe('gray')
  })

  it('returns green when all students evaluated AND all nota >= 4', () => {
    const evs = [
      { alumno_id: 'a1', nota: 4 },
      { alumno_id: 'a2', nota: 5 },
      { alumno_id: 'a3', nota: 4 },
    ]
    expect(calculateSemaphore(evs, 3)).toBe('green')
  })

  it('returns yellow when all evaluated but some nota < 4', () => {
    const evs = [
      { alumno_id: 'a1', nota: 4 },
      { alumno_id: 'a2', nota: 3 },
      { alumno_id: 'a3', nota: 4 },
    ]
    expect(calculateSemaphore(evs, 3)).toBe('yellow')
  })

  it('returns yellow when not all students evaluated', () => {
    const evs = [
      { alumno_id: 'a1', nota: 5 },
      { alumno_id: 'a2', nota: 5 },
    ]
    expect(calculateSemaphore(evs, 3)).toBe('yellow')
  })

  it('returns yellow when evaluations present but totalAlumnos is 0', () => {
    const evs = [{ alumno_id: 'a1', nota: 5 }]
    expect(calculateSemaphore(evs, 0)).toBe('yellow')
  })
})
