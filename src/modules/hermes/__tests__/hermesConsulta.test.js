import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api/tareasApi.js', () => ({
  getConsultaEstado: vi.fn(),
  getProcedimientos: vi.fn(),
  getTareas: vi.fn(),
}))

vi.mock('../../../portal-maestros/services/groqService.js', () => ({
  callGroq: vi.fn(),
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('../../../core/router/router.js', () => ({
  router: {
    navigate: vi.fn(),
  },
}))

import * as tareasApi from '../api/tareasApi.js'
import { callGroq } from '../../../portal-maestros/services/groqService.js'
import { getHermesOperationalContext } from '../api/hermesContextAggregator.js'
import { buildDeterministicResponse, queryHermes } from '../logic/hermesQueryEngine.js'
import { renderHermesConsultaView } from '../views/hermesConsultaView.js'
import { router } from '../../../core/router/router.js'

describe('Hermes Consulta Suite — Executive AI & Operational Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('hermesContextAggregator', () => {
    it('normalizes snapshot, tasks, and procedures into unified context', async () => {
      tareasApi.getConsultaEstado.mockResolvedValue({
        total_procedimientos: 4,
        tareas: { total: 10, pendiente: 2, en_progreso: 2, bloqueada: 1, observada: 0, completada: 5 },
        atencion_inmediata: [
          { id: 't-1', caso_id: 'c-1', titulo: 'Comprar cuerdas', departamento: 'LUT', estado: 'bloqueada' },
        ],
      })
      tareasApi.getProcedimientos.mockResolvedValue([
        { id: 'p-1', titulo_muestra: 'Reinscripción 2026', pct_avance: 60, total: 10, completadas: 6 },
      ])
      tareasApi.getTareas.mockResolvedValue([
        { id: 't-1', departamento: 'LUT', estado: 'bloqueada' },
        { id: 't-2', departamento: 'ADM', estado: 'completada' },
      ])

      const ctx = await getHermesOperationalContext()

      expect(ctx.totalProcedimientos).toBe(4)
      expect(ctx.tareas.total).toBe(10)
      expect(ctx.atencionInmediata).toHaveLength(1)
      expect(ctx.atencionInmediata[0].titulo).toBe('Comprar cuerdas')
      expect(ctx.saludGeneral).toBe('alerta')
      expect(ctx.porDepartamento).toBeDefined()
    })
  })

  describe('hermesQueryEngine', () => {
    const mockContext = {
      totalProcedimientos: 3,
      tareas: { total: 8, pendiente: 2, en_progreso: 1, bloqueada: 1, observada: 0, completada: 4 },
      atencionInmediata: [
        { id: 't-1', caso_id: 'caso-123', titulo: 'Aprobación de presupuesto', departamento: 'FIN', deptoNombre: 'Finanzas', estado: 'bloqueada' },
      ],
      porDepartamento: [
        { codigo: 'FIN', nombre: 'Finanzas y Cobranzas', total: 4, abiertas: 2, pendientes: 1, bloqueadas: 1, completadas: 2, pctAvance: 50 },
        { codigo: 'ADM', nombre: 'Administración', total: 4, abiertas: 1, pendientes: 1, bloqueadas: 0, completadas: 3, pctAvance: 75 },
      ],
      procedimientos: [
        { id: 'proc-1', titulo_muestra: 'Audición de Nuevos Ingresos', pct_avance: 80, completadas: 8, total: 10 },
      ],
    }

    it('generates rich card with deep links for blocked items query', () => {
      const response = buildDeterministicResponse('¿Cuáles son las tareas bloqueadas?', mockContext)
      expect(response).toContain('hermes-card-warning')
      expect(response).toContain('Aprobación de presupuesto')
      expect(response).toContain('data-route="hermes-caso"')
      expect(response).toContain('data-param-id="caso-123"')
    })

    it('generates department-specific mini-dashboard when queried about a department', () => {
      const response = buildDeterministicResponse('¿Cómo está el departamento de finanzas?', mockContext)
      expect(response).toContain('Estado del Departamento: Finanzas y Cobranzas')
      expect(response).toContain('data-route="hermes-tareas"')
      expect(response).toContain('data-param-depto="FIN"')
    })

    it('falls back to deterministic template when LLM call fails', async () => {
      callGroq.mockRejectedValueOnce(new Error('Network error'))
      const response = await queryHermes('¿Cómo va la operación general?', mockContext)
      expect(response).toContain('Resumen Ejecutivo de Operaciones Institucionales')
    })

    it('uses LLM generated response when callGroq succeeds', async () => {
      callGroq.mockResolvedValueOnce('**Diagnóstico:** La operación presenta un avance del 50% con 1 tarea bloqueada en Finanzas.')
      const response = await queryHermes('Dame un diagnóstico rápido', mockContext)
      expect(response).toContain('<strong>Diagnóstico:</strong>')
      expect(response).toContain('Finanzas')
    })
  })

  describe('renderHermesConsultaView (UI Component)', () => {
    it('renders the view with KPI ribbon and responds to click suggestions', async () => {
      tareasApi.getConsultaEstado.mockResolvedValue({
        total_procedimientos: 5,
        tareas: { total: 12, pendiente: 3, en_progreso: 2, bloqueada: 0, observada: 0, completada: 7 },
        atencion_inmediata: [],
      })
      tareasApi.getProcedimientos.mockResolvedValue([])
      tareasApi.getTareas.mockResolvedValue([])

      const container = document.createElement('div')
      document.body.appendChild(container)

      await renderHermesConsultaView(container)

      expect(container.querySelector('.hermes-kpi-ribbon')).toBeTruthy()
      expect(container.querySelector('#hermes-q')).toBeTruthy()

      // Click suggestion chip
      const firstChip = container.querySelector('.hermes-sug-btn')
      expect(firstChip).toBeTruthy()
      firstChip.click()

      await new Promise((resolve) => setTimeout(resolve, 0))

      const chatLog = container.querySelector('#hermes-chat-log')
      expect(chatLog.children.length).toBeGreaterThan(0)
    })

    it('handles deep link clicks in responses by navigating with router', async () => {
      tareasApi.getConsultaEstado.mockResolvedValue({
        total_procedimientos: 1,
        tareas: { total: 1, pendiente: 0, en_progreso: 0, bloqueada: 1, observada: 0, completada: 0 },
        atencion_inmediata: [
          { id: 't-1', caso_id: 'caso-99', titulo: 'Urgente', departamento: 'ADM', estado: 'bloqueada' },
        ],
      })
      tareasApi.getProcedimientos.mockResolvedValue([])
      tareasApi.getTareas.mockResolvedValue([])

      const container = document.createElement('div')
      document.body.appendChild(container)

      await renderHermesConsultaView(container)

      const input = container.querySelector('#hermes-q')
      input.value = 'tareas bloqueadas'
      container.querySelector('#hermes-send').click()

      await new Promise((resolve) => setTimeout(resolve, 0))

      const deepLinkBtn = container.querySelector('.hermes-deep-link[data-route="hermes-caso"]')
      expect(deepLinkBtn).toBeTruthy()

      deepLinkBtn.click()
      expect(router.navigate).toHaveBeenCalledWith('hermes-caso', { id: 'caso-99' })
    })
  })
})
