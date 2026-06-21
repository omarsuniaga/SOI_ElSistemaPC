import { describe, it, expect } from 'vitest'
import { generateMultipleProposals, shuffleWithSeed } from '../domain/multiProposalGenerator.js'

const mockMaestro = {
  id: 'm1',
  nombre: 'Prof. García',
  disponibilidad: {
    lunes: [{ inicio: '15:00', fin: '18:00' }],
    miércoles: [{ inicio: '15:00', fin: '18:00' }],
  },
}
const mockSalon = { id: 's1', capacidad: 15, is_active: true }
const mockConfig = {
  jornada: {
    lunes: { inicio: '15:00', fin: '18:00' },
    martes: { inicio: '00:00', fin: '00:00' },
    miércoles: { inicio: '15:00', fin: '18:00' },
    jueves: { inicio: '00:00', fin: '00:00' },
    viernes: { inicio: '00:00', fin: '00:00' },
    sábado: { inicio: '00:00', fin: '00:00' },
  },
  gapMinimo: 0,
  duracionBloque: 60,
}
const mockClaseA = { id: 'c1', nombre: 'Violín', maestro_principal_id: 'm1', total_alumnos: 5, duracion: 60 }

// ─── shuffleWithSeed ─────────────────────────────────────────────────────────

describe('shuffleWithSeed', () => {
  it('returns an array of the same length', () => {
    expect(shuffleWithSeed([1, 2, 3, 4, 5], 42)).toHaveLength(5)
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    shuffleWithSeed(arr, 42)
    expect(arr).toEqual([1, 2, 3])
  })

  it('produces the same ordering for the same seed', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffleWithSeed(arr, 7)).toEqual(shuffleWithSeed(arr, 7))
  })

  it('produces different orderings for different seeds', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(shuffleWithSeed(arr, 1)).not.toEqual(shuffleWithSeed(arr, 99))
  })

  it('handles a single-element array without error', () => {
    expect(shuffleWithSeed([42], 1)).toEqual([42])
  })

  it('handles an empty array', () => {
    expect(shuffleWithSeed([], 1)).toEqual([])
  })
})

// ─── generateMultipleProposals ───────────────────────────────────────────────

describe('generateMultipleProposals', () => {
  const input = { clasesConMaestro: [mockClaseA], maestros: [mockMaestro], salones: [mockSalon] }

  it('returns exactly N proposals', () => {
    expect(generateMultipleProposals(input, mockConfig, 3)).toHaveLength(3)
  })

  it('assigns sequential ids 1, 2, 3', () => {
    const proposals = generateMultipleProposals(input, mockConfig, 3)
    expect(proposals.map((p) => p.id)).toEqual([1, 2, 3])
  })

  it('first proposal is never marked duplicate', () => {
    const proposals = generateMultipleProposals(input, mockConfig, 3)
    expect(proposals[0]._duplicate).toBe(false)
  })

  it('marks duplicate proposals with _duplicate: true (single class → all seeds produce same result)', () => {
    const proposals = generateMultipleProposals(input, mockConfig, 3)
    // 1 class → only 1 possible ordering → proposals 2 and 3 are duplicates of proposal 1
    expect(proposals[1]._duplicate).toBe(true)
    expect(proposals[2]._duplicate).toBe(true)
  })

  it('each proposal has assignments, noAsignadas, metricas, fingerprint fields', () => {
    const proposals = generateMultipleProposals(input, mockConfig, 1)
    const p = proposals[0]
    expect(p).toHaveProperty('assignments')
    expect(p).toHaveProperty('noAsignadas')
    expect(p).toHaveProperty('metricas')
    expect(p).toHaveProperty('fingerprint')
  })

  it('returns N=1 when requested', () => {
    expect(generateMultipleProposals(input, mockConfig, 1)).toHaveLength(1)
  })

  it('metricas.totalClases equals number of input classes', () => {
    const proposals = generateMultipleProposals(input, mockConfig, 1)
    expect(proposals[0].metricas.totalClases).toBe(1)
  })
})
