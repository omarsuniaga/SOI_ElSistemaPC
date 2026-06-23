import { describe, test, expect } from 'vitest'
import {
  SCORE_WEIGHTS,
  calcularScore,
  clasificarNivel,
  getEfectosNivel,
  buildScoreSnapshot,
} from '../domain/score.js'

describe('SCORE_WEIGHTS', () => {
  test('has correct weights summing to 100', () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBe(100)
    expect(SCORE_WEIGHTS.puntualidad).toBe(35)
    expect(SCORE_WEIGHTS.consistencia).toBe(20)
    expect(SCORE_WEIGHTS.voluntad_pago).toBe(20)
    expect(SCORE_WEIGHTS.comportamiento_mora).toBe(15)
    expect(SCORE_WEIGHTS.generosidad).toBe(10)
  })
})

describe('calcularScore', () => {
  test('perfect score: 100% puntual, 12 meses, no mora, 5 extras, no compromisos (D3)', () => {
    const score = calcularScore({
      puntualidadPct: 100,
      consistenciaMeses: 12,
      compromisos: [],
      moraEpisodios: 0,
      pagosExtras: 5,
    })
    expect(score).toBe(100)
  })

  test('D3: compromisos.length === 0 → voluntad_pago = 20 (contributes to total)', () => {
    // puntualidad=0, consistencia=0, voluntad=20(D3), mora=15(0 episodes), generosidad=0 → 35
    const score = calcularScore({
      puntualidadPct: 0,
      consistenciaMeses: 0,
      compromisos: [],
      moraEpisodios: 0,
      pagosExtras: 0,
    })
    expect(score).toBe(35)
  })

  test('compromisos with 50% cumplidos → voluntad_pago = 10', () => {
    // puntualidad=0, consistencia=0, voluntad=10(50%), mora=15(0 eps), generosidad=0 → 25
    const compromisos = [{ cumplido: true }, { cumplido: false }]
    const score = calcularScore({
      puntualidadPct: 0,
      consistenciaMeses: 0,
      compromisos,
      moraEpisodios: 0,
      pagosExtras: 0,
    })
    expect(score).toBe(25)
  })

  test('consistenciaMeses capped at 12', () => {
    const s1 = calcularScore({ puntualidadPct: 0, consistenciaMeses: 12, compromisos: [], moraEpisodios: 0, pagosExtras: 0 })
    const s2 = calcularScore({ puntualidadPct: 0, consistenciaMeses: 24, compromisos: [], moraEpisodios: 0, pagosExtras: 0 })
    expect(s1).toBe(s2)
  })

  test('5 mora episodios → comportamiento_mora = 0', () => {
    // puntualidad=0, consistencia=0, voluntad=20(D3), mora=max(0,15-15)=0, generosidad=0 → 20
    const score = calcularScore({
      puntualidadPct: 0,
      consistenciaMeses: 0,
      compromisos: [],
      moraEpisodios: 5,
      pagosExtras: 0,
    })
    expect(score).toBe(20)
  })

  test('generosidad capped at 10 (max 5 extras)', () => {
    const s1 = calcularScore({ puntualidadPct: 0, consistenciaMeses: 0, compromisos: [], moraEpisodios: 0, pagosExtras: 5 })
    const s2 = calcularScore({ puntualidadPct: 0, consistenciaMeses: 0, compromisos: [], moraEpisodios: 0, pagosExtras: 10 })
    expect(s1).toBe(s2)
  })

  test('puntualidad contributes correctly', () => {
    // puntualidad: 50*0.35=17.5, consistencia=0, voluntad=20(D3), mora=15, generosidad=0 → 52.5
    const score = calcularScore({ puntualidadPct: 50, consistenciaMeses: 0, compromisos: [], moraEpisodios: 0, pagosExtras: 0 })
    expect(score).toBeCloseTo(52.5, 1)
  })

  test('score is bounded between 0 and 100', () => {
    const score = calcularScore({ puntualidadPct: 100, consistenciaMeses: 12, compromisos: [], moraEpisodios: 0, pagosExtras: 100 })
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})

describe('clasificarNivel', () => {
  test('score >= 90 → A', () => expect(clasificarNivel(90)).toBe('A'))
  test('score >= 75 → B', () => expect(clasificarNivel(75)).toBe('B'))
  test('score >= 60 → C', () => expect(clasificarNivel(60)).toBe('C'))
  test('score >= 40 → D', () => expect(clasificarNivel(40)).toBe('D'))
  test('score < 40 → E', () => expect(clasificarNivel(39)).toBe('E'))
  test('score 100 → A', () => expect(clasificarNivel(100)).toBe('A'))
  test('score 0 → E', () => expect(clasificarNivel(0)).toBe('E'))
})

describe('getEfectosNivel', () => {
  test('nivel A allows premium instrument, no manual approval', () => {
    const e = getEfectosNivel('A')
    expect(e.puedeRecibirInstrumentoPremium).toBe(true)
    expect(e.requiereAprobacionManual).toBe(false)
    expect(e.protocoloRetencion).toBe(false)
  })

  test('nivel E requires manual approval and retention protocol', () => {
    const e = getEfectosNivel('E')
    expect(e.requiereAprobacionManual).toBe(true)
    expect(e.protocoloRetencion).toBe(true)
    expect(e.puedeRecibirInstrumentoPremium).toBe(false)
  })

  test('returns descripcion string', () => {
    const e = getEfectosNivel('B')
    expect(typeof e.descripcion).toBe('string')
    expect(e.descripcion.length).toBeGreaterThan(0)
  })
})

describe('buildScoreSnapshot', () => {
  test('builds snapshot record with all required fields', () => {
    const rawData = { puntualidadPct: 80, consistenciaMeses: 6, compromisos: [], moraEpisodios: 0, pagosExtras: 1 }
    const snap = buildScoreSnapshot({
      representante_id: 'rep-1',
      familia_id: 'fam-1',
      ciclo_mes: 6,
      ciclo_anio: 2026,
      rawData,
    })
    expect(snap.representante_id).toBe('rep-1')
    expect(snap.familia_id).toBe('fam-1')
    expect(snap.ciclo_mes).toBe(6)
    expect(snap.ciclo_anio).toBe(2026)
    expect(typeof snap.score_total).toBe('number')
    expect(['A','B','C','D','E']).toContain(snap.nivel)
  })
})
