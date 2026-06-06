import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────────
const mockSesiones = [
  {
    id: 's_001',
    clase_id: 'clase_001',
    maestro_id: 'maestro_001',
    fecha: '2026-05-12',
    hora_inicio: '16:00',
    hora_fin: '17:00',
    tema: 'Vibrato en primera posición',
    contenido: 'Introducción al vibrato de muñeca.',
    tipo: 'regular',
    asistencia: { presentes: 7, ausentes: 2, justificados: 1 },
  },
  {
    id: 's_002',
    clase_id: 'clase_002',
    maestro_id: 'maestro_001',
    fecha: '2026-05-14',
    hora_inicio: '17:00',
    hora_fin: '18:00',
    tema: 'Lectura rítmica',
    contenido: 'Trabajo de semicorcheas y tresillos.',
    tipo: 'regular',
    asistencia: { presentes: 5, ausentes: 2, justificados: 0 },
  },
  {
    id: 's_003',
    clase_id: 'clase_001',
    maestro_id: 'maestro_001',
    fecha: '2026-05-19',
    hora_inicio: '16:00',
    hora_fin: '17:00',
    tema: 'Cambio de posición',
    contenido: 'Técnica de deslizamiento.',
    tipo: 'regular',
    asistencia: null,
  },
  {
    id: 's_004',
    clase_id: 'clase_002',
    maestro_id: 'maestro_001',
    fecha: '2026-05-20',
    tema: 'Sin contenido',
    // contenido vacío — debe ser filtrado por soloConContenido
    contenido: '',
    tipo: 'regular',
  },
  {
    id: 's_005',
    clase_id: 'clase_002',
    maestro_id: 'maestro_001',
    fecha: '2026-05-21',
    tema: 'Sin contenido null',
    contenido: null,
    tipo: 'regular',
  },
]

const mockClases = [
  { id: 'clase_001', nombre: 'Violín I', instrumento: 'Violín' },
  { id: 'clase_002', nombre: 'Piano Básico', instrumento: 'Piano' },
]

const mockPlanificaciones = [
  { id: 'plan_001', clase_id: 'clase_001', tema: 'Plan Violín', estado: 'planificado' },
]

const mockPlanificacionHook = {
  getSesionesConEstadoPlanificacion: vi.fn((sesiones, planes) =>
    sesiones.map((s) => {
      const planAsociado = planes.find((p) => p.clase_id === s.clase_id) || null
      return {
        ...s,
        tiene_plan: planAsociado !== null,
        plan_asociado: planAsociado,
      }
    }),
  ),
}

// Mock API modules
vi.mock('../api/sesionesApi.js', () => ({
  obtenerSesiones: vi.fn(async ({ maestro_id, soloConContenido } = {}) => {
    let result = mockSesiones.filter((s) => s.maestro_id === maestro_id)
    if (soloConContenido) {
      result = result.filter((s) => s.contenido && s.contenido.trim() !== '')
    }
    return result
  }),
}))

vi.mock('../api/planificacionAdapter.js', () => ({
  obtenerClases: vi.fn(async () => mockClases),
}))

vi.mock('../hooks/usePlanificacion.js', () => ({
  usePlanificacion: vi.fn(() => mockPlanificacionHook),
}))

// ── Helpers ──────────────────────────────────────────────────────────
async function flushPromises(ms = 200) {
  await new Promise((r) => setTimeout(r, ms))
}

