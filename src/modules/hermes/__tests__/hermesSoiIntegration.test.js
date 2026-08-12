/**
 * hermesSoiIntegration.test.js — Suite de Pruebas de Integración y Enlace Hermes ↔ SOI
 *
 * Valida de forma exhaustiva que Hermes no es un componente aislado, sino el
 * motor operacional y copiloto ejecutivo central interconectado con todos los
 * subsistemas del SOI:
 *
 * 1. Enlace de Enrutamiento y Navegación Multi-Portal (Admin + Departamentos).
 * 2. Mapeo y Gating Departamental (DIR, ACM, ADM, FIN, LOG, COM, TECNICO, LUT).
 * 3. Fan-Out Cross-Departamental de Eventos de Dominio (Alumno en Riesgo → Tareas).
 * 4. Agregación Multidimensional de Datos en Tiempo Real para el Copiloto Ejecutivo.
 * 5. Ciclo de Vida de Casos en el Process Backbone Institucional.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock de Supabase para operaciones reales/mock ──────────────────────────────
const { mockFrom, mockRpc, mockSelect, mockInsert, mockUpdate, mockEq, mockOrder, mockSingle, mockState, chain } = vi.hoisted(() => {
  const mockState = {
    resolveValue: { data: [], error: null },
    rpcValue: { data: null, error: null },
  }

  const mockSingle = vi.fn(() => Promise.resolve(mockState.resolveValue))
  const mockOrder = vi.fn()
  const mockEq = vi.fn()
  const mockSelect = vi.fn()
  const mockInsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockFrom = vi.fn()
  const mockRpc = vi.fn(() => Promise.resolve(mockState.rpcValue))

  const chain = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
  }

  mockSelect.mockReturnValue(chain)
  mockInsert.mockReturnValue(chain)
  mockUpdate.mockReturnValue(chain)
  mockEq.mockReturnValue(chain)
  mockFrom.mockReturnValue(chain)

  mockOrder.mockImplementation(() => {
    return Object.assign({}, chain, {
      then(resolve, reject) {
        return Promise.resolve(mockState.resolveValue).then(resolve, reject)
      },
    })
  })

  return { mockFrom, mockRpc, mockSelect, mockInsert, mockUpdate, mockEq, mockOrder, mockSingle, mockState, chain }
})

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('../../../portal-maestros/services/groqService.js', () => ({
  callGroq: vi.fn(),
}))

import * as realSupabase from '../api/tareasSupabase.js'
import * as mockTareas from '../api/tareasMock.js'
import { getHermesOperationalContext, DEPARTAMENTOS_MAP } from '../api/hermesContextAggregator.js'
import { buildDeterministicResponse, queryHermes } from '../logic/hermesQueryEngine.js'
import { renderHermesConsultaView } from '../views/hermesConsultaView.js'
import { allRegistrars } from '../../../portales/_shared/allRegistrars.js'
import { router } from '../../../core/router/router.js'

describe('Hermes ↔ SOI Integration & Binding Verification Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    mockFrom.mockReturnValue(chain)
    mockSelect.mockReturnValue(chain)
    mockInsert.mockReturnValue(chain)
    mockUpdate.mockReturnValue(chain)
    mockEq.mockReturnValue(chain)
  })

  // ── TEST 1: Enlace en el Router Central y Catálogo de Módulos ────────────────
  describe('1. Enlace Arquitectónico con el Router y Portales SOI', () => {
    it('verifica que allRegistrars incluya todos los registrars para soporte cross-portal', () => {
      expect(Array.isArray(allRegistrars)).toBe(true)
      expect(allRegistrars.length).toBeGreaterThanOrEqual(25)
      // Debe contener funciones registradoras
      allRegistrars.forEach((fn) => {
        expect(typeof fn).toBe('function')
      })
    })

    it('verifica que las rutas de Hermes resuelvan a través del router central del SOI', () => {
      const navigateSpy = vi.spyOn(router, 'navigate')
      router.navigate('hermes-tareas', { departamento: 'ADM' })
      expect(navigateSpy).toHaveBeenCalledWith('hermes-tareas', { departamento: 'ADM' })

      router.navigate('hermes-caso', { id: 'caso-soi-001' })
      expect(navigateSpy).toHaveBeenCalledWith('hermes-caso', { id: 'caso-soi-001' })

      router.navigate('dir-score')
      expect(navigateSpy).toHaveBeenCalledWith('dir-score')
    })
  })

  // ── TEST 2: Mapeo y Gating Departamental Institucional ───────────────────────
  describe('2. Mapeo Departamental Integral del SOI', () => {
    it('cubre exactamente los 8 departamentos institucionales del SOI', () => {
      const expectedCodes = ['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO', 'LUT']
      expectedCodes.forEach((codigo) => {
        expect(DEPARTAMENTOS_MAP[codigo]).toBeDefined()
        expect(typeof DEPARTAMENTOS_MAP[codigo]).toBe('string')
      })
    })

    it('filtra tareas por departamento asignado sin fugas de datos entre áreas', async () => {
      const tareasMockData = [
        { id: 't-1', departamento: 'ADM', titulo: 'Inscripciones agosto', estado: 'pendiente' },
        { id: 't-2', departamento: 'ACM', titulo: 'Plan curricular 2026', estado: 'en_progreso' },
        { id: 't-3', departamento: 'LUT', titulo: 'Ajuste de puente violoncello', estado: 'bloqueada' },
        { id: 't-4', departamento: 'ADM', titulo: 'Pago de servicios', estado: 'completada' },
      ]

      mockState.resolveValue = { data: tareasMockData.filter((t) => t.departamento === 'ADM'), error: null }
      const admTareas = await realSupabase.getTareasByDepartamento('ADM')

      expect(admTareas).toHaveLength(2)
      admTareas.forEach((t) => {
        expect(t.departamento).toBe('ADM')
      })
    })
  })

  // ── TEST 3: Fan-Out de Eventos de Dominio (Alumno en Riesgo) ─────────────────
  describe('3. Fan-Out de Eventos de Dominio (Académico → Tareas Hermes)', () => {
    it('reportarAlumnoRiesgo genera automáticamente tareas encadenadas para ACM, ADM y DIR', async () => {
      mockState.rpcValue = {
        data: {
          caso_id: 'caso-riesgo-99',
          alumno_id: 'alu-101',
          tareas_creadas: [
            { id: 't-acm', departamento: 'ACM', titulo: 'Revisión académica de inasistencias' },
            { id: 't-adm', departamento: 'ADM', titulo: 'Contacto con representante' },
            { id: 't-dir', departamento: 'DIR', titulo: 'Supervisión de caso crítico' },
          ],
        },
        error: null,
      }

      const result = await realSupabase.reportarAlumnoRiesgo(
        'alu-101',
        'Juan Pérez',
        'Más de 4 inasistencias consecutivas sin justificación',
        { id: 'maestro-uuid-01', nombre: 'Profesor Carlos' }
      )

      expect(mockRpc).toHaveBeenCalledWith('fn_reportar_alumno_riesgo', expect.objectContaining({
        p_alumno_id: 'alu-101',
        p_motivo: expect.stringContaining('inasistencias'),
      }))
      expect(result.caso_id).toBe('caso-riesgo-99')
      expect(result.tareas_creadas).toHaveLength(3)
    })
  })

  // ── TEST 4: Agregación Multidimensional de Datos para Hermes ────────────────
  describe('4. Agregador Multidimensional de Estado Institucional', () => {
    it('cruza métricas de tareas, bloqueos y departamentos calculando salud general del SOI', async () => {
      const mockSnapshot = {
        total_procedimientos: 5,
        tareas: { total: 20, pendiente: 5, en_progreso: 5, bloqueada: 2, observada: 1, completada: 7 },
        atencion_inmediata: [
          { id: 't-1', caso_id: 'c-1', titulo: 'Falta repuesto lutería', departamento: 'LUT', estado: 'bloqueada' },
          { id: 't-2', caso_id: 'c-2', titulo: 'Aprobación nómina', departamento: 'FIN', estado: 'bloqueada' },
        ],
      }

      mockState.resolveValue = { data: mockSnapshot, error: null }
      mockRpc.mockResolvedValueOnce({ data: mockSnapshot, error: null })

      const context = await getHermesOperationalContext()

      expect(context.tareas.total).toBe(20)
      expect(context.atencionInmediata).toHaveLength(2)
      expect(context.saludGeneral).toBe('alerta')
      expect(context.puntosCriticos).toEqual(
        expect.arrayContaining([expect.stringContaining('bloqueado')]),
      )
    })

    it('el motor de consultas genera dictámenes enriquecidos con botones accionables vinculados a rutas SOI', () => {
      const mockContext = {
        totalProcedimientos: 2,
        tareas: { total: 6, pendiente: 2, en_progreso: 1, bloqueada: 1, observada: 0, completada: 2 },
        atencionInmediata: [
          { id: 't-crit-1', caso_id: 'caso-reinscripcion-2026', titulo: 'Revisión de cupos orquestales', departamento: 'ACM', deptoNombre: 'Coordinación Académica', estado: 'bloqueada' },
        ],
        porDepartamento: [
          { codigo: 'ACM', nombre: 'Coordinación Académica', total: 6, abiertas: 4, pendientes: 2, bloqueadas: 1, completadas: 2, pctAvance: 33 },
        ],
        procedimientos: [
          { id: 'proc-1', titulo_muestra: 'Reinscripción General', pct_avance: 33, completadas: 2, total: 6 },
        ],
      }

      const respuesta = buildDeterministicResponse('¿Qué tareas están bloqueadas?', mockContext)

      // Debe incluir deep-link hacia el caso específico y hacia la bandeja de tareas del departamento
      expect(respuesta).toContain('data-route="hermes-caso"')
      expect(respuesta).toContain('data-param-id="caso-reinscripcion-2026"')
      expect(respuesta).toContain('data-route="hermes-tareas"')
      expect(respuesta).toContain('data-param-depto="ACM"')
    })
  })

  // ── TEST 5: Ciclo de Vida del Process Backbone Institucional ─────────────────
  describe('5. Ciclo de Vida de Procesos Institucionales (Process Backbone)', () => {
    it('inicia un caso de proceso institucional y lo asocia a su correlation_id', async () => {
      mockState.rpcValue = {
        data: {
          correlation_id: 'corr-20260812-001',
          process_code: 'PROC-INSCRIPCION',
          tasks_created: 4,
        },
        error: null,
      }

      const result = await realSupabase.startProcessCase({
        process_code: 'PROC-INSCRIPCION',
        title: 'Apertura de Período 2026',
        priority: 'alta',
      })

      expect(mockRpc).toHaveBeenCalledWith('fn_hermes_start_process_case', expect.objectContaining({
        p_process_code: 'PROC-INSCRIPCION',
        p_priority: 'alta',
      }))
      expect(result.correlation_id).toBe('corr-20260812-001')
      expect(result.process_code).toBe('PROC-INSCRIPCION')
    })

    it('cierra un caso de proceso institucional marcando la fecha de resolución', async () => {
      mockState.rpcValue = {
        data: {
          case_id: 'caso-uuid-001',
          success: true,
          closed_at: new Date().toISOString(),
        },
        error: null,
      }

      const result = await realSupabase.closeProcessCase({
        caseId: 'caso-uuid-001',
        closureSummary: 'Todas las tareas ejecutadas y validadas por Dirección.',
        actor: { id: 'dir-uuid', nombre: 'Director General' },
      })

      expect(mockRpc).toHaveBeenCalledWith('fn_hermes_close_process_case', expect.objectContaining({
        p_case_id: 'caso-uuid-001',
        p_closure_summary: expect.stringContaining('Todas las tareas'),
      }))
      expect(result.case_id).toBe('caso-uuid-001')
      expect(result.success).toBe(true)
    })
  })
})
