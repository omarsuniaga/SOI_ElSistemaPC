import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock supabase
const mockEvaluaciones = [
  {
    alumno_id: 's1',
    maestro_indicador_id: 'ind-1',
    nota: 5,
    recovery_status: 'no_aplica',
    recovery_notes: null,
    recovery_grade: null,
  },
  {
    alumno_id: 's1',
    maestro_indicador_id: 'ind-2',
    nota: 4,
    recovery_status: 'no_aplica',
    recovery_notes: null,
    recovery_grade: null,
  },
  {
    alumno_id: 's2',
    maestro_indicador_id: 'ind-1',
    nota: 2, // Deuda pedagógica
    recovery_status: 'pendiente',
    recovery_notes: 'Falta postura',
    recovery_grade: null,
  },
  {
    alumno_id: 's2',
    maestro_indicador_id: 'ind-2',
    nota: 1, // Exonerado por técnica integrada
    recovery_status: 'recuperado',
    recovery_notes: '[EXONERADA] Subsumida por escalas',
    recovery_grade: 3,
  },
]

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === 'evaluacion_indicador') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: mockEvaluaciones, error: null })),
          })),
        }
      }
      return {
        select: vi.fn(() => ({
          in: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          })),
        })),
      }
    }),
  },
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() => Promise.resolve([])),
  getInscripcionesClases: vi.fn(() => Promise.resolve([])),
  getAlumnosPorClaseIds: vi.fn(() =>
    Promise.resolve({
      c1: [
        { id: 's1', nombre_completo: 'Carlos Alumno', instrumento_principal: 'Violín' },
        { id: 's2', nombre_completo: 'María Estudiante', instrumento_principal: 'Violín' },
      ],
    })
  ),
}))

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: () => ({ id: 'm1', nombre: 'Profesor Mozart', user_id: 'u1' }),
  detectarRolMaestro: vi.fn(() => Promise.resolve({ id: 'm1', nombre: 'Profesor Mozart' })),
}))

vi.mock('../../components/IndicadorGradingModal.js', () => ({
  openIndicadorGradingModal: vi.fn(),
}))

