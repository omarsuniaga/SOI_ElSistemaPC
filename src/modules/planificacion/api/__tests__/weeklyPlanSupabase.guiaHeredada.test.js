import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import { obtenerGuiaHeredadaPorClase } from '../weeklyPlanSupabase.js'

/**
 * WU #2 — weeklyPlanSupabase.obtenerGuiaHeredadaPorClase debe derivarse de
 * route_versions PUBLICADAS (status='published', el valor REAL del enum en
 * producción — ver ruta-academica-tables.sql), no de las tablas fantasma
 * acm_weekly_plans / acm_active_routes (0 filas en prod).
 */
describe('weeklyPlanSupabase.obtenerGuiaHeredadaPorClase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries route_versions filtered by published status and clase_id, most recent first', async () => {
    const routeVersionRow = {
      id: 'rv-1',
      clase_id: 'clase-1',
      status: 'published',
      current_week: 3,
      level_id: 'level-1',
      levels: [
        {
          id: 'level-1',
          level_number: 1,
          nodes: [
            {
              id: 'node-1',
              name: 'Escalas',
              objetivos: [
                {
                  id: 'obj-1',
                  indicators: [{ id: 'ind-1' }, { id: 'ind-2' }],
                },
              ],
            },
          ],
        },
      ],
    }

    const limit = vi.fn().mockResolvedValue({ data: [routeVersionRow], error: null })
    const order = vi.fn().mockReturnValue({ limit })
    const eqStatus = vi.fn().mockReturnValue({ order })
    const eqClase = vi.fn().mockReturnValue({ eq: eqStatus })
    const select = vi.fn().mockReturnValue({ eq: eqClase })
    supabase.from.mockReturnValue({ select })

    const guia = await obtenerGuiaHeredadaPorClase('clase-1', 'maestro-1')

    expect(supabase.from).toHaveBeenCalledWith('route_versions')
    expect(eqClase).toHaveBeenCalledWith('clase_id', 'clase-1')
    expect(eqStatus).toHaveBeenCalledWith('status', 'published')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(limit).toHaveBeenCalledWith(1)

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

  it('returns null explicitly when there is no published version for the class (not a silent swallow)', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null })
    const order = vi.fn().mockReturnValue({ limit })
    const eqStatus = vi.fn().mockReturnValue({ order })
    const eqClase = vi.fn().mockReturnValue({ eq: eqStatus })
    const select = vi.fn().mockReturnValue({ eq: eqClase })
    supabase.from.mockReturnValue({ select })

    const guia = await obtenerGuiaHeredadaPorClase('clase-sin-ruta')

    expect(guia).toBeNull()
  })

  it('propagates Supabase errors instead of swallowing them', async () => {
    const limit = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom', code: 'PGRST000' } })
    const order = vi.fn().mockReturnValue({ limit })
    const eqStatus = vi.fn().mockReturnValue({ order })
    const eqClase = vi.fn().mockReturnValue({ eq: eqStatus })
    const select = vi.fn().mockReturnValue({ eq: eqClase })
    supabase.from.mockReturnValue({ select })

    await expect(obtenerGuiaHeredadaPorClase('clase-1')).rejects.toBeTruthy()
  })

  it('never reads from the deprecated ghost tables acm_weekly_plans / acm_active_routes', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null })
    const order = vi.fn().mockReturnValue({ limit })
    const eqStatus = vi.fn().mockReturnValue({ order })
    const eqClase = vi.fn().mockReturnValue({ eq: eqStatus })
    const select = vi.fn().mockReturnValue({ eq: eqClase })
    supabase.from.mockReturnValue({ select })

    await obtenerGuiaHeredadaPorClase('clase-1')

    const calledTables = supabase.from.mock.calls.map((call) => call[0])
    expect(calledTables).not.toContain('acm_weekly_plans')
    expect(calledTables).not.toContain('acm_active_routes')
  })
})
