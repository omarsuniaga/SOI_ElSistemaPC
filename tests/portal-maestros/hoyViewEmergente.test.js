import { describe, it, expect, vi, beforeEach } from 'vitest'
import './setup.js'

// ── Mocks globales ───────────────────────────────────────────

vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  },
}))

const mockMaestro = {
  id: 'maestro-test-123',
  user_id: 'user-test-456',
  nombre_completo: 'Maestro Test',
  correo: 'test@test.com',
}

vi.mock('../../src/portal-maestros/auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => mockMaestro),
  STORAGE_KEY: 'portal-maestros:maestro',
}))

vi.mock('../../src/modules/academic-routes/services/academicService.js', () => ({
  academicService: {
    createSnapshotFromPlan: vi.fn().mockResolvedValue({}),
  },
}))

// Mock maestroDataService para los tests de renderHoyView
// Los tests individuales setean .mockResolvedValue() según su escenario
vi.mock('../../src/portal-maestros/services/maestroDataService.js', () => ({
  getEmergentesHoy: vi.fn(),
  getMisClases: vi.fn(),
  getHorariosClases: vi.fn(),
  getSesiones: vi.fn(),
  getInscripcionesClases: vi.fn(),
  getSalones: vi.fn(),
}))

// ── Datos mock ───────────────────────────────────────────────

const mockEmergentes = [
  {
    id: 'eme-111',
    maestro_id: 'maestro-test-123',
    fecha: '2026-05-30',
    hora_inicio: '08:00:00',
    hora_fin: '10:00:00',
    nombre_clase: 'Concierto de Violín',
    motivo: 'eventual',
    contenido: 'Presentación ante padres de familia',
    observaciones: null,
  },
  {
    id: 'eme-222',
    maestro_id: 'maestro-test-123',
    fecha: '2026-05-30',
    hora_inicio: null,
    hora_fin: null,
    nombre_clase: 'Refuerzo de Piano',
    motivo: 'reforzamiento',
    contenido: null,
    observaciones: 'Alumnos con bajo rendimiento',
  },
]

const mockClases = [
  { id: 'clase-1', nombre: 'Violín I', instrumento: 'Violín' },
  { id: 'clase-2', nombre: 'Piano II', instrumento: 'Piano' },
]

const mockHorarios = [
  {
    clase_id: 'clase-1',
    dia: 'lunes',
    hora_inicio: '08:00:00',
    hora_fin: '09:00:00',
    salon_id: null,
  },
  {
    clase_id: 'clase-2',
    dia: 'lunes',
    hora_inicio: '10:00:00',
    hora_fin: '11:00:00',
    salon_id: null,
  },
]

const mockInscripciones = [
  {
    clase_id: 'clase-1',
    alumno_id: 'al1',
    alumnos: { id: 'al1', nombre_completo: 'Alumno 1', instrumento_principal: 'Violín' },
  },
  {
    clase_id: 'clase-1',
    alumno_id: 'al2',
    alumnos: { id: 'al2', nombre_completo: 'Alumno 2', instrumento_principal: 'Violín' },
  },
  {
    clase_id: 'clase-2',
    alumno_id: 'al3',
    alumnos: { id: 'al3', nombre_completo: 'Alumno 3', instrumento_principal: 'Piano' },
  },
]

// ═══════════════════════════════════════════════════════════════
// Tests de getEmergentesHoy — usan la función REAL via importActual
// ═══════════════════════════════════════════════════════════════

describe('Clases Emergentes - getEmergentesHoy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe retornar array vacío si no hay maestroId', async () => {
    const real = await vi.importActual('../../src/portal-maestros/services/maestroDataService.js')
    const result = await real.getEmergentesHoy(null, '2026-05-30')
    expect(result).toEqual([])
  })

  it('debe retornar array vacío si no hay fecha', async () => {
    const real = await vi.importActual('../../src/portal-maestros/services/maestroDataService.js')
    const result = await real.getEmergentesHoy('maestro-test-123', null)
    expect(result).toEqual([])
  })

  it('debe consultar clases_emergentes con los filtros correctos', async () => {
    const { supabase } = await import('../../src/lib/supabaseClient.js')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockEmergentes, error: null }),
    })

    const real = await vi.importActual('../../src/portal-maestros/services/maestroDataService.js')
    const result = await real.getEmergentesHoy('maestro-test-123', '2026-05-30')

    expect(supabase.from).toHaveBeenCalledWith('clases_emergentes')
    expect(result).toEqual(mockEmergentes)
    expect(result.length).toBe(2)
  })

  it('debe retornar array vacío si hay error de DB', async () => {
    const { supabase } = await import('../../src/lib/supabaseClient.js')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    })

    // Usar fecha distinta para evitar cache del test anterior
    const real = await vi.importActual('../../src/portal-maestros/services/maestroDataService.js')
    const result = await real.getEmergentesHoy('maestro-test-123', '2099-01-01')
    expect(result).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════
// Tests de renderHoyView — CON clases emergentes
// ═══════════════════════════════════════════════════════════════

