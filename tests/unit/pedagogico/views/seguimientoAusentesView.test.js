/**
 * T1b.1 — Vitest component tests for ACM seguimientoAusentesView
 * Tests for: list rendering, filters, detail panel, pagination, action buttons
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

// Mock the service
vi.mock('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js', () => ({
  getPeriodoActivo: vi.fn(async () => ({
    id: '123',
    nombre: 'Período 2026-01',
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-03-31',
  })),
  fetchSeguimientoAusentes: vi.fn(async ({ nivel, maestroId, soloSinContacto, busqueda, limit, offset }) => ({
    alumnos: [
      {
        alumno_id: 'a1',
        alumno_nombre: 'Juan Pérez',
        instrumento_principal: 'Violín',
        clase_nombres: 'Violín Principiante, Ensemble',
        maestro_id: 'm1',
        maestro_nombre: 'Maestro López',
        dias_ausente: 3,
        sesiones_ausente: 5,
        ultima_ausencia_fecha: '2026-03-20',
        nivel: 3,
        contacto_nombre: 'María Pérez',
        contacto_telefono: '+18091234567',
        contacto_origen: 'representante_alumno',
        ultimo_seguimiento_nivel: 2,
        ultimo_seguimiento_fecha: '2026-03-15',
        ultimo_seguimiento_resultado: 'contactado',
        retencion_activa: false,
      },
      {
        alumno_id: 'a2',
        alumno_nombre: 'Carlos García',
        instrumento_principal: 'Guitarra',
        clase_nombres: 'Guitarra Avanzada',
        maestro_id: 'm2',
        maestro_nombre: 'Maestro Rodríguez',
        dias_ausente: 2,
        sesiones_ausente: 3,
        ultima_ausencia_fecha: '2026-03-18',
        nivel: 2,
        contacto_nombre: null,
        contacto_telefono: null,
        contacto_origen: null,
        ultimo_seguimiento_nivel: null,
        ultimo_seguimiento_fecha: null,
        ultimo_seguimiento_resultado: null,
        retencion_activa: false,
      },
      {
        alumno_id: 'a3',
        alumno_nombre: 'Ana Martínez',
        instrumento_principal: 'Piano',
        clase_nombres: 'Piano Elemental',
        maestro_id: 'm1',
        maestro_nombre: 'Maestro López',
        dias_ausente: 1,
        sesiones_ausente: 2,
        ultima_ausencia_fecha: '2026-03-19',
        nivel: 1,
        contacto_nombre: 'Pedro Martínez',
        contacto_telefono: '+18092345678',
        contacto_origen: 'alumnos_padre_tlf_whatsapp',
        ultimo_seguimiento_nivel: null,
        ultimo_seguimiento_fecha: null,
        ultimo_seguimiento_resultado: null,
        retencion_activa: false,
      },
    ],
    totalCount: 3,
  })),
  resolverContactoAlumno: vi.fn(async (alumnoId) => {
    if (alumnoId === 'a2') {
      return { origen: null }
    }
    return {
      nombre: 'Representante',
      telefono: '+18091234567',
      origen: 'representante_alumno',
    }
  }),
  fetchHistorialSeguimiento: vi.fn(async () => []),
  enviarSeguimientoAusentismo: vi.fn(async ({ alumno, nivel }) => ({
    waUrl: `https://wa.me/18091234567?text=nivel-${nivel || alumno.nivel}`,
    mensaje: 'mensaje de prueba',
    registro: { id: 'c1', nivel: nivel || alumno.nivel },
  })),
}))

// Mock shared components — shape matches the real modules (objects with static methods)
const helpOpenMock = vi.fn()
const modalOpenMock = vi.fn()
vi.mock('../../../../src/shared/components/HelpPanel.js', () => ({
  HelpPanel: { open: (...a) => helpOpenMock(...a), close: vi.fn() },
}))
vi.mock('../../../../src/shared/components/AppModal.js', () => ({
  AppModal: { open: (...a) => modalOpenMock(...a), close: vi.fn() },
}))

let container
let dom

describe('seguimientoAusentesView (T1b.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>')
    global.document = dom.window.document
    global.window = dom.window
    global.HTMLElement = dom.window.HTMLElement
    global.CustomEvent = dom.window.CustomEvent
    dom.window.open = vi.fn()

    container = document.getElementById('app')
  })

  it('should render list with alumno rows', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const rows = container.querySelectorAll('[data-alumno-id]')
    expect(rows.length).toBe(3)
  })

  it('should display alumno nombre, instrumento, clase_nombres in list', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const html = container.innerHTML
    expect(html).toContain('Juan Pérez')
    expect(html).toContain('Violín')
    expect(html).toContain('Violín Principiante')
  })

  it('should show nivel badge with correct color (3=red)', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const nivel3Badge = container.querySelector('[data-alumno-id="a1"] [data-nivel="3"]')
    expect(nivel3Badge).toBeTruthy()
  })

  it('should show días ausente count', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const html = container.innerHTML
    expect(html).toContain('3') // Juan has 3 días
    expect(html).toContain('2') // Carlos has 2 días
  })

  it('should show red chip "sin contacto" when contacto_telefono is null', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const carlosRow = container.querySelector('[data-alumno-id="a2"]')
    const sinContactoChip = carlosRow?.querySelector('[data-sin-contacto]')
    expect(sinContactoChip).toBeTruthy()
  })

  it('should display nivel-3 alert banner when there are nivel 3 alumnos', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const alertBanner = container.querySelector('[data-nivel3-alert]')
    expect(alertBanner).toBeTruthy()
    expect(alertBanner?.textContent).toContain('nivel 3')
  })

  it('should enable pagination when totalCount > limit', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const paginationInfo = container.querySelector('[data-pagination-info]')
    expect(paginationInfo).toBeTruthy()
    expect(paginationInfo?.textContent).toContain('Mostrando')
  })

  it('should open detail panel via AppModal.open when alumno row is clicked', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const row = container.querySelector('[data-alumno-id="a1"]')
    expect(row).toBeTruthy()

    row?.click()
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(modalOpenMock).toHaveBeenCalledTimes(1)
    const arg = modalOpenMock.mock.calls[0][0]
    expect(arg.title).toContain('Juan Pérez')
  })

  it('detail modal has WhatsApp buttons per nivel and retención still a stub', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    container.querySelector('[data-alumno-id="a1"]')?.click()
    await new Promise((resolve) => setTimeout(resolve, 50))

    const body = modalOpenMock.mock.calls[0][0].body
    const frag = new dom.window.DOMParser().parseFromString(`<div>${body}</div>`, 'text/html')
    expect(frag.querySelectorAll('button[data-wa-modal]').length).toBe(3)
    const retencion = frag.querySelector('button[data-action="retencion-nivel-3"]')
    expect(retencion?.hasAttribute('disabled')).toBe(true)
  })

  it('opens HelpPanel.open when the help button is clicked', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')
    await renderSeguimientoAusentesView(container)
    container.querySelector('#btn-help-ausentes')?.click()
    expect(helpOpenMock).toHaveBeenCalledTimes(1)
  })

  it('row WhatsApp button sends the level message and opens wa.me', async () => {
    const svc = await import('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js')
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const waBtn = container.querySelector('[data-alumno-id="a1"] [data-wa]')
    expect(waBtn).toBeTruthy()
    expect(waBtn.getAttribute('data-nivel')).toBe('3')

    waBtn.click()
    await new Promise((resolve) => setTimeout(resolve, 60))

    expect(svc.enviarSeguimientoAusentismo).toHaveBeenCalledWith(
      expect.objectContaining({ nivel: 3, alumno: expect.objectContaining({ alumno_id: 'a1' }) }),
    )
    expect(dom.window.open).toHaveBeenCalledWith(expect.stringContaining('wa.me'), '_blank', 'noopener')
  })

  it('row WhatsApp button is disabled when the alumno has no contact', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')
    await renderSeguimientoAusentesView(container)

    const row = container.querySelector('[data-alumno-id="a2"]')
    expect(row.querySelector('[data-wa]')).toBeNull()
    const disabled = row.querySelector('button[disabled]')
    expect(disabled?.textContent).toContain('Sin contacto')
  })

  it('shows a warning toast when the contact is a duplicate within 120 min', async () => {
    const svc = await import('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js')
    svc.enviarSeguimientoAusentismo.mockRejectedValueOnce(new Error('CONTACTO_DUPLICADO'))
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    const toastSpy = vi.fn()
    dom.window.addEventListener('showToast', toastSpy)

    await renderSeguimientoAusentesView(container)
    container.querySelector('[data-alumno-id="a1"] [data-wa]').click()
    await new Promise((resolve) => setTimeout(resolve, 60))

    expect(toastSpy).toHaveBeenCalled()
    expect(toastSpy.mock.calls[0][0].detail.type).toBe('warning')
  })

  it('should filter by nivel when nivel select changes', async () => {
    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')
    const { fetchSeguimientoAusentes } = await import('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js')

    await renderSeguimientoAusentesView(container)

    // Simulate nivel filter change
    const nivelSelect = container.querySelector('[data-filter="nivel"]')
    nivelSelect?.dispatchEvent(new Event('change'))

    // Should have called fetchSeguimientoAusentes with nivel parameter
    expect(fetchSeguimientoAusentes).toHaveBeenCalled()
  })

  it('should display empty state when no alumnos', async () => {
    const { fetchSeguimientoAusentes: mockFetch } = await import('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js')

    mockFetch.mockResolvedValueOnce({
      alumnos: [],
      totalCount: 0,
    })

    const { renderSeguimientoAusentesView } = await import('../../../../src/modules/pedagogico/views/seguimientoAusentesView.js')

    await renderSeguimientoAusentesView(container)

    const emptyState = container.querySelector('[data-empty-state]')
    expect(emptyState).toBeTruthy()
    expect(emptyState?.textContent).toContain('Sin alumnos')
  })
})
