/**
 * Tests for progressAggregatorService — saveProgressFromEvaluaciones section support
 *
 * Covers:
 *   - saveProgressFromEvaluaciones with alumnos param expands seccion
 *   - saveProgressFromEvaluaciones without alumnos skips seccion (backward compat)
 *   - saveProgressFromEvaluaciones with alumno_id works unchanged
 *   - Seccion 'tutti' expands to all alumnos
 *   - Unknown seccion is ignored (no expansion)
 *   - Mixed: some evaluaciones have seccion, others have alumno_id
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { supabase } from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

describe('progressAggregatorService — section support', () => {
  const mockAlumnos = [
    { id: 'a1', nombre_completo: 'Ana García', instrumento_principal: 'Violín' },
    { id: 'a2', nombre_completo: 'Pedro Ruiz', instrumento_principal: 'Viola' },
    { id: 'a3', nombre_completo: 'Luis Torres', instrumento_principal: 'Violonchelo' },
    { id: 'a4', nombre_completo: 'María López', instrumento_principal: 'Contrabajo' },
    { id: 'a5', nombre_completo: 'Juan Pérez', instrumento_principal: 'Flauta' },
  ]

  function mockUpsertChain({ data = [], error = null } = {}) {
    const chain = {
      upsert: vi.fn(() => chain),
      select: vi.fn(() => Promise.resolve({ data, error })),
    }
    return chain
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('expands seccion to individual alumnos using getAlumnosBySeccion', async () => {
    const chain = mockUpsertChain({
      data: [
        { id: 'new1', alumno_id: 'a5', contenido_dsl: 'Maderas', estado_cualitativo: 'LOGRADO' },
      ],
    })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromEvaluaciones } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromEvaluaciones({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-05-30',
      contenido: 'Maderas',
      evaluaciones: [{ seccion: 'maderas', nota: 4, observacion: 'Bien', tarea: null }],
      alumnos: mockAlumnos,
    })

    expect(result.saved).toBe(1)
    expect(result.error).toBeNull()

    const upsertedRows = chain.upsert.mock.calls[0][0]
    expect(upsertedRows).toHaveLength(1)

    // Juan Pérez (a5) plays Flauta → belongs to 'maderas'
    const row = upsertedRows[0]
    expect(row.alumno_id).toBe('a5')
    expect(row.contenido_dsl).toBe('Maderas')
    expect(row.estado_cualitativo).toBe('LOGRADO')
    expect(row.seccion).toBeUndefined()
  })

  it('without alumnos param, skips seccion expansion (backward compat)', async () => {
    const chain = mockUpsertChain({ data: [] })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromEvaluaciones } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromEvaluaciones({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-05-30',
      contenido: 'Maderas',
      evaluaciones: [{ seccion: 'maderas', nota: 4, observacion: 'Bien', tarea: null }],
      // No alumnos param → seccion rows get alumno_id = undefined
      // upsert will process them but they'll be filtered out by DB
    })

    // Rows have undefined alumno_id, upsert will handle it
    // Since no alumno_id is set, the DB upsert won't match any conflict
    expect(result.saved).toBe(0)
  })

  it('with alumno_id (no seccion) works unchanged', async () => {
    const chain = mockUpsertChain({
      data: [
        { id: 'n1', alumno_id: 'a1', contenido_dsl: 'Tema', estado_cualitativo: 'EN_PROGRESO' },
      ],
    })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromEvaluaciones } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromEvaluaciones({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-05-30',
      contenido: 'Tema',
      evaluaciones: [{ alumno_id: 'a1', nota: 3, observacion: 'Regular', tarea: 'Repasar' }],
    })

    expect(result.saved).toBe(1)

    const upsertedRows = chain.upsert.mock.calls[0][0]
    expect(upsertedRows).toHaveLength(1)
    expect(upsertedRows[0].alumno_id).toBe('a1')
    expect(upsertedRows[0].contenido_dsl).toBe('Tema')
  })

  it('tutti seccion expands to all alumnos', async () => {
    const chain = mockUpsertChain({
      data: Array.from({ length: 5 }, (_, i) => ({
        id: `n${i}`,
        alumno_id: mockAlumnos[i]?.id,
        contenido_dsl: 'Todos',
        estado_cualitativo: 'LOGRADO',
      })),
    })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromEvaluaciones } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromEvaluaciones({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-05-30',
      contenido: 'Todos',
      evaluaciones: [{ seccion: 'tutti', nota: 4, observacion: null, tarea: null }],
      alumnos: mockAlumnos,
    })

    expect(result.saved).toBe(5)

    const upsertedRows = chain.upsert.mock.calls[0][0]
    expect(upsertedRows).toHaveLength(5)
    const ids = upsertedRows.map((r) => r.alumno_id).sort()
    expect(ids).toEqual(['a1', 'a2', 'a3', 'a4', 'a5'])
  })

  it('unknown seccion is ignored (seccion not in map)', async () => {
    const chain = mockUpsertChain({ data: [] })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromEvaluaciones } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromEvaluaciones({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-05-30',
      contenido: 'Percusión',
      evaluaciones: [{ seccion: 'percusiones', nota: 4, observacion: null, tarea: null }],
      alumnos: mockAlumnos,
    })

    // Unknown seccion → getAlumnosBySeccion returns [] → row has undefined alumno_id
    expect(result.saved).toBe(0)
  })

  it('handles mixed evaluaciones: some seccion, some alumno_id', async () => {
    const chain = mockUpsertChain({
      data: [{ id: 'n1', alumno_id: 'a1', contenido_dsl: 'Clase', estado_cualitativo: 'LOGRADO' }],
    })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromEvaluaciones } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromEvaluaciones({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-05-30',
      contenido: 'Clase',
      evaluaciones: [
        { alumno_id: 'a1', nota: 4, observacion: 'Excelente', tarea: null },
        { seccion: 'violines', nota: 3, observacion: 'Bien', tarea: null },
      ],
      alumnos: mockAlumnos,
    })

    // a1 (from first eval) + Ana García (a1, from violines expansion)
    // Upsert dedup merges them → 1 saved row
    expect(result.saved).toBe(1)
  })
})

describe('progressAggregatorService — resolución de nombres mencionados (saveProgressFromDSL)', () => {
  function mockUpsertChain({ data = [], error = null } = {}) {
    const chain = {
      upsert: vi.fn(() => chain),
      select: vi.fn(() => Promise.resolve({ data, error })),
    }
    return chain
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prioriza la coincidencia EXACTA sobre una coincidencia parcial anterior en el roster (bugfix: antes ganaba el orden del arreglo, no la mejor coincidencia)', async () => {
    // "Mariana López" aparece PRIMERO en el roster y "mariana" contiene la
    // substring "ana" — con el bug anterior, mencionar "#Ana" se resolvía
    // a Mariana (primer match de .find()) en vez de a "Ana Pérez", que es
    // la coincidencia EXACTA pero aparece después en el arreglo.
    const alumnos = [
      { id: 'mariana-1', nombre: 'Mariana López', nombreCorto: 'Mariana' },
      { id: 'ana-1', nombre: 'Ana Pérez', nombreCorto: 'Ana' },
    ]
    const chain = mockUpsertChain({
      data: [{ id: 'n1', alumno_id: 'ana-1', contenido_dsl: 'Escalas', estado_cualitativo: 'LOGRADO' }],
    })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromDSL } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromDSL({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-08-09',
      dslText: '#Ana [Escalas] !LOGRADO',
      alumnos,
    })

    expect(result.errors).toEqual([])
    const upsertedRows = chain.upsert.mock.calls[0][0]
    expect(upsertedRows).toHaveLength(1)
    expect(upsertedRows[0].alumno_id).toBe('ana-1') // Ana Pérez — NO Mariana López
  })

  it('un nombre ambiguo (ninguna coincidencia exacta, varias parciales) reporta error en vez de adivinar', async () => {
    // Ni "Anabel" ni "Anastasia" son coincidencia exacta de "Ana", y ambas
    // contienen "ana" como substring — antes se elegía la primera del
    // arreglo en silencio; ahora debe reportarse como ambiguo.
    const alumnos = [
      { id: 'anabel-1', nombre: 'Anabel Ruiz', nombreCorto: 'Anabel' },
      { id: 'anastasia-1', nombre: 'Anastasia Cruz', nombreCorto: 'Anastasia' },
    ]
    const chain = mockUpsertChain({ data: [] })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromDSL } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromDSL({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-08-09',
      dslText: '#Ana [Escalas] !LOGRADO',
      alumnos,
    })

    expect(result.saved).toEqual([])
    expect(result.errors.length).toBe(1)
    expect(result.errors[0]).toContain('ambiguo')
    expect(result.errors[0]).toContain('Anabel Ruiz')
    expect(result.errors[0]).toContain('Anastasia Cruz')
  })

  it('sigue resolviendo un nombre corto sin ambigüedad (compatibilidad hacia atrás)', async () => {
    const alumnos = [
      { id: 'pedro-1', nombre: 'Pedro Ruiz', nombreCorto: 'Pedro' },
      { id: 'luis-1', nombre: 'Luis Torres', nombreCorto: 'Luis' },
    ]
    const chain = mockUpsertChain({
      data: [{ id: 'n1', alumno_id: 'pedro-1', contenido_dsl: 'Arco', estado_cualitativo: 'LOGRADO' }],
    })
    supabase.from.mockReturnValue(chain)

    const { saveProgressFromDSL } = await import('../progressAggregatorService.js')

    const result = await saveProgressFromDSL({
      sesionId: 'ses-1',
      claseId: 'cls-1',
      maestroId: 'm-1',
      fechaHoy: '2026-08-09',
      dslText: '#Pedro [Arco] !LOGRADO',
      alumnos,
    })

    expect(result.errors).toEqual([])
    const upsertedRows = chain.upsert.mock.calls[0][0]
    expect(upsertedRows[0].alumno_id).toBe('pedro-1')
  })
})
