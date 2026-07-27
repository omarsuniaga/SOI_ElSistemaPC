import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import { obtenerGuiaHeredadaPorClase } from '../weeklyPlanSupabase.js'

/**
 * obtenerGuiaHeredadaPorClase deriva la guía curricular de la versión de ruta
 * asignada a la clase.
 *
 * Estas pruebas afirmaban antes `route_versions.clase_id`, columna que no
 * existe: la relación va al revés, en `clases.route_version_id`. Al fallar con
 * HTTP 400, el código pasó a lanzar un error a propósito en producción
 * ('Skip direct query in production') y a caer en un catch cuyo fallback estaba
 * a su vez cortocircuitado, de modo que todas las ramas devolvían null en el
 * navegador mientras las pruebas seguían en verde sobre la forma equivocada.
 *
 * Se reescribieron sobre la relación real.
 */
describe('weeklyPlanSupabase.obtenerGuiaHeredadaPorClase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const routeVersionRow = {
    id: 'rv-1',
    version: '1.0.0',
    status: 'published',
    levels: [
      {
        id: 'level-1',
        level_number: 1,
        nodes: [
          {
            id: 'node-1',
            name: 'Escalas',
            objetivos: [{ id: 'obj-1', indicators: [{ id: 'ind-1' }, { id: 'ind-2' }] }],
          },
        ],
      },
    ],
  }

  /** Mock del par de consultas: clases -> route_versions. */
  function mockChain({ routeVersionId = 'rv-1', routeVersion = routeVersionRow, rvError = null } = {}) {
    const claseMaybeSingle = vi.fn().mockResolvedValue({
      data: routeVersionId ? { route_version_id: routeVersionId } : null,
      error: null,
    })
    const claseEq = vi.fn().mockReturnValue({ maybeSingle: claseMaybeSingle })
    const claseSelect = vi.fn().mockReturnValue({ eq: claseEq })

    const rvMaybeSingle = vi.fn().mockResolvedValue({ data: routeVersion, error: rvError })
    const rvEq = vi.fn().mockReturnValue({ maybeSingle: rvMaybeSingle })
    const rvSelect = vi.fn().mockReturnValue({ eq: rvEq })

    supabase.from.mockImplementation((table) => {
      if (table === 'clases') return { select: claseSelect }
      if (table === 'route_versions') return { select: rvSelect }
      throw new Error(`Unexpected table: ${table}`)
    })

    return { claseEq, rvEq, claseSelect, rvSelect }
  }

  it('resuelve la ruta desde clases.route_version_id y aplana la guía', async () => {
    const { claseEq, rvEq } = mockChain()

    const guia = await obtenerGuiaHeredadaPorClase('clase-1', 'maestro-1')

    expect(supabase.from).toHaveBeenCalledWith('clases')
    expect(claseEq).toHaveBeenCalledWith('id', 'clase-1')
    expect(supabase.from).toHaveBeenCalledWith('route_versions')
    expect(rvEq).toHaveBeenCalledWith('id', 'rv-1')

    expect(guia).not.toBeNull()
    expect(guia.route.id).toBe('rv-1')
    expect(guia.source).toBe('rv-1')
    expect(Array.isArray(guia.plan.items)).toBe(true)
    expect(guia.plan.items[0]).toMatchObject({
      indicator_id: 'ind-1',
      node_id: 'node-1',
      topic: 'Escalas',
      week_number: 1,
    })
  })

  it('devuelve null explícitamente cuando la clase no tiene ruta asignada', async () => {
    mockChain({ routeVersionId: null })

    const guia = await obtenerGuiaHeredadaPorClase('clase-sin-ruta')

    expect(guia).toBeNull()
    // Sin ruta asignada no hay razón para consultar route_versions.
    expect(supabase.from).not.toHaveBeenCalledWith('route_versions')
  })

  it('propaga los errores de Supabase en vez de tragarlos', async () => {
    mockChain({ rvError: { message: 'boom', code: 'PGRST000' } })

    await expect(obtenerGuiaHeredadaPorClase('clase-1')).rejects.toBeTruthy()
  })

  it('no consulta la tabla puente inexistente ni las tablas fantasma', async () => {
    mockChain()

    await obtenerGuiaHeredadaPorClase('clase-1')

    const calledTables = supabase.from.mock.calls.map((call) => call[0])
    expect(calledTables).not.toContain('class_curriculum_plan')
    expect(calledTables).not.toContain('acm_weekly_plans')
    expect(calledTables).not.toContain('acm_active_routes')
  })

  it('consulta de verdad en el navegador, sin cortocircuito por entorno', async () => {
    // El código anterior lanzaba 'Skip direct query in production' cuando no
    // estaba bajo Vitest. Con jsdom (window definido) la consulta debe ocurrir.
    expect(typeof window).toBe('object')
    mockChain()

    const guia = await obtenerGuiaHeredadaPorClase('clase-1')

    expect(guia).not.toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('clases')
  })
})