// ── Tests ────────────────────────────────────────────────────────────
describe('historialContenidosPanel', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.resetModules()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('should render loading state initially', async () => {
    const { renderHistorialContenidosPanel } =
      await import('../components/historialContenidosPanel.js')

    renderHistorialContenidosPanel(container, {
      maestroId: 'maestro_001',
      planificaciones: mockPlanificaciones,
    })

    expect(container.querySelector('.spinner-border')).toBeTruthy()
  })

  it('should render panel with sessions after loading', async () => {
    const { renderHistorialContenidosPanel } =
      await import('../components/historialContenidosPanel.js')

    renderHistorialContenidosPanel(container, {
      maestroId: 'maestro_001',
      planificaciones: mockPlanificaciones,
    })

    await flushPromises()

    // Stats bar
    expect(container.querySelector('.historial-stats')).toBeTruthy()

    // Timeline
    const timeline = container.querySelector('#historial-timeline')
    expect(timeline).toBeTruthy()

    // Should have 3 sessions with contenido (the 2 without content are filtered out)
    const cards = container.querySelectorAll('.historial-sesion-card')
    expect(cards.length).toBe(3)

    // First card (by date desc) should be "Cambio de posición"
    const firstCard = cards[0]
    expect(firstCard.textContent).toContain('Cambio de posición')
  })

  it('should show stats with correct counts', async () => {
    const { renderHistorialContenidosPanel } =
      await import('../components/historialContenidosPanel.js')

    renderHistorialContenidosPanel(container, {
      maestroId: 'maestro_001',
      planificaciones: mockPlanificaciones,
    })

    await flushPromises()

    const statValues = container.querySelectorAll('.historial-stat-value')
    expect(statValues.length).toBe(3)

    // Total: 3 (sessions with contenido)
    expect(statValues[0].textContent).toBe('3')
    // Sin planificar: only s_002 (clase_002) has no plan
    expect(statValues[1].textContent).toBe('1')
    // Planificadas: s_001 + s_003 (both clase_001) have a plan
    expect(statValues[2].textContent).toBe('2')
  })

  it('should filter sessions by "solo sin planificar" toggle', async () => {
    const { renderHistorialContenidosPanel } =
      await import('../components/historialContenidosPanel.js')

    renderHistorialContenidosPanel(container, {
      maestroId: 'maestro_001',
      planificaciones: mockPlanificaciones,
    })

    await flushPromises()

    // Toggle the checkbox
    const checkbox = container.querySelector('#historial-toggle-sin-plan input')
    expect(checkbox).toBeTruthy()
    checkbox.checked = true
    checkbox.dispatchEvent(new Event('change'))

    await flushPromises()

    // Should only show unplanned sessions (1 from clase_002 — s_002)
    const cards = container.querySelectorAll('.historial-sesion-card')
    expect(cards.length).toBe(1)

    // All should have the "unplanned" accent class
    cards.forEach((card) => {
      expect(card.classList.contains('historial-card--unplanned')).toBe(true)
    })
  })

  it('should dispatch planificacion:focusPlan event on "Ver Plan" click', async () => {
    const { renderHistorialContenidosPanel } =
      await import('../components/historialContenidosPanel.js')

    renderHistorialContenidosPanel(container, {
      maestroId: 'maestro_001',
      planificaciones: mockPlanificaciones,
    })

    await flushPromises()

    // Find a "Ver Plan" button (only for sessions with plan = clase_001)
    const verPlanBtn = container.querySelector('button[data-action="ver-plan"]')
    expect(verPlanBtn).toBeTruthy()

    // Listen for the event
    let receivedDetail = null
    const handler = vi.fn((e) => {
      receivedDetail = e.detail
    })
    document.addEventListener('planificacion:focusPlan', handler)

    verPlanBtn.click()
    await flushPromises()

    expect(handler).toHaveBeenCalledTimes(1)
    expect(receivedDetail.planId).toBe('plan_001')

    document.removeEventListener('planificacion:focusPlan', handler)
  })

  it('should call onCrearPlan with prefill on "Agregar a Plan" click', async () => {
    const onCrearPlan = vi.fn()
    const { renderHistorialContenidosPanel } =
      await import('../components/historialContenidosPanel.js')

    renderHistorialContenidosPanel(container, {
      maestroId: 'maestro_001',
      planificaciones: mockPlanificaciones,
      onCrearPlan,
    })

    await flushPromises()

    // Find first "Agregar a Plan" button (unplanned session)
    const promoverBtn = container.querySelector('button[data-action="promover"]')
    expect(promoverBtn).toBeTruthy()

    promoverBtn.click()
    await flushPromises()

    expect(onCrearPlan).toHaveBeenCalledTimes(1)

    const prefill = onCrearPlan.mock.calls[0][0]
    expect(prefill).toHaveProperty('tema')
    expect(prefill).toHaveProperty('clase_id')
    expect(prefill).toHaveProperty('contenido')
    expect(prefill).toHaveProperty('fecha_inicio')
  })

  it('should render error state when API fails', async () => {
    // Make obtenerSesiones throw
    const sesionesApi = await import('../api/sesionesApi.js')
    sesionesApi.obtenerSesiones.mockRejectedValueOnce(new Error('Network error'))

    const { renderHistorialContenidosPanel } =
      await import('../components/historialContenidosPanel.js')

    renderHistorialContenidosPanel(container, {
      maestroId: 'maestro_001',
      planificaciones: mockPlanificaciones,
    })

    await flushPromises()

    expect(container.querySelector('.alert-warning')).toBeTruthy()
    expect(container.textContent).toContain('Error al cargar historial')
    expect(container.textContent).toContain('Network error')
  })
})
