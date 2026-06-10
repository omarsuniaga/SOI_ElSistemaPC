import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderPerfilAlumnoView } from '../perfilAlumnoView.js'

// ─── Module mocks ────────────────────────────────────────────────────────────

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

const mockRouter = vi.hoisted(() => ({ navigate: vi.fn() }))
vi.mock('../../../../core/router/router.js', () => ({
  router: mockRouter,
}))

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn() },
}))

vi.mock('../../services/perfilConocimientoApi.js', () => ({
  getPerfil: vi.fn(),
  getPerfilSummary: vi.fn(),
  confirmarPropuesta: vi.fn(),
  descartarPropuesta: vi.fn(),
  getPerfilHistorial: vi.fn(),
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

import { supabase } from '../../../../lib/supabaseClient.js'
import * as perfilApi from '../../services/perfilConocimientoApi.js'

function mockChain(data) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    single: vi.fn(() => chain),
    order: vi.fn().mockResolvedValue(data),
    then: vi.fn((onFulfilled) => Promise.resolve(data).then(onFulfilled)),
  }
  return chain
}

const FAKE_ALUMNO = {
  id: 'alumno-1',
  nombre_completo: 'Carlos Méndez',
  instrumento_principal: 'Guitarra',
  nivel_actual: '4',
}

const FAKE_PERFIL_DATA = [
  {
    id: 'a1',
    alumno_id: 'alumno-1',
    dimension: 'habilidad',
    item: 'Escalas mayores',
    estado: 'confirmado',
    madurez: 3,
    confianza: 1.0,
    origen_obs_id: null,
    evidencia_texto: null,
    creado_por: 'dsl',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'a2',
    alumno_id: 'alumno-1',
    dimension: 'repertorio',
    item: 'Pieza clásica',
    estado: 'confirmado',
    madurez: 2,
    confianza: 0.9,
    origen_obs_id: null,
    evidencia_texto: null,
    creado_por: 'dsl',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'a3',
    alumno_id: 'alumno-1',
    dimension: 'problema',
    item: 'Falta de precisión',
    estado: 'propuesto',
    madurez: 1,
    confianza: 0.7,
    origen_obs_id: 'obs-1',
    evidencia_texto: 'Observado en clase',
    creado_por: 'llm',
    created_at: '2026-01-02',
    updated_at: '2026-01-02',
  },
]

const FAKE_GROUPED = {
  habilidad: FAKE_PERFIL_DATA.filter((a) => a.dimension === 'habilidad'),
  repertorio: FAKE_PERFIL_DATA.filter((a) => a.dimension === 'repertorio'),
  problema: FAKE_PERFIL_DATA.filter((a) => a.dimension === 'problema'),
}

const FAKE_SUMMARY = {
  total: 3,
  confirmados: 2,
  propuestos: 1,
  dimensiones: ['habilidad', 'repertorio', 'problema'],
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('perfilAlumnoView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    container?.remove()
  })

  it('shows warning when no alumnoId provided', async () => {
    await renderPerfilAlumnoView(container, {})
    expect(container.textContent).toContain('No se especificó alumno')
  })

  it('renders skeleton on initial load', async () => {
    // Create a mock chain that hangs (never resolves) so skeleton stays visible
    function hangChain() {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        single: vi.fn(() => chain),
        then: vi.fn(() => chain),
      }
      return chain
    }
    supabase.from.mockReturnValue(hangChain())
    renderPerfilAlumnoView(container, { alumnoId: 'alumno-1' })
    expect(container.querySelector('.spinner-border')).toBeTruthy()
  })

  it('renders alumno header with name, instrument and level', async () => {
    supabase.from.mockReturnValue(mockChain({ data: FAKE_ALUMNO, error: null }))
    perfilApi.getPerfil.mockResolvedValue({ data: FAKE_PERFIL_DATA, grouped: FAKE_GROUPED })
    perfilApi.getPerfilSummary.mockResolvedValue(FAKE_SUMMARY)

    await renderPerfilAlumnoView(container, { alumnoId: 'alumno-1' })
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Carlos Méndez')
    expect(container.textContent).toContain('Guitarra')
    expect(container.textContent).toContain('Nivel 4')
  })

  it('renders summary stats', async () => {
    supabase.from.mockReturnValue(mockChain({ data: FAKE_ALUMNO, error: null }))
    perfilApi.getPerfil.mockResolvedValue({ data: FAKE_PERFIL_DATA, grouped: FAKE_GROUPED })
    perfilApi.getPerfilSummary.mockResolvedValue(FAKE_SUMMARY)

    await renderPerfilAlumnoView(container, { alumnoId: 'alumno-1' })
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('3')
    expect(container.textContent).toContain('2')
    expect(container.textContent).toContain('1')
    expect(container.textContent).toContain('aserciones')
    expect(container.textContent).toContain('confirmadas')
    expect(container.textContent).toContain('propuestas')
  })

  it('renders dimension cards for each dimension', async () => {
    supabase.from.mockReturnValue(mockChain({ data: FAKE_ALUMNO, error: null }))
    perfilApi.getPerfil.mockResolvedValue({ data: FAKE_PERFIL_DATA, grouped: FAKE_GROUPED })
    perfilApi.getPerfilSummary.mockResolvedValue(FAKE_SUMMARY)

    await renderPerfilAlumnoView(container, { alumnoId: 'alumno-1' })
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Habilidades')
    expect(container.textContent).toContain('Repertorio')
    expect(container.textContent).toContain('Problemas')
    expect(container.textContent).toContain('Escalas mayores')
    expect(container.textContent).toContain('Pieza clásica')
  })

  it('shows pending proposals alert when propuesto assertions exist', async () => {
    supabase.from.mockReturnValue(mockChain({ data: FAKE_ALUMNO, error: null }))
    perfilApi.getPerfil.mockResolvedValue({ data: FAKE_PERFIL_DATA, grouped: FAKE_GROUPED })
    perfilApi.getPerfilSummary.mockResolvedValue(FAKE_SUMMARY)

    await renderPerfilAlumnoView(container, { alumnoId: 'alumno-1' })
    await new Promise((resolve) => setTimeout(resolve, 100))

    // There's 1 propuesta pending
    expect(container.textContent).toContain('propuesta pendiente')
    expect(container.querySelector('#pf-scroll-pending')).toBeTruthy()
  })

  it('shows empty state when no perfil data exists', async () => {
    supabase.from.mockReturnValue(mockChain({ data: FAKE_ALUMNO, error: null }))
    perfilApi.getPerfil.mockResolvedValue({ data: [], grouped: {} })
    perfilApi.getPerfilSummary.mockResolvedValue({
      total: 0,
      confirmados: 0,
      propuestos: 0,
      dimensiones: [],
    })

    await renderPerfilAlumnoView(container, { alumnoId: 'alumno-1' })
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('aún no tiene perfil de conocimiento')
  })

  it('renders error state when API throws', async () => {
    supabase.from.mockImplementation(() => {
      throw new Error('Failed to fetch')
    })

    await renderPerfilAlumnoView(container, { alumnoId: 'alumno-1' })
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Error al cargar el perfil')
    expect(container.textContent).toContain('Failed to fetch')
  })
})
