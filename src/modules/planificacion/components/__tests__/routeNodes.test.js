import { describe, it, expect } from 'vitest'
import { extraerNodosDePlan, extraerNodosDeRutaCurricular, obtenerEstructuraDemoCurricular } from '../routeNodes.js'

describe('extraerNodosDeRutaCurricular', () => {
  it('flattens the curricular hierarchy into unit/objective/indicator nodes', () => {
    const levels = [
      {
        id: 'nivel-1',
        level_number: 1,
        name: 'Técnica básica',
        nodes: [
          {
            id: 'node-1',
            name: 'Postura y arco',
            objetivos: [
              {
                id: 'obj-1',
                nombre: 'Mantener postura alineada',
                indicators: [
                  { id: 'ind-1', description: 'Espalda recta' },
                  { id: 'ind-2', description: 'Brazo relajado' },
                ],
              },
            ],
          },
        ],
      },
    ]

    const result = extraerNodosDeRutaCurricular(levels, { id: 'clase-1', nombre: 'Violín' })

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      id: 'ind-1',
      unidadId: 'nivel-1',
      unidadTitulo: 'Unidad 1: Técnica básica',
      node_id: 'node-1',
      objetivo_id: 'obj-1',
      indicador_id: 'ind-1',
      titulo: 'Mantener postura alineada · Espalda recta',
    })
    expect(result[1]).toMatchObject({
      id: 'ind-2',
      unidadId: 'nivel-1',
      titulo: 'Mantener postura alineada · Brazo relajado',
    })
  })

  it('returns an empty array when the hierarchy is empty', () => {
    expect(extraerNodosDeRutaCurricular([])).toEqual([])
  })

  it('generates demo route nodes when no real plan is available', () => {
    const demoPlan = extraerNodosDePlan(null, { id: 'clase-demo', nombre: 'Violín' })

    expect(demoPlan).toHaveLength(8)
    expect(demoPlan.esDemo).toBe(true)
    expect(demoPlan[0]).toMatchObject({ tipo: 'unidad', numero: '1' })
    expect(demoPlan[1]).toMatchObject({ tipo: 'objetivo', numero: '1.1' })
    expect(demoPlan[2]).toMatchObject({ tipo: 'indicador', numero: '1.1.1' })
  })

  it('keeps the demo curriculum structure stable for the designer view', () => {
    const demo = obtenerEstructuraDemoCurricular({ id: 'clase-demo', nombre: 'Violín' })

    expect(demo).toHaveLength(2)
    expect(demo[0].objetivos[0].indicadores).toHaveLength(2)
    expect(demo[1].objetivos[0].indicadores).toHaveLength(2)
  })
})
