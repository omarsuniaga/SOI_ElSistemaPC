import { describe, expect, it } from 'vitest'

import {
  countUnitsFromPlanificacion,
  resolveClassRouteStatus,
} from './planificacionRouteStatus.js'

describe('planificacionRouteStatus', () => {
  it('prioriza la planificacion estructurada del mismo maestro', () => {
    const result = resolveClassRouteStatus({
      claseId: 'clase-1',
      maestroId: 'maestro-1',
      hierarchyLevels: [{ id: 'nivel-1' }],
      planificaciones: [
        {
          id: 'plan-texto-reciente',
          clase_id: 'clase-1',
          maestro_id: 'maestro-1',
          contenido: 'Texto libre',
          updated_at: '2026-08-05T10:00:00.000Z',
        },
        {
          id: 'plan-estructurado',
          clase_id: 'clase-1',
          maestro_id: 'maestro-1',
          objetivosEstructurados: [{ id: 'u1' }, { id: 'u2' }],
          updated_at: '2026-08-01T10:00:00.000Z',
        },
      ],
    })

    expect(result).toMatchObject({
      tieneRuta: true,
      unidadesCount: 2,
      source: 'planificacion',
    })
    expect(result.planClase?.id).toBe('plan-estructurado')
  })

  it('marca ruta institucional pero no inventa unidades de clase desde la jerarquia curricular', () => {
    const result = resolveClassRouteStatus({
      claseId: 'clase-2',
      maestroId: 'maestro-1',
      hierarchyLevels: [{ id: 'nivel-1' }, { id: 'nivel-2' }, { id: 'nivel-3' }],
      planificaciones: [
        {
          id: 'plan-texto',
          clase_id: 'clase-2',
          maestro_id: 'maestro-1',
          contenido: 'Solo texto',
        },
      ],
    })

    expect(result).toMatchObject({
      tieneRuta: true,
      unidadesCount: 0,
      source: 'jerarquia',
    })
  })

  it('soporta planes legacy con objetivos serializados', () => {
    expect(countUnitsFromPlanificacion({
      objetivos: JSON.stringify([{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }]),
    })).toBe(3)
  })
})
