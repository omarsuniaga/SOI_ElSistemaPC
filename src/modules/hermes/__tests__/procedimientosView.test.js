/**
 * procedimientosView.test.js — Suite de Pruebas para Procedimientos y Detalle de Caso Hermes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockState } = vi.hoisted(() => ({
  mockState: {
    procedimientos: [],
    contracts: [],
    caseDetail: null,
  },
}))

vi.mock('../api/tareasApi.js', () => ({
  getProcedimientos: vi.fn(() => Promise.resolve(mockState.procedimientos)),
  getProcessContracts: vi.fn(() => Promise.resolve(mockState.contracts)),
  getProcessCaseDetail: vi.fn(() => Promise.resolve(mockState.caseDetail)),
  startProcessCase: vi.fn(() => Promise.resolve({ id: 'case-new-001', success: true })),
  reportarAlumnoRiesgo: vi.fn(() => Promise.resolve({ caso_id: 'case-riesgo-001' })),
  closeProcessCase: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('../../../core/router/router.js', () => ({
  router: {
    navigate: vi.fn(),
  },
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('../../auth/hooks/useAuth.js', () => ({
  useAuth: vi.fn(() => ({
    getUsuario: () => ({ id: 'usr-admin-1', nombre: 'Director Test' }),
  })),
}))

import * as tareasApi from '../api/tareasApi.js'
import { renderProcedimientosView } from '../views/procedimientosView.js'
import { renderCasoDetalleView } from '../views/casoDetalleView.js'
import { openIniciarCasoModal } from '../components/iniciarCasoModal.js'
import { openAlumnoRiesgoModal } from '../components/alumnoRiesgoModal.js'
import { openCerrarCasoModal } from '../components/cerrarCasoModal.js'
import { router } from '../../../core/router/router.js'

describe('Hermes Procedimientos & Process Backbone Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    mockState.procedimientos = [
      {
        id: 'proc-1',
        process_code: 'PROC-INSCRIPCION',
        correlation_id: 'corr-001',
        titulo_muestra: 'Reinscripción 2026-II',
        pct_avance: 75,
        total: 4,
        completadas: 3,
        bloqueadas: 0,
        observadas: 0,
        prioridad_max: 'alta',
        departamentos: ['ADM', 'FIN'],
      },
      {
        id: 'proc-2',
        process_code: 'PROC-LUTERIA',
        correlation_id: 'corr-002',
        titulo_muestra: 'Mantenimiento de Violoncellos',
        pct_avance: 40,
        total: 5,
        completadas: 2,
        bloqueadas: 1,
        observadas: 0,
        prioridad_max: 'critica',
        departamentos: ['LUT'],
      },
    ]

    mockState.contracts = [
      {
        process_code: 'PROC-INSCRIPCION',
        process_name: 'Reinscripción de Período',
        department_owner: 'ADM',
        responsible_departments: ['ADM', 'ACM', 'FIN', 'LUT'],
        automation_status: 'semi_auto',
        recurrence_count: 5,
      },
    ]

    mockState.caseDetail = {
      correlation_id: 'corr-001',
      contract: mockState.contracts[0],
      tasks: [
        { id: 't-1', titulo: 'Generar planillas', departamento: 'ADM', estado: 'completada' },
        { id: 't-2', titulo: 'Validar pagos', departamento: 'FIN', estado: 'completada' },
      ],
      metrics: {
        total: 2,
        completadas: 2,
        bloqueadas: 0,
        observadas: 0,
        evidencias: 1,
      },
    }
  })

  describe('1. Vista de Procedimientos (procedimientosView.js)', () => {
    it('renderiza el ribbon de KPIs, contratos SOI y tarjetas de procedimientos activos', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      await renderProcedimientosView(container)

      expect(container.textContent).toContain('Procedimientos Institucionales')
      expect(container.textContent).toContain('PROC-INSCRIPCION')
      expect(container.textContent).toContain('Reinscripción 2026-II')
      expect(container.textContent).toContain('Mantenimiento de Violoncellos')

      // Verificar botón de abrir expediente
      const detailBtn = container.querySelector('[data-open-case-detail][data-correlation-id="corr-001"]')
      expect(detailBtn).toBeTruthy()

      detailBtn.click()
      expect(router.navigate).toHaveBeenCalledWith('hermes-caso', {
        processCode: 'PROC-INSCRIPCION',
        correlationId: 'corr-001',
      })
    })

    it('filtra procedimientos en vivo al escribir en la barra de búsqueda', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      await renderProcedimientosView(container)

      const searchInput = container.querySelector('#proc-search')
      searchInput.value = 'Violoncellos'
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))

      const grid = container.querySelector('#proc-grid-container')
      expect(grid.textContent).toContain('Mantenimiento de Violoncellos')
      expect(grid.textContent).not.toContain('Reinscripción 2026-II')
    })

    it('abre el modal de Guía Rápida al hacer clic en #btn-guia-procedimientos', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      await renderProcedimientosView(container)

      const helpBtn = container.querySelector('#btn-guia-procedimientos')
      expect(helpBtn).toBeTruthy()
      helpBtn.click()

      expect(document.body.textContent).toContain('Guía Rápida: Procedimientos Institucionales')
      expect(document.body.textContent).toContain('Torre de Control Institucional')
    })
  })

  describe('2. Componentes Modales (Iniciar Caso, Alumno Riesgo, Cerrar Caso)', () => {
    it('iniciarCasoModal abre el modal y ejecuta startProcessCase con validación', async () => {
      let opened = false
      openIniciarCasoModal({
        processCode: 'PROC-INSCRIPCION',
        contracts: mockState.contracts,
        onOpened: () => { opened = true },
      })

      const titleInput = document.getElementById('modal-case-title')
      expect(titleInput).toBeTruthy()
      titleInput.value = 'Apertura de Período Especial'

      const saveBtn = document.querySelector('.app-modal-btn-save')
      expect(saveBtn).toBeTruthy()
      await saveBtn.click()

      expect(tareasApi.startProcessCase).toHaveBeenCalledWith(expect.objectContaining({
        process_code: 'PROC-INSCRIPCION',
        title: 'Apertura de Período Especial',
      }))
      expect(opened).toBe(true)
    })

    it('alumnoRiesgoModal valida campos y ejecuta reportarAlumnoRiesgo', async () => {
      let reported = false
      openAlumnoRiesgoModal({
        onReported: () => { reported = true },
      })

      const alumnoInput = document.getElementById('modal-riesgo-alumno')
      const motivoInput = document.getElementById('modal-riesgo-motivo')

      alumnoInput.value = 'Pedro Infante'
      motivoInput.value = 'Acumulación de 5 inasistencias en clase de violín'

      const saveBtn = document.querySelector('.app-modal-btn-save')
      await saveBtn.click()

      expect(tareasApi.reportarAlumnoRiesgo).toHaveBeenCalledWith(
        null,
        'Pedro Infante',
        expect.stringContaining('5 inasistencias'),
      )
      expect(reported).toBe(true)
    })

    it('cerrarCasoModal valida confirmación y ejecuta closeProcessCase', async () => {
      let closed = false
      openCerrarCasoModal({
        caseId: 'corr-001',
        title: 'Reinscripción 2026',
        onClosed: () => { closed = true },
      })

      const resumenInput = document.getElementById('modal-cierre-resumen')
      const confirmCheck = document.getElementById('modal-cierre-confirm')

      resumenInput.value = 'Todas las matrículas han sido verificadas y asignadas.'
      confirmCheck.checked = true

      const saveBtn = document.querySelector('.app-modal-btn-save')
      await saveBtn.click()

      expect(tareasApi.closeProcessCase).toHaveBeenCalledWith(expect.objectContaining({
        caseId: 'corr-001',
        closureSummary: expect.stringContaining('Todas las matrículas'),
      }))
      expect(closed).toBe(true)
    })
  })

  describe('3. Vista de Detalle de Caso (casoDetalleView.js)', () => {
    it('muestra el expediente completo y permite accionar el cierre cuando las tareas están 100% listas', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      await renderCasoDetalleView(container, { correlationId: 'corr-001', processCode: 'PROC-INSCRIPCION' })

      expect(container.textContent).toContain('Reinscripción de Período')
      expect(container.textContent).toContain('Generar planillas')
      expect(container.textContent).toContain('Validar pagos')
      expect(container.textContent).toContain('Listo para Resolución y Cierre')

      const closeBtn = container.querySelector('#btn-cerrar-caso')
      expect(closeBtn).toBeTruthy()
      closeBtn.click()

      // Comprobar que abrió el modal de cierre
      expect(document.getElementById('modal-cierre-resumen')).toBeTruthy()
    })
  })
})
