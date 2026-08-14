import { describe, it, expect } from 'vitest'
import {
  resolverEstadosIniciales,
  construirArcosDag,
  validarSinCiclos,
} from '../dagResolutionEngine.js'

// ─── resolverEstadosIniciales ────────────────────────────────────────────────

describe('resolverEstadosIniciales', () => {
  it('raíz (dependeDeTMinusDias null) arranca como pendiente', () => {
    const result = resolverEstadosIniciales([{ tMinusDias: 90, dependeDeTMinusDias: null }])
    expect(result[0].estadoInicial).toBe('pendiente')
  })

  it('hito con prerequisito arranca como bloqueada_por_dependencia', () => {
    const result = resolverEstadosIniciales([
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
    ])
    expect(result[0].estadoInicial).toBe('pendiente')
    expect(result[1].estadoInicial).toBe('bloqueada_por_dependencia')
  })

  it('cadena de 3: solo la raíz es pendiente', () => {
    const result = resolverEstadosIniciales([
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
      { tMinusDias: 60, dependeDeTMinusDias: 75 },
    ])
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
    expect(construirArcosDag(hitos, insertadas)).toHaveLength(2)
  })

  it('mapea correctamente tMinusDias a IDs reales de BD', () => {
    const arcos = construirArcosDag(hitos, insertadas)
    expect(arcos).toContainEqual({ tareaId: 'uuid-75', dependeDeTareaId: 'uuid-90' })
    expect(arcos).toContainEqual({ tareaId: 'uuid-70', dependeDeTareaId: 'uuid-90' })
  })

  it('omite arcos con IDs no encontrados en las insertadas', () => {
    const hitosConHuerfano = [
      ...hitos,
      { tMinusDias: 50, dependeDeTMinusDias: 999 },
    ]
    const arcos = construirArcosDag(hitosConHuerfano, insertadas)
    expect(arcos.some(a => a.tareaId === null || a.dependeDeTareaId === null)).toBe(false)
  })

  it('raíz no genera arco', () => {
    const arcos = construirArcosDag(
      [{ tMinusDias: 90, dependeDeTMinusDias: null }],
      [{ id: 'uuid-90', t_minus_dias: 90 }]
    )
    expect(arcos).toHaveLength(0)
  })
})

// ─── validarSinCiclos ────────────────────────────────────────────────────────

describe('validarSinCiclos', () => {
  it('protocolo válido no lanza error', () => {
    expect(() => validarSinCiclos([
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
      { tMinusDias: 70, dependeDeTMinusDias: 90 },
    ])).not.toThrow()
  })

  it('auto-referencia lanza Error', () => {
    expect(() => validarSinCiclos([
      { tMinusDias: 90, dependeDeTMinusDias: 90 },
    ])).toThrow(/ciclo/i)
  })

  it('ciclo A→B→C→A lanza Error', () => {
    expect(() => validarSinCiclos([
      { tMinusDias: 10, dependeDeTMinusDias: 30 },
      { tMinusDias: 20, dependeDeTMinusDias: 10 },
      { tMinusDias: 30, dependeDeTMinusDias: 20 },
    ])).toThrow(/ciclo/i)
  })

  it('cadena lineal larga sin ciclos no lanza error', () => {
    const hitos = Array.from({ length: 10 }, (_, i) => ({
      tMinusDias: (10 - i) * 10,
      dependeDeTMinusDias: i === 0 ? null : (10 - i + 1) * 10,
    }))
    expect(() => validarSinCiclos(hitos)).not.toThrow()
  })
})
