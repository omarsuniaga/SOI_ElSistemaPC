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
    })),
    getChannels: vi.fn(() => []),
    removeChannel: vi.fn()
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

  it('sanitizes event fields to prevent XSS injection in the activity feed (CDA1)', async () => {
    fetchAdminFeed.mockResolvedValueOnce([
      {
        id: 'xss:1',
        source: 'ausencia',
        sourceId: 'x1',
        priority: 'alta',
        actionable: true,
        estado: 'pendiente',
        icon: 'bi-shield-exclamation',
        iconColor: '#ef4444',
        category: 'ausencia',
        titulo: '<script id="evil-script">window.hacked=true;</script>Charlie',
        subtitulo: '<img src="x" onerror="alert(1)">Subtitulo',
        motivo: '<b onmouseover="alert(2)">Motivo malicioso</b>',
        timestamp: '2026-05-24T10:00:00Z',
        timeAgo: 'hace 1 min',
        maestroInstrumento: '<svg onload="alert(3)">Flauta',
        suplentesSugeridos: [
          { id: 's1', nombre_completo: '<script>evil()</script>John', email: 'john@hack.com' }
        ]
      }
    ])

    await renderAdminNotificacionesView(container)

    // Verify script tags were NOT injected as executable DOM nodes
    expect(container.querySelector('#evil-script')).toBeNull()
    expect(container.querySelector('img[onerror]')).toBeNull()
    expect(container.querySelector('svg[onload]')).toBeNull()
    expect(container.querySelector('b[onmouseover]')).toBeNull()

    // Verify escaped content is present as safe text
    expect(container.innerHTML).toContain('&lt;script id="evil-script"&gt;')
    expect(container.innerHTML).toContain('&lt;img src="x"')
    expect(container.innerHTML).toContain('&lt;b onmouseover="alert(2)"&gt;')
    expect(container.innerHTML).toContain('&lt;svg onload="alert(3)"&gt;')
  })

  it('does not inject inline styles into document.head and uses V9 semantic classes (CDA2)', async () => {
    await renderAdminNotificacionesView(container)

    // Verify _injectStyles style tag is NOT present
    expect(document.getElementById('anv-styles')).toBeNull()

    // Verify header buttons use anv-btn-header class instead of inline styles
    const historialBtn = container.querySelector('#anv-btn-historial')
    const helpBtn = container.querySelector('#anv-btn-help')
    expect(historialBtn.classList.contains('anv-btn-header')).toBe(true)
    expect(helpBtn.classList.contains('anv-btn-header')).toBe(true)
    expect(historialBtn.getAttribute('style')).toBeNull()
    expect(helpBtn.getAttribute('style')).toBeNull()

    // Verify event dot and category chip use data attributes and V9 classes
    const eventEl = container.querySelector('.anv-event')
    const dotEl = eventEl.querySelector('.anv-event-dot')
    const chipEl = eventEl.querySelector('.anv-cat-chip')
    expect(dotEl.dataset.category).toBe('ausencia')
    expect(chipEl.dataset.cat).toBe('ausencia')
    expect(chipEl.getAttribute('style')).toBeNull()
  })
})