describe('planificacionView — Mapa de Calor y Bloqueo Blando', () => {
  let abrirModalMapaDeCalor

  beforeEach(async () => {
    document.body.innerHTML = ''
    const mod = await import('../planificacionView.js')
    abrirModalMapaDeCalor = mod.abrirModalMapaDeCalor
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('exports abrirModalMapaDeCalor function', () => {
    expect(typeof abrirModalMapaDeCalor).toBe('function')
  })

  it('renders heatmap modal with students, indicators, arithmetic average and debts', async () => {
    const mockClase = {
      id: 'c1',
      nombre: 'Violín Nivel 1',
      instrumento: 'Violín',
      route: {
        id: 'r1',
        unidades: [
          {
            id: 'u1',
            orden: 1,
            nombre: 'Postura y Arco',
            objetivos: [
              {
                id: 'obj-1',
                orden: 1,
                nombre: 'Mano Derecha',
                indicadores: [
                  { id: 'ind-1', orden: 1, nombre: 'Agarre de arco' },
                  { id: 'ind-2', orden: 2, nombre: 'Cambio de cuerda' },
                ],
              },
            ],
          },
        ],
      },
    }

    await abrirModalMapaDeCalor(mockClase)

    const modal = document.querySelector('.pm-heatmap-modal')
    expect(modal).not.toBeNull()

    // Title & subtitle
    expect(modal.querySelector('.pm-heatmap-title').textContent).toBe('Violín Nivel 1')
    expect(modal.textContent).toContain('2 estudiantes matriculados')

    // KPIs
    const kpis = modal.querySelectorAll('.pm-hm-kpi')
    expect(kpis.length).toBe(5)

    // Estudiante 1 (s1): 5★ + 4★ = 9 / 2 = 4.5★ (Solvente, 0 deudas)
    // Estudiante 2 (s2): ind-1 = 2★ (deuda), ind-2 = exonerado (efectiva 3★) -> 2 + 3 = 5 / 2 = 2.5★ (1 deuda)
    // Total evaluaciones = 4, Total sum = 14, Promedio General = 14 / 4 = 3.5★
    // Deudas activas = 1 (s2 en ind-1)
    // Solvencia = 1 / 2 = 50%
    expect(modal.textContent).toContain('Deudas Activas')
    expect(modal.textContent).toContain('Solvencia Grupal')
    expect(modal.textContent).toContain('Promedio General')
    expect(modal.textContent).toContain('3.5')

    // Check cells
    // s1 ind-1: Dominado 5★
    expect(modal.querySelector('.pm-hm-cell--dominado').textContent.trim()).toBe('👑 5★')
    // s1 ind-2: Aprobado 4★
    expect(modal.querySelector('.pm-hm-cell--aprobado').textContent.trim()).toBe('⭐ 4★')
    // s2 ind-1: Deuda 2★
    expect(modal.querySelector('.pm-hm-cell--deuda').textContent.trim()).toBe('⚠️ 2★')
    // s2 ind-2: Exonerado
    expect(modal.querySelector('.pm-hm-cell--exonerado').textContent.trim()).toBe('🟣 Exon.')

    // Check individual student metrics in the table
    // s1 Promedio: 4.5 ★, Deudas: 0, Solvente
    // s2 Promedio: 2.5 ★, Deudas: ⚠️ 1, Con Deuda
    expect(modal.textContent).toContain('4.5 ★')
    expect(modal.textContent).toContain('2.5 ★')
    expect(modal.textContent).toContain('✅ Solvente')
    expect(modal.textContent).toContain('⚠️ Con Deuda')
  })

  it('displays the Soft-Lock Unit Solvency Alert when active debts exist in a unit', async () => {
    const mockClase = {
      id: 'c1',
      nombre: 'Violín Nivel 1',
      instrumento: 'Violín',
      route: {
        id: 'r1',
        unidades: [
          {
            id: 'u1',
            orden: 1,
            nombre: 'Postura y Arco',
            objetivos: [
              {
                id: 'obj-1',
                orden: 1,
                nombre: 'Mano Derecha',
                indicadores: [
                  { id: 'ind-1', orden: 1, nombre: 'Agarre de arco' },
                  { id: 'ind-2', orden: 2, nombre: 'Cambio de cuerda' },
                ],
              },
            ],
          },
        ],
      },
    }

    await abrirModalMapaDeCalor(mockClase)

    const alertBanner = document.querySelector('.pm-hm-alert-banner.warning')
    expect(alertBanner).not.toBeNull()
    expect(alertBanner.textContent).toContain('Alerta de Transición Curricular (Bloqueo Blando)')
    expect(alertBanner.textContent).toContain('Regla de Bloqueo Blando')
    expect(alertBanner.textContent).toContain('Postura y Arco')
    expect(alertBanner.textContent).toContain('María')
  })

  it('filters students by name when typing in search input', async () => {
    const mockClase = {
      id: 'c1',
      nombre: 'Violín Nivel 1',
      instrumento: 'Violín',
      route: {
        id: 'r1',
        unidades: [
          {
            id: 'u1',
            orden: 1,
            nombre: 'Postura y Arco',
            objetivos: [
              {
                id: 'obj-1',
                orden: 1,
                nombre: 'Mano Derecha',
                indicadores: [
                  { id: 'ind-1', orden: 1, nombre: 'Agarre de arco' },
                ],
              },
            ],
          },
        ],
      },
    }

    await abrirModalMapaDeCalor(mockClase)

    expect(document.querySelectorAll('.pm-hm-row').length).toBe(2)

    const searchInput = document.querySelector('#pm-hm-search')
    searchInput.value = 'Carlos'
    searchInput.dispatchEvent(new Event('input'))

    const rowsAfter = document.querySelectorAll('.pm-hm-row')
    expect(rowsAfter.length).toBe(1)
    expect(rowsAfter[0].textContent).toContain('Carlos Alumno')
  })

  it('closes modal when clicking close button', async () => {
    const mockClase = {
      id: 'c1',
      nombre: 'Violín Nivel 1',
      instrumento: 'Violín',
      route: {
        id: 'r1',
        unidades: [
          {
            id: 'u1',
            orden: 1,
            nombre: 'Postura y Arco',
            objetivos: [
              {
                id: 'obj-1',
                orden: 1,
                nombre: 'Mano Derecha',
                indicadores: [{ id: 'ind-1', orden: 1, nombre: 'Agarre de arco' }],
              },
            ],
          },
        ],
      },
    }

    await abrirModalMapaDeCalor(mockClase)

    const backdrop = document.querySelector('.pm-heatmap-modal-backdrop')
    expect(backdrop).not.toBeNull()

    const closeBtn = document.querySelector('.pm-heatmap-close')
    closeBtn.click()

    expect(document.querySelector('.pm-heatmap-modal-backdrop')).toBeNull()
  })
})
