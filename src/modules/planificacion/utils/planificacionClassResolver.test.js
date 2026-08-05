import { describe, expect, it } from 'vitest'

import { selectBestPlanForClass } from './planificacionClassResolver.js'

describe('planificacionClassResolver', () => {
  it('prefiere el plan estructurado del mismo maestro aunque exista otro m?s reciente sin unidades', () => {
    const result = selectBestPlanForClass(
      [
        {
          id: 'plan-simple',
          clase_id: 'clase-1',
          maestro_id: 'maestro-1',
          estado: 'activa',
          titulo: 'Plan simple',
          contenido: 'Texto simple',
          updated_at: '2026-08-05T12:00:00Z',
        },
        {
          id: 'plan-estructurado',
          clase_id: 'clase-1',
          maestro_id: 'maestro-1',
          estado: 'borrador',
          objetivosEstructurados: [
            { id: 'u-1', titulo: 'Unidad real', objetivos: [{ id: 'o-1', titulo: 'Obj', indicadores: [] }] },
          ],
          updated_at: '2026-08-04T12:00:00Z',
        },
      ],
      { claseId: 'clase-1', maestroId: 'maestro-1' },
    )

    expect(result?.id).toBe('plan-estructurado')
  })

  it('prefiere planes del maestro actual cuando la clase tiene registros de varios maestros', () => {
    const result = selectBestPlanForClass(
      [
        {
          id: 'plan-ajeno',
          clase_id: 'clase-1',
          maestro_id: 'maestro-2',
          estado: 'activa',
          objetivosEstructurados: [{ id: 'u-1', titulo: 'Unidad ajena', objetivos: [] }],
          updated_at: '2026-08-05T12:00:00Z',
        },
        {
          id: 'plan-propio',
          clase_id: 'clase-1',
          maestro_id: 'maestro-1',
          estado: 'activa',
          objetivosEstructurados: [{ id: 'u-2', titulo: 'Unidad propia', objetivos: [] }],
          updated_at: '2026-08-04T12:00:00Z',
        },
      ],
      { claseId: 'clase-1', maestroId: 'maestro-1' },
    )

    expect(result?.id).toBe('plan-propio')
  })
})
