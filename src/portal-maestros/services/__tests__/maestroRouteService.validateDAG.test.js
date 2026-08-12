import { describe, it, expect } from 'vitest'
import { validateDAG } from '../maestroRouteService.js'

// validateDAG(unidades) recibe la jerarquía completa (UNIDADES > OBJETIVOS > INDICADORES)
// y devuelve `null` si el grafo de prerrequisitos es válido, o un string de error
// si detecta un ciclo. Cadenas lineales en Fase 1: cada indicador tiene a lo sumo
// un `prerequisito_indicador_id`.

function indicador(id, prerequisito_indicador_id = null, nombre = id) {
  return { id, nombre, prerequisito_indicador_id }
}

function ruta(indicadores) {
  return [
    {
      nombre: 'Unidad 1',
      objetivos: [
        {
          nombre: 'Objetivo 1',
          indicadores,
        },
      ],
    },
  ]
}

describe('maestroRouteService.validateDAG', () => {
  it('acepta una cadena lineal sin ciclos', () => {
    const unidades = ruta([
      indicador('A'),
      indicador('B', 'A'),
      indicador('C', 'B'),
    ])
    expect(validateDAG(unidades)).toBeNull()
  })

  it('acepta una ruta sin ningún prerrequisito configurado', () => {
    const unidades = ruta([indicador('A'), indicador('B'), indicador('C')])
    expect(validateDAG(unidades)).toBeNull()
  })

  it('detecta un ciclo directo A→A (auto-referencia)', () => {
    const unidades = ruta([indicador('A', 'A')])
    const result = validateDAG(unidades)
    expect(result).not.toBeNull()
    expect(result).toMatch(/circular/i)
  })

  it('detecta un ciclo indirecto A→B→C→A', () => {
    const unidades = ruta([
      indicador('A', 'C'),
      indicador('B', 'A'),
      indicador('C', 'B'),
    ])
    const result = validateDAG(unidades)
    expect(result).not.toBeNull()
    expect(result).toMatch(/circular/i)
  })

  it('nombra los indicadores involucrados en el mensaje de error del ciclo', () => {
    const unidades = ruta([
      indicador('x1', 'x2', 'Agarrar el arco'),
      indicador('x2', 'x1', 'Pasar el arco sobre la cuerda'),
    ])
    const result = validateDAG(unidades)
    expect(result).toContain('Agarrar el arco')
    expect(result).toContain('Pasar el arco sobre la cuerda')
  })

  it('acepta múltiples unidades/objetivos con prerrequisitos cruzados entre ellos', () => {
    const unidades = [
      {
        nombre: 'Unidad 1',
        objetivos: [{ nombre: 'Objetivo 1', indicadores: [indicador('A')] }],
      },
      {
        nombre: 'Unidad 2',
        objetivos: [{ nombre: 'Objetivo 2', indicadores: [indicador('B', 'A')] }],
      },
    ]
    expect(validateDAG(unidades)).toBeNull()
  })

  it('resuelve una ruta con 50+ indicadores en cadena lineal en menos de 50ms', () => {
    const indicadores = []
    for (let i = 0; i < 60; i++) {
      indicadores.push(indicador(`ind-${i}`, i > 0 ? `ind-${i - 1}` : null))
    }
    const unidades = ruta(indicadores)

    const start = performance.now()
    const result = validateDAG(unidades)
    const elapsed = performance.now() - start

    expect(result).toBeNull()
    expect(elapsed).toBeLessThan(50)
  })

  it('detecta un ciclo largo dentro de una ruta de 50+ indicadores', () => {
    const indicadores = []
    for (let i = 0; i < 55; i++) {
      indicadores.push(indicador(`ind-${i}`, i > 0 ? `ind-${i - 1}` : 'ind-54'))
    }
    const unidades = ruta(indicadores)
    const result = validateDAG(unidades)
    expect(result).not.toBeNull()
    expect(result).toMatch(/circular/i)
  })

  it('trata objetivos/unidades sin indicadores como no-op, sin crashear', () => {
    const unidades = [
      { nombre: 'Unidad vacía', objetivos: [] },
      { nombre: 'Unidad con objetivo vacío', objetivos: [{ nombre: 'Objetivo vacío', indicadores: [] }] },
    ]
    expect(validateDAG(unidades)).toBeNull()
  })

  it('maneja un array de unidades vacío', () => {
    expect(validateDAG([])).toBeNull()
  })
})