describe('renderHoyView - con clases emergentes', () => {
  let container

  beforeEach(async () => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  it('debe mostrar emergentes en lugar de clases programadas cuando existen', async () => {
    const ds = await import('../../src/portal-maestros/services/maestroDataService.js')
    ds.getEmergentesHoy.mockResolvedValue(mockEmergentes)

    const { renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js')
    await renderHoyView(container)

    // Badge "Emergente" en cada tarjeta
    const badges = container.querySelectorAll('.pm-badge-warning')
    expect(badges.length).toBe(2)

    // Nombres de las clases emergentes
    expect(container.textContent).toContain('Concierto de Violín')
    expect(container.textContent).toContain('Refuerzo de Piano')

    // Motivos
    expect(container.textContent).toContain('eventual')
    expect(container.textContent).toContain('reforzamiento')

    // Subtítulo de reemplazo
    expect(container.textContent).toContain('reemplaza tus clases programadas')

    // data-eme-id
    const cards = container.querySelectorAll('.pm-emergente-card')
    expect(cards.length).toBe(2)
    expect(cards[0].dataset.emeId).toBe('eme-111')
    expect(cards[1].dataset.emeId).toBe('eme-222')

    // Tiene el container de cards
    expect(container.querySelector('.pm-clases-container')).not.toBeNull()
  })

  it('debe mostrar horario cuando existe', async () => {
    const ds = await import('../../src/portal-maestros/services/maestroDataService.js')
    ds.getEmergentesHoy.mockResolvedValue([mockEmergentes[0]])

    const { renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js')
    await renderHoyView(container)

    expect(container.textContent).toContain('08:00')
    expect(container.textContent).toContain('10:00')
  })

  it('debe mostrar "—" cuando no hay horario', async () => {
    const ds = await import('../../src/portal-maestros/services/maestroDataService.js')
    ds.getEmergentesHoy.mockResolvedValue([mockEmergentes[1]])

    const { renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js')
    await renderHoyView(container)

    expect(container.textContent).toContain('–')
  })

  it('debe mostrar el contenido/observaciones', async () => {
    const ds = await import('../../src/portal-maestros/services/maestroDataService.js')
    ds.getEmergentesHoy.mockResolvedValue([mockEmergentes[0]])

    const { renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js')
    await renderHoyView(container)

    expect(container.textContent).toContain('Presentación ante padres de familia')
  })

  it('debe mostrar observaciones como fallback de contenido', async () => {
    const ds = await import('../../src/portal-maestros/services/maestroDataService.js')
    ds.getEmergentesHoy.mockResolvedValue([mockEmergentes[1]])

    const { renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js')
    await renderHoyView(container)

    expect(container.textContent).toContain('Alumnos con bajo rendimiento')
  })

  it('debe navegar a clase-emergente al hacer click', async () => {
    const ds = await import('../../src/portal-maestros/services/maestroDataService.js')
    ds.getEmergentesHoy.mockResolvedValue([mockEmergentes[0]])

    const navigateMock = vi.fn()
    window.router = { navigate: navigateMock }

    const { renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js')
    await renderHoyView(container)

    const card = container.querySelector('.pm-emergente-card')
    expect(card).not.toBeNull()
    card.click()

    expect(navigateMock).toHaveBeenCalled()
    expect(navigateMock.mock.calls[0][0]).toContain('clase-emergente')
    expect(navigateMock.mock.calls[0][0]).toContain('fecha=')

    delete window.router
  })
})

// ═══════════════════════════════════════════════════════════════
// Tests de renderHoyView — SIN clases emergentes
// ═══════════════════════════════════════════════════════════════

describe('renderHoyView - SIN clases emergentes', () => {
  let container

  beforeEach(async () => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  it('debe mostrar clases programadas cuando no hay emergentes', async () => {
    const ds = await import('../../src/portal-maestros/services/maestroDataService.js')
    ds.getEmergentesHoy.mockResolvedValue([])
    ds.getMisClases.mockResolvedValue(mockClases)
    ds.getHorariosClases.mockResolvedValue(mockHorarios)
    ds.getSesiones.mockResolvedValue([])
    ds.getInscripcionesClases.mockResolvedValue(mockInscripciones)
    ds.getSalones.mockResolvedValue([])

    const { renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js')
    await renderHoyView(container)

    expect(container.textContent).toContain('Violín I')
    expect(container.textContent).toContain('Piano II')
    expect(container.querySelector('.pm-badge-warning')).toBeNull()
  })

  it('debe mostrar empty state cuando no hay clases ni emergentes', async () => {
    const ds = await import('../../src/portal-maestros/services/maestroDataService.js')
    ds.getEmergentesHoy.mockResolvedValue([])
    ds.getMisClases.mockResolvedValue([])

    const { renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js')
    await renderHoyView(container)

    expect(container.textContent).toContain('No tienes clases asignadas')
    expect(container.querySelector('.pm-badge-warning')).toBeNull()
  })
})
