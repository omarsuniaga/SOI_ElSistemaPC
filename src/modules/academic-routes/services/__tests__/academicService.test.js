import { describe, it, expect, vi, beforeEach } from 'vitest'

const tableData = {}

function createBuilder(table) {
  const state = { table, filters: [], single: false, maybeSingle: false }
  const builder = {
    select() { return builder },
    eq(col, val) { state.filters.push({ type: 'eq', col, val }); return builder },
    neq(col, val) { state.filters.push({ type: 'neq', col, val }); return builder },
    in(col, vals) { state.filters.push({ type: 'in', col, vals }); return builder },
    order() { return builder },
    limit() { return builder },
    single() { state.single = true; return Promise.resolve(resolve()) },
    maybeSingle() { state.maybeSingle = true; return Promise.resolve(resolve()) },
    then(onFulfilled, onRejected) { return Promise.resolve(resolve()).then(onFulfilled, onRejected) },
  }

  function resolve() {
    let rows = [...(tableData[table] || [])]
    for (const filter of state.filters) {
      if (filter.type === 'eq') rows = rows.filter((row) => row?.[filter.col] === filter.val)
      if (filter.type === 'neq') rows = rows.filter((row) => row?.[filter.col] !== filter.val)
      if (filter.type === 'in') rows = rows.filter((row) => filter.vals.includes(row?.[filter.col]))
    }
    if (state.single || state.maybeSingle) {
      return { data: rows[0] || null, error: null }
    }
    return { data: rows, error: null }
  }

  return builder
}

vi.mock('../../../../lib/supabaseClient', () => ({
  supabase: {
    from: (table) => createBuilder(table),
  },
}))

describe('academicService.processSessionClosure', () => {
  beforeEach(() => {
    Object.keys(tableData).forEach((key) => delete tableData[key])
  })

  it('combina indicator_attempts + student_indicator_progress y adjunta contexto ACM', async () => {
    const { academicService } = await import('../academicService.js')

    tableData.sesiones_clase = [{ id: 'ses-1', clase_id: 'clase-1', maestro_id: 'mae-1', fecha: '2026-06-29' }]
    tableData.acm_active_routes = [{ id: 'route-1', group_id: 'clase-1', teacher_id: 'mae-1', weekly_plan_id: 'plan-1', current_week: 2, status: 'active' }]
    tableData.acm_weekly_plan_items = [
      { weekly_plan_id: 'plan-1', week_number: 2, topic: 'Arco recto', objective: 'Mantener trayectoria', teacher_strategy: 'Base ACM', student_activity: 'Ejercicio espejo', homework: '3 min', evidence: 'Video', indicator_id: 'ind-1' },
    ]
    tableData.acm_teacher_week_adjustments = [
      { group_id: 'clase-1', teacher_id: 'mae-1', weekly_plan_id: 'plan-1', week_number: 2, teacher_strategy: 'Modelado individual', student_activity: 'Parejas', homework: '5 min', evidence: 'Video corto', teacher_notes: 'Grupo heterogéneo' },
    ]
    tableData.indicator_attempts = [{ session_id: 'ses-1', student_id: 'stu-1', indicator_id: 'ind-1' }]
    tableData.student_indicator_progress = [{ session_id: 'ses-1', student_id: 'stu-2', indicator_id: 'ind-1', status: 'achieved' }]
    tableData.indicators = [{ id: 'ind-1', node_id: 'node-1' }]
    tableData.nodes = [{ id: 'node-1', title: 'Nodo A', level_id: 'lvl-1' }]
    tableData.levels = [{ id: 'lvl-1', name: 'Nivel 1' }]
    tableData.alumnos = [
      { id: 'stu-1', nombre_completo: 'Ana Uno' },
      { id: 'stu-2', nombre_completo: 'Luis Dos' },
    ]

    academicService.recalculateNodeProgress = vi.fn().mockResolvedValue({ status: 'approved' })
    academicService.checkLevelCompletion = vi.fn().mockResolvedValue({ status: 'approved' })

    const results = await academicService.processSessionClosure('ses-1')

    expect(results).toHaveLength(2)
    expect(results[0].planningContext?.source).toBe('acm')
    expect(results[0].planningContext?.topic).toBe('Arco recto')
    expect(results[0].planningContext?.teacherStrategy).toBe('Modelado individual')
    expect(results[0].planningContext?.teacherNotes).toBe('Grupo heterogéneo')
    expect(academicService.recalculateNodeProgress).toHaveBeenCalledTimes(2)
  })
})
