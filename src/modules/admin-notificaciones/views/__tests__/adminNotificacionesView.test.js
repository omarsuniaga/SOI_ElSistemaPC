import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { renderAdminNotificacionesView } from '../adminNotificacionesView.js'
import { fetchAdminFeed } from '../../api/adminNotifApi.js'
import { aprobarAusencia } from '../../../admin-aprobacion/api/ausenciaAprobacionApi.js'
import { supabase } from '../../../../lib/supabaseClient.js'

// Mock de la API del feed
vi.mock('../../api/adminNotifApi.js', () => ({
  fetchAdminFeed: vi.fn(),
  fetchAdminPendingCount: vi.fn(() => Promise.resolve(1))
}))

// Mock de la API de aprobación
vi.mock('../../../admin-aprobacion/api/ausenciaAprobacionApi.js', () => ({
  aprobarAusencia: vi.fn(() => Promise.resolve({})),
  rechazarAusencia: vi.fn(() => Promise.resolve({}))
}))

// Mock del cliente Supabase
vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((cb) => {
        if (cb) cb('SUBSCRIBED')
        return {}
      })
    }))
  }
}))

describe('adminNotificacionesView Interface & Interactions', () => {
  let container
  const mockEvents = [
    {
      id: 'ausencia:a1',
      source: 'ausencia',
      sourceId: 'a1',
      priority: 'alta',
      actionable: true,
      estado: 'pendiente',
      icon: 'bi-calendar-x-fill',
      iconColor: '#ef4444',
      category: 'ausencia',
      titulo: 'Charlie Parker solicitó ausencia médica',
      subtitulo: '24 May 2026',
      motivo: 'Fiebre alta',
      timestamp: '2026-05-24T10:00:00Z',
      timeAgo: 'hace 10 min',
      actionRoute: 'admin-ausencias',
      actionLabel: 'Revisar',
      maestroInstrumento: 'Saxofón',
      suplentesSugeridos: [
        { id: 'm2', nombre_completo: 'John Coltrane', email: 'john@jazz.com' }
      ]
    },
    {
      id: 'compliance:m2',
      source: 'sesion',
      sourceId: 'm2',
      priority: 'media',
      actionable: false,
      estado: 'info',
      icon: 'bi-clipboard-x-fill',
      iconColor: '#f59e0b',
      category: 'compliance',
      titulo: 'Miles Davis tiene 2 clases sin asistencia',
      subtitulo: 'Última: 22 May 2026 · últimos 7 días',
      motivo: '',
      timestamp: '2026-05-22T12:00:00Z',
      timeAgo: 'hace 2d',
      actionRoute: null,
      actionLabel: null
    },
    {
      id: 'riesgo-alumno-ausencias:s1',
      source: 'riesgo',
      sourceId: 's1',
      priority: 'alta',
      actionable: false,
      estado: 'info',
      icon: 'bi-exclamation-triangle-fill',
      iconColor: '#ef4444',
      category: 'compliance',
      titulo: 'Riesgo de Deserción: Jimi Hendrix',
      subtitulo: 'Acumula 3 inasistencias consecutivas en los últimos 30 días.',
      motivo: 'Acción recomendada: Contactar de urgencia al tutor legal o revisar ficha médica.',
      timestamp: '2026-05-24T12:00:00Z',
      timeAgo: 'ahora mismo',
      actionRoute: 'admin-alumnos',
      actionLabel: 'Ver Ficha'
    }
  ]

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
    vi.spyOn(window, 'dispatchEvent')
    fetchAdminFeed.mockResolvedValue(mockEvents)
  })

  afterEach(() => {
    container.remove()
  })

  it('should render the activity center shell with all proactive widgets and search bar', async () => {
    await renderAdminNotificacionesView(container)

    expect(container.textContent).toContain('Centro de Actividad')
    expect(container.textContent).toContain('Gobernanza escolar proactiva')

    // Verificar widgets KPIs
    expect(container.querySelector('#kpi-todo').textContent).toBe('3')
    expect(container.querySelector('#kpi-criticas').textContent).toBe('2') // Charlie Parker + Jimi Hendrix (altas)
    expect(container.querySelector('#kpi-compliance').textContent).toBe('2') // Miles Davis + Jimi Hendrix

    // Verificar buscador e input
    expect(container.querySelector('#anv-search-bar')).toBeDefined()
  })

  it('should render recommended substitutes for pending absence card', async () => {
    await renderAdminNotificacionesView(container)

    expect(container.textContent).toContain('Suplentes Recomendados (Saxofón)')
    expect(container.textContent).toContain('John Coltrane')
    expect(container.querySelector('[data-action="notify-sub"]')).toBeDefined()
  })

  it('should allow proposing a substitute and trigger toast notifications', async () => {
    await renderAdminNotificacionesView(container)

    const proposeBtn = container.querySelector('[data-action="notify-sub"]')
    proposeBtn.click()

    expect(proposeBtn.disabled).toBe(true)
    expect(proposeBtn.textContent).toContain('Propuesto')
    expect(window.dispatchEvent).toHaveBeenCalled()
  })

  it('should dynamically filter hot-memory timeline when typing in search input', async () => {
    await renderAdminNotificacionesView(container)

    const searchInput = container.querySelector('#anv-search-bar')
    expect(container.querySelectorAll('.anv-event').length).toBe(3)

    // Filtrar por "Parker"
    searchInput.value = 'Parker'
    searchInput.dispatchEvent(new Event('input'))

    expect(container.querySelectorAll('.anv-event').length).toBe(1)
    expect(container.textContent).toContain('Charlie Parker')
    expect(container.textContent).not.toContain('Miles Davis')
  })

  it('should perform in-place atomic transitions when approving absence inline', async () => {
    await renderAdminNotificacionesView(container)

    const approveBtn = container.querySelector('.anv-btn-approve')
    await approveBtn.click()

    // Llama al endpoint de Supabase
    expect(aprobarAusencia).toHaveBeenCalledWith('a1', '')

    // Transiciona in-place a estado aprobada
    expect(container.querySelector('.anv-estado-chip').textContent).toContain('Aprobada')
    
    // Las acciones inline de aprobación/rechazo desaparecen
    expect(container.querySelector('.anv-btn-approve')).toBeNull()
    expect(container.querySelector('.anv-btn-reject')).toBeNull()
  })

  it('CDA1 · escapa el contenido del feed — un payload en título/motivo/suplente NO se ejecuta como HTML', async () => {
    const XSS = '<img src=x onerror="window.__xss=1">'
    fetchAdminFeed.mockResolvedValue([
      {
        id: 'ausencia:evil',
        source: 'ausencia',
        sourceId: 'evil',
        priority: 'alta',
        actionable: true,
        estado: 'pendiente',
        icon: 'bi-calendar-x-fill',
        iconColor: '#ef4444',
        category: 'ausencia',
        titulo: `Riesgo ${XSS}`,
        subtitulo: `Sub ${XSS}`,
        motivo: `Motivo ${XSS}`,
        timestamp: '2026-05-24T10:00:00Z',
        timeAgo: 'hace 1 min',
        maestroInstrumento: `Sax ${XSS}`,
        suplentesSugeridos: [
          { id: 'm9', nombre_completo: `Nombre ${XSS}`, email: 'a@b.com' },
        ],
      },
    ])
    delete window.__xss

    await renderAdminNotificacionesView(container)

    // el payload no creó un <img> real ni disparó el handler
    expect(window.__xss).toBeUndefined()
    expect(container.querySelector('img[onerror]')).toBeNull()
    // pero el texto sí se ve (escapado)
    expect(container.querySelector('.anv-event-titulo').textContent).toContain('<img src=x onerror=')
    expect(container.querySelector('.anv-suplente-name').textContent).toContain('<img')
  })
})
