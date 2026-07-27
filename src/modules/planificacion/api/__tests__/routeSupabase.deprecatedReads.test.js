import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import * as routeSupabase from '../routeSupabase.js'

/**
 * WU #3 — routeSupabase.js NO debe leer las tablas DEPRECATED plan_clases /
 * plan_niveles / plan_temas / plan_objetivos / plan_indicadores (no existen
 * en producción). Debe leer el esquema real: clases, levels, nodes,
 * objetivos, indicators — preservando la forma de salida (nombre,
 * numero_nivel, plan_temas, plan_objetivos, plan_indicadores) que ya
 * consumen rutaAcademicaView.js y routeMock.js en modo demo.
 */
describe('routeSupabase — no deprecated plan_* table reads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockChain(finalData) {
    const order = vi.fn().mockResolvedValue({ data: finalData, error: null })
    const eq = vi.fn().mockReturnValue({ order, eq: vi.fn().mockReturnValue({ order }) })
    const select = vi.fn().mockReturnValue({ eq, order })
    supabase.from.mockReturnValue({ select })
    return { select, eq, order }
  }

  it('getClasses reads from "clases", not "plan_clases"', async () => {
    mockChain([{ id: 'c1', nombre: 'Violín A', activo: true }])
    await routeSupabase.getClasses()
    expect(supabase.from).toHaveBeenCalledWith('clases')
    expect(supabase.from).not.toHaveBeenCalledWith('plan_clases')
  })

  // La ruta de una clase se resuelve por `clases.route_version_id`. La versión
  // anterior consultaba la tabla puente `class_curriculum_plan`, que nunca se
  // desplegó en producción.
  function mockClaseConRuta(routeVersionId) {
    return vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { route_version_id: routeVersionId },
          error: null,
        }),
      }),
    })
  }

  it('getLevelsByClass resuelve clases.route_version_id -> levels, no "plan_niveles"', async () => {
    const levelsOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'l1', level_number: 1, name: 'Nivel 1' }],
      error: null,
    })
    const levelsEq = vi.fn().mockReturnValue({ order: levelsOrder })
    const levelsSelect = vi.fn().mockReturnValue({ eq: levelsEq })

    supabase.from.mockImplementation((table) => {
      if (table === 'clases') return { select: mockClaseConRuta('rv-1') }
      if (table === 'levels') return { select: levelsSelect }
      throw new Error(`Unexpected table: ${table}`)
    })

    const levels = await routeSupabase.getLevelsByClass('clase-1')

    expect(supabase.from).toHaveBeenCalledWith('clases')
    expect(supabase.from).not.toHaveBeenCalledWith('plan_niveles')
    expect(supabase.from).not.toHaveBeenCalledWith('class_curriculum_plan')
    expect(levelsEq).toHaveBeenCalledWith('route_version_id', 'rv-1')
    expect(levels[0]).toMatchObject({ numero_nivel: 1, nombre: 'Nivel 1' })
  })

  it('getLevelsByClass devuelve [] cuando la clase no tiene ruta asignada', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'clases') return { select: mockClaseConRuta(null) }
      throw new Error(`Unexpected table: ${table}`)
    })

    const levels = await routeSupabase.getLevelsByClass('clase-sin-ruta')
    expect(levels).toEqual([])
  })

  it('getNodesByLevel reads from "nodes", not "plan_temas"', async () => {
    mockChain([{ id: 'n1', name: 'Escalas', order_index: 0 }])
    await routeSupabase.getNodesByLevel('level-1')
    expect(supabase.from).toHaveBeenCalledWith('nodes')
    expect(supabase.from).not.toHaveBeenCalledWith('plan_temas')
  })

  it('getObjectivesByNode reads from "objetivos", not "plan_objetivos"', async () => {
    mockChain([{ id: 'o1', nombre: 'Objetivo 1', order_index: 0 }])
    await routeSupabase.getObjectivesByNode('node-1')
    expect(supabase.from).toHaveBeenCalledWith('objetivos')
    expect(supabase.from).not.toHaveBeenCalledWith('plan_objetivos')
  })

  it('getIndicatorsByObjective reads from "indicators", not "plan_indicadores"', async () => {
    mockChain([{ id: 'i1', description: 'Indicador 1', order_index: 0 }])
    await routeSupabase.getIndicatorsByObjective('objetivo-1')
    expect(supabase.from).toHaveBeenCalledWith('indicators')
    expect(supabase.from).not.toHaveBeenCalledWith('plan_indicadores')
  })

  it('getFullHierarchy resolves clase_id -> route_versions.id and never touches any deprecated plan_* table', async () => {
    const hierarchyOrder = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'l1',
          level_number: 1,
          name: 'Nivel 1',
          main_objective: 'Fundamentos',
          nodes: [
            {
              id: 'n1',
              name: 'Escalas',
              type: 'TECNICA',
              order_index: 0,
              objetivos: [
                {
                  id: 'o1',
                  nombre: 'Postura correcta',
                  order_index: 0,
                  indicators: [{ id: 'i1', description: 'Mantiene la espalda recta', order_index: 0 }],
                },
              ],
            },
          ],
        },
      ],
      error: null,
    })
    const hierarchyEq = vi.fn().mockReturnValue({ order: hierarchyOrder })
    const hierarchySelect = vi.fn().mockReturnValue({ eq: hierarchyEq })

    supabase.from.mockImplementation((table) => {
      if (table === 'clases') return { select: mockClaseConRuta('rv-1') }
      if (table === 'levels') return { select: hierarchySelect }
      throw new Error(`Unexpected table: ${table}`)
    })

    const levels = await routeSupabase.getFullHierarchy('clase-1')

    const calledTables = supabase.from.mock.calls.map((call) => call[0])
    expect(calledTables).toContain('clases')
    expect(calledTables).not.toContain('class_curriculum_plan')
    expect(calledTables).not.toContain('plan_clases')
    expect(calledTables).not.toContain('plan_niveles')
    expect(calledTables).not.toContain('plan_temas')
    expect(calledTables).not.toContain('plan_objetivos')
    expect(calledTables).not.toContain('plan_indicadores')
    expect(calledTables).toContain('levels')

    // Preserva la forma esperada por rutaAcademicaView.js / routeMock.js
    expect(levels[0]).toMatchObject({ numero_nivel: 1, nombre: 'Nivel 1' })
    expect(levels[0].plan_temas[0]).toMatchObject({ nombre: 'Escalas' })
    expect(levels[0].plan_temas[0].plan_objetivos[0]).toMatchObject({ nombre: 'Postura correcta' })
    expect(levels[0].plan_temas[0].plan_objetivos[0].plan_indicadores[0]).toMatchObject({
      descripcion: 'Mantiene la espalda recta',
    })
  })

  it('updateIndicatorCalificacion fails loudly instead of writing to a non-existent column', async () => {
    await expect(routeSupabase.updateIndicatorCalificacion('ind-1', 5)).rejects.toThrow(
      /indicator_attempts/i,
    )
  })
})
