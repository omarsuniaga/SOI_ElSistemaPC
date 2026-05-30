/**
 * Tests for SessionSummaryPanel v2 — grouped progress view
 *
 * Covers:
 *   - API contract: createSessionSummaryPanel() returns { open, close }
 *   - open() fetches progresos + alumnos, renders grouped layout
 *   - Grouping by contenido_dsl (normalized: trim + lowercase)
 *   - Estado mixto when estados differ in same group
 *   - Empty state when no records
 *   - WhatsApp text builder with grouped format
 *   - close() cleanup
 *   - HTML escaping (XSS prevention)
 *   - Observaciones and tarea from first non-empty record
 *   - Case-insensitive grouping
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('SessionSummaryPanel v2 — grouped', () => {
  let panel
  let mod

  const mockAlumnos = [
    { id: 'a1', nombre_completo: 'Ana García' },
    { id: 'a2', nombre_completo: 'Pedro Ruiz' },
    { id: 'a3', nombre_completo: 'Luis Pérez' },
    { id: 'a4', nombre_completo: 'María López' },
    { id: 'a5', nombre_completo: 'Juan Díaz' },
  ]

  function createMockSupabase({ progresos = [], alumnos = [] } = {}) {
    const progresosChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: progresos, error: null }),
    }
    const alumnosChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: alumnos, error: null }),
    }
    return {
      from: vi.fn((table) => {
        if (table === 'progresos') return progresosChain
        if (table === 'alumnos') return alumnosChain
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }),
    }
  }

  beforeEach(async () => {
    mod = await import('../SessionSummaryPanel.js')

    // Clean DOM
    document.getElementById('ssp-styles')?.remove()
    document.querySelector('.ssp-wrapper')?.remove()
  })

  afterEach(() => {
    panel?.close()
    document.getElementById('ssp-styles')?.remove()
    document.querySelector('.ssp-wrapper')?.remove()
  })

  // ── API Contract ──────────────────────────────────────────────────────────

  it('returns { open, close }', () => {
    panel = mod.createSessionSummaryPanel()
    expect(panel).toHaveProperty('open')
    expect(panel).toHaveProperty('close')
    expect(typeof panel.open).toBe('function')
    expect(typeof panel.close).toBe('function')
  })

  // ── Open / render ─────────────────────────────────────────────────────────

  it('renders loading state then grouped groups after data fetch', async () => {
    const mockSupabase = createMockSupabase({
      progresos: [
        {
          id: '1',
          alumno_id: 'a1',
          contenido_dsl: 'Danzón maderas c.23-49',
          estado_cualitativo: 'LOGRADO',
          observaciones: 'Bien ejecutado',
          indicadores: { tarea: 'Practicar compases 1-16' },
        },
        {
          id: '2',
          alumno_id: 'a2',
          contenido_dsl: 'Danzón maderas c.23-49',
          estado_cualitativo: 'LOGRADO',
          observaciones: null,
          indicadores: null,
        },
        {
          id: '3',
          alumno_id: 'a3',
          contenido_dsl: 'Escala Sol M',
          estado_cualitativo: 'EN_PROGRESO',
          observaciones: 'Mejorar digitación',
          indicadores: null,
        },
      ],
      alumnos: mockAlumnos,
    })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Guitarra I',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const wrapper = document.querySelector('.ssp-wrapper')
    expect(wrapper).toBeTruthy()
    expect(wrapper.style.display).toBe('flex')

    const groups = wrapper.querySelectorAll('.ssp-group')
    expect(groups.length).toBe(2)

    // Group 1: Danzón maderas c.23-49
    const g1 = groups[0]
    expect(g1.querySelector('.ssp-group-contenido').textContent).toContain('Danzón maderas c.23-49')
    expect(g1.querySelector('.ssp-group-count').textContent).toContain('2')
    expect(g1.querySelector('.ssp-estado-badge').textContent.trim()).toBe('LOGRADO')
    expect(g1.querySelector('.ssp-estado-badge').classList.contains('ssp-estado-logrado')).toBe(
      true,
    )

    const chips1 = g1.querySelectorAll('.ssp-alumno-chip')
    expect(chips1).toHaveLength(2)
    expect(chips1[0].textContent).toBe('Ana García')
    expect(chips1[1].textContent).toBe('Pedro Ruiz')

    expect(g1.querySelector('.ssp-group-obs').textContent).toContain('Bien ejecutado')
    expect(g1.querySelector('.ssp-group-tarea').textContent).toContain('Practicar compases 1-16')

    // Group 2: Escala Sol M
    const g2 = groups[1]
    expect(g2.querySelector('.ssp-group-contenido').textContent).toContain('Escala Sol M')
    expect(g2.querySelector('.ssp-group-count').textContent).toContain('1')
    expect(g2.querySelector('.ssp-estado-badge').textContent.trim()).toBe('EN_PROGRESO')

    const chips2 = g2.querySelectorAll('.ssp-alumno-chip')
    expect(chips2).toHaveLength(1)
    expect(chips2[0].textContent).toBe('Luis Pérez')
    expect(g2.querySelector('.ssp-group-obs').textContent).toContain('Mejorar digitación')
  })

  // ── Estado mixto ──────────────────────────────────────────────────────────

  it('sets estado to MIXTO when records in same group have different estados', async () => {
    const mockSupabase = createMockSupabase({
      progresos: [
        {
          id: '1',
          alumno_id: 'a1',
          contenido_dsl: 'Danzón maderas',
          estado_cualitativo: 'LOGRADO',
          observaciones: null,
          indicadores: null,
        },
        {
          id: '2',
          alumno_id: 'a2',
          contenido_dsl: 'Danzón maderas',
          estado_cualitativo: 'EN_PROGRESO',
          observaciones: null,
          indicadores: null,
        },
      ],
      alumnos: mockAlumnos,
    })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Clase',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const badge = document.querySelector('.ssp-estado-badge')
    expect(badge.textContent.trim()).toBe('MIXTO')
    expect(badge.classList.contains('ssp-estado-mixto')).toBe(true)

    // Chips should have individual estado classes
    const chips = document.querySelectorAll('.ssp-alumno-chip')
    expect(chips[0].classList.contains('ssp-chip-logrado')).toBe(true)
    expect(chips[1].classList.contains('ssp-chip-en-progreso')).toBe(true)
  })

  // ── Empty state ───────────────────────────────────────────────────────────

  it('renders empty state when no records returned', async () => {
    const mockSupabase = createMockSupabase({ progresos: [], alumnos: [] })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-empty',
      claseNombre: 'Clase Vacía',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const emptyEl = document.querySelector('.ssp-empty')
    expect(emptyEl).toBeTruthy()
    expect(emptyEl.textContent).toContain('No hay registros de progreso')
    expect(emptyEl.textContent).toContain('Analizar')

    // No groups
    expect(document.querySelector('.ssp-group')).toBeFalsy()
  })

  // ── WhatsApp text ─────────────────────────────────────────────────────────

  it('builds WhatsApp text with grouped format', async () => {
    const mockSupabase = createMockSupabase({
      progresos: [
        {
          id: '1',
          alumno_id: 'a1',
          contenido_dsl: 'Danzón maderas c.23-49',
          estado_cualitativo: 'LOGRADO',
          observaciones: null,
          indicadores: null,
        },
        {
          id: '2',
          alumno_id: 'a2',
          contenido_dsl: 'Danzón maderas c.23-49',
          estado_cualitativo: 'LOGRADO',
          observaciones: null,
          indicadores: null,
        },
        {
          id: '3',
          alumno_id: 'a3',
          contenido_dsl: 'Escala Sol M',
          estado_cualitativo: 'EN_PROGRESO',
          observaciones: null,
          indicadores: { tarea: 'Práctica de arpegios' },
        },
      ],
      alumnos: mockAlumnos,
    })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Guitarra I',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    // Click WhatsApp button
    const waBtn = document.querySelector('.ssp-btn-wa')
    expect(waBtn).toBeTruthy()
    expect(waBtn.innerHTML).toContain('WhatsApp')
  })

  // ── Close ─────────────────────────────────────────────────────────────────

  it('close() hides wrapper and clears state', async () => {
    const mockSupabase = createMockSupabase({
      progresos: [
        {
          id: '1',
          alumno_id: 'a1',
          contenido_dsl: 'Tema',
          estado_cualitativo: 'LOGRADO',
          observaciones: null,
          indicadores: null,
        },
      ],
      alumnos: mockAlumnos,
    })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Clase',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const wrapper = document.querySelector('.ssp-wrapper')
    expect(wrapper.style.display).toBe('flex')

    panel.close()

    expect(wrapper.style.display).toBe('none')
    expect(wrapper.innerHTML).toBe('')

    // Open again should work
    wrapper.style.display = '' // reset for next open
    await panel.open({
      sesionId: 'ses-2',
      claseNombre: 'Clase 2',
      fecha: '2026-06-01',
      supabase: mockSupabase,
    })
    expect(document.querySelector('.ssp-wrapper').style.display).toBe('flex')
  })

  // ── Backdrop closes panel ─────────────────────────────────────────────────

  it('backdrop click calls close', async () => {
    const mockSupabase = createMockSupabase({
      progresos: [
        {
          id: '1',
          alumno_id: 'a1',
          contenido_dsl: 'Tema',
          estado_cualitativo: 'LOGRADO',
          observaciones: null,
          indicadores: null,
        },
      ],
      alumnos: mockAlumnos,
    })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Clase',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const backdrop = document.querySelector('.ssp-backdrop')
    expect(backdrop).toBeTruthy()

    backdrop.click()
    expect(document.querySelector('.ssp-wrapper').style.display).toBe('none')
  })

  // ── HTML escaping ─────────────────────────────────────────────────────────

  it('escapes HTML in contenido, observaciones, nombres', async () => {
    const mockSupabase = createMockSupabase({
      progresos: [
        {
          id: '1',
          alumno_id: 'a4',
          contenido_dsl: '<script>alert("xss")</script>',
          estado_cualitativo: 'LOGRADO',
          observaciones: '<b>nota</b>',
          indicadores: { tarea: '<i>tarea</i>' },
        },
      ],
      alumnos: [{ id: 'a4', nombre_completo: '<img onerror="evil()">' }],
    })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Clase',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const contenido = document.querySelector('.ssp-group-contenido')
    expect(contenido.innerHTML).not.toContain('<script>')
    expect(contenido.innerHTML).toContain('&lt;script&gt;')

    const obs = document.querySelector('.ssp-group-obs')
    expect(obs.innerHTML).not.toContain('<b>')
    expect(obs.innerHTML).toContain('&lt;b&gt;')

    const chip = document.querySelector('.ssp-alumno-chip')
    expect(chip.innerHTML).not.toContain('<img')
    expect(chip.innerHTML).toContain('&lt;img')
  })

  // ── Observaciones / tarea from first non-empty ────────────────────────────

  it('takes observaciones and tarea from first non-empty record in group', async () => {
    const mockSupabase = createMockSupabase({
      progresos: [
        {
          id: '1',
          alumno_id: 'a1',
          contenido_dsl: 'Tema común',
          estado_cualitativo: 'LOGRADO',
          observaciones: null,
          indicadores: null,
        },
        {
          id: '2',
          alumno_id: 'a2',
          contenido_dsl: 'Tema común',
          estado_cualitativo: 'LOGRADO',
          observaciones: 'Primera obs con texto',
          indicadores: { tarea: 'Primera tarea' },
        },
        {
          id: '3',
          alumno_id: 'a3',
          contenido_dsl: 'Tema común',
          estado_cualitativo: 'LOGRADO',
          observaciones: 'Segunda obs',
          indicadores: { tarea: 'Segunda tarea' },
        },
      ],
      alumnos: mockAlumnos,
    })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Clase',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const obs = document.querySelector('.ssp-group-obs')
    expect(obs.textContent).toContain('Primera obs con texto')
    expect(obs.textContent).not.toContain('Segunda obs')

    const tarea = document.querySelector('.ssp-group-tarea')
    expect(tarea.textContent).toContain('Primera tarea')
  })

  // ── Case-insensitive / trim grouping ──────────────────────────────────────

  it('groups records case-insensitively and with trimmed content', async () => {
    const mockSupabase = createMockSupabase({
      progresos: [
        {
          id: '1',
          alumno_id: 'a1',
          contenido_dsl: '  Danzón Maderas  ',
          estado_cualitativo: 'LOGRADO',
          observaciones: null,
          indicadores: null,
        },
        {
          id: '2',
          alumno_id: 'a2',
          contenido_dsl: 'danzón maderas',
          estado_cualitativo: 'EN_PROGRESO',
          observaciones: null,
          indicadores: null,
        },
        {
          id: '3',
          alumno_id: 'a3',
          contenido_dsl: 'danzón MADERAS',
          estado_cualitativo: 'INICIADO',
          observaciones: null,
          indicadores: null,
        },
      ],
      alumnos: mockAlumnos,
    })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Clase',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const groups = document.querySelectorAll('.ssp-group')
    expect(groups.length).toBe(1)
    // Should use the FIRST record's original contenido
    expect(groups[0].querySelector('.ssp-group-contenido').textContent).toContain('Danzón Maderas')
    expect(groups[0].querySelector('.ssp-group-count').textContent).toContain('3')
    expect(groups[0].querySelector('.ssp-estado-badge').textContent.trim()).toBe('MIXTO')

    const chips = groups[0].querySelectorAll('.ssp-alumno-chip')
    expect(chips).toHaveLength(3)
    expect(chips[0].classList.contains('ssp-chip-logrado')).toBe(true)
    expect(chips[1].classList.contains('ssp-chip-en-progreso')).toBe(true)
    expect(chips[2].classList.contains('ssp-chip-iniciado')).toBe(true)
  })

  // ── Header / subtitle ─────────────────────────────────────────────────────

  it('shows clase nombre and fecha in header subtitle', async () => {
    const mockSupabase = createMockSupabase({ progresos: [], alumnos: [] })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 'ses-1',
      claseNombre: 'Violín II',
      fecha: '2026-05-30',
      supabase: mockSupabase,
    })

    const subtitle = document.querySelector('.ssp-subtitle')
    expect(subtitle).toBeTruthy()
    expect(subtitle.textContent).toContain('Violín II')
    expect(subtitle.textContent).toContain('2026-05-30')
  })

  // ── Styles injected only once ─────────────────────────────────────────────

  it('injects styles only once across multiple opens', async () => {
    const mockSupabase = createMockSupabase({ progresos: [], alumnos: [] })

    panel = mod.createSessionSummaryPanel()
    await panel.open({
      sesionId: 's1',
      claseNombre: 'C1',
      fecha: '2026-01-01',
      supabase: mockSupabase,
    })
    expect(document.querySelectorAll('#ssp-styles')).toHaveLength(1)

    panel.close()
    await panel.open({
      sesionId: 's2',
      claseNombre: 'C2',
      fecha: '2026-01-02',
      supabase: mockSupabase,
    })
    expect(document.querySelectorAll('#ssp-styles')).toHaveLength(1)
  })
})
