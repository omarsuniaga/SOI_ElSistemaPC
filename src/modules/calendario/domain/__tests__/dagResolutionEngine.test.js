import { describe, it, expect } from 'vitest'
import {
  resolverEstadosIniciales,
  construirArcosDag,
  validarSinCiclos,
} from '../dagResolutionEngine.js'

// ─── resolverEstadosIniciales ────────────────────────────────────────────────

describe('resolverEstadosIniciales', () => {
  it('raíz (dependeDeTMinusDias null) arranca como pendiente', () => {
    const hitos = [{ tMinusDias: 90, dependeDeTMinusDias: null }]
    const result = resolverEstadosIniciales(hitos)
    expect(result[0].estadoInicial).toBe('pendiente')
  })

  it('hito con prerequisito arranca como bloqueada_por_dependencia', () => {
    const hitos = [
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
    ]
    const result = resolverEstadosIniciales(hitos)
    expect(result[0].estadoInicial).toBe('pendiente')
    expect(result[1].estadoInicial).toBe('bloqueada_por_dependencia')
  })

  it('cadena de 3: solo la raíz es pendiente', () => {
    const hitos = [
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
      { tMinusDias: 60, dependeDeTMinusDias: 75 },
    ]
    const result = resolverEstadosIniciales(hitos)
    expect(result.map(h => h.estadoInicial)).toEqual([
      'pendiente',
      'bloqueada_por_dependencia',
      'bloqueada_por_dependencia',
    ])
  })

  it('preserva todos los campos originales del hito', () => {
    const hito = { tMinusDias: 90, dependeDeTMinusDias: null, titulo: 'T-90', departamento: 'DIR' }
    const result = resolverEstadosIniciales([hito])
    expect(result[0].titulo).toBe('T-90')
    expect(result[0].departamento).toBe('DIR')
    expect(result[0].tMinusDias).toBe(90)
  })
})

// ─── construirArcosDag ───────────────────────────────────────────────────────

describe('construirArcosDag', () => {
  const hitos = [
    { tMinusDias: 90, dependeDeTMinusDias: null },
    { tMinusDias: 75, dependeDeTMinusDias: 90 },
    { tMinusDias: 70, dependeDeTMinusDias: 90 },
  ]
  const insertadas = [
    { id: 'uuid-90', t_minus_dias: 90 },
    { id: 'uuid-75', t_minus_dias: 75 },
    { id: 'uuid-70', t_minus_dias: 70 },
  ]

  it('genera arcos solo para hitos con prerequisito', () => {
    const arcos = construirArcosDag(hitos, insertadas)
    expect(arcos).toHaveLength(2)
  })

  it('mapea correctamente tMinusDias a IDs reales de BD', () => {
    const arcos = construirArcosDag(hitos, insertadas)
    expect(arcos).toContainEqual({ tareaId: 'uuid-75', dependeDeTareaId: 'uuid-90' })
    expect(arcos).toContainEqual({ tareaId: 'uuid-70', dependeDeTareaId: 'uuid-90' })
  })

  it('omite arcos con IDs no encontrados en las insertadas', () => {
    const hitosConHuerfano = [
      ...hitos,
      { tMinusDias: 50, dependeDeTMinusDias: 999 }, // 999 no existe en insertadas
    ]
    const arcos = construirArcosDag(hitosConHuerfano, insertadas)
    expect(arcos.some(a => a.tareaId === null || a.dependeDeTareaId === null)).toBe(false)
  })

  it('raíz (dependeDeTMinusDias null) no genera arco', () => {
    const soloRaiz = [{ tMinusDias: 90, dependeDeTMinusDias: null }]
    const arcos = construirArcosDag(soloRaiz, [{ id: 'uuid-90', t_minus_dias: 90 }])
    expect(arcos).toHaveLength(0)
  })
})

// ─── validarSinCiclos ────────────────────────────────────────────────────────

describe('validarSinCiclos', () => {
  it('protocolo válido no lanza error', () => {
    const hitos = [
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
      { tMinusDias: 70, dependeDeTMinusDias: 90 },
    ]
    expect(() => validarSinCiclos(hitos)).not.toThrow()
  })

  it('auto-referencia lanza Error', () => {
    const hitos = [{ tMinusDias: 90, dependeDeTMinusDias: 90 }]
    expect(() => validarSinCiclos(hitos)).toThrow(/ciclo/i)
  })

  it('ciclo A→B→C→A lanza Error', () => {
    const hitos = [
      { tMinusDias: 10, dependeDeTMinusDias: 30 },
      { tMinusDias: 20, dependeDeTMinusDias: 10 },
      { tMinusDias: 30, dependeDeTMinusDias: 20 },
    ]
    expect(() => validarSinCiclos(hitos)).toThrow(/ciclo/i)
  })

  it('cadena lineal larga sin ciclos no lanza error', () => {
    const hitos = Array.from({ length: 10 }, (_, i) => ({
      tMinusDias: (10 - i) * 10,
      dependeDeTMinusDias: i === 0 ? null : (10 - i + 1) * 10,
    }))
    expect(() => validarSinCiclos(hitos)).not.toThrow()
  })
})