import { describe, it, expect, vi, beforeEach } from 'vitest'
import './setup.js' // Inicializa mocks globales
import { testDataFactory } from './utils/testDataFactory.js'

// Definir el mock usando vi.hoisted para que sea accesible dentro de vi.mock (que se eleva al tope)
const { mockSupabase } = vi.hoisted(() => {
  const mock = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  }
  // Configurar chaining inicial
  Object.values(mock).forEach(m => m.mockReturnValue(mock))
  return { mockSupabase: mock }
})

vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: mockSupabase
}))

// Importar el servicio y el cliente mockeado
import { academicService } from '../../src/modules/academic-routes/services/academicService.js'
import { supabase } from '../../src/lib/supabaseClient.js'

describe('academicService - Motor Híbrido y Lógica Académica', () => {
  const studentId = 'student-123'
  const nodeId = 'node-456'
  const indicatorIds = ['ind-1', 'ind-2']

  beforeEach(async () => {
    vi.clearAllMocks()
    const { __store } = await import('idb')
    __store.clear()

    // Asegurar que el mock siempre retorne sí mismo por defecto
    Object.values(mockSupabase).forEach(m => m.mockReturnValue(mockSupabase))
  })

  describe('getEffectiveApprovedAttempts (Motor Híbrido)', () => {
    it('debe combinar intentos de Supabase y IndexedDB', async () => {
      // 1. Mock Supabase: un intento aprobado
      supabase.from().select().eq().eq()['in'].mockResolvedValue({
        data: [{ indicator_id: 'ind-1' }],
        error: null
      })

      // 2. Mock IDB: un intento aprobado en la cola
      const { enqueue } = await import('../../src/portal-maestros/services/offlineQueue.js')
      await enqueue({
        tabla: 'indicator_attempts',
        payload: { student_id: studentId, status: 'approved', indicator_id: 'ind-2' }
      })

      const attempts = await academicService.getEffectiveApprovedAttempts(studentId, indicatorIds)

      expect(attempts).toHaveLength(2)
      expect(attempts.map(a => a.indicator_id)).toContain('ind-1')
      expect(attempts.map(a => a.indicator_id)).toContain('ind-2')
    })

    it('debe evitar duplicados si un intento está en ambos', async () => {
      supabase.from().select().eq().eq().in.mockResolvedValue({
        data: [{ indicator_id: 'ind-1' }],
        error: null
      })

      const { enqueue } = await import('../../src/portal-maestros/services/offlineQueue.js')
      await enqueue({
        tabla: 'indicator_attempts',
        payload: { student_id: studentId, status: 'approved', indicator_id: 'ind-1' }
      })

      const attempts = await academicService.getEffectiveApprovedAttempts(studentId, indicatorIds)
      expect(attempts).toHaveLength(1)
      expect(attempts[0].indicator_id).toBe('ind-1')
    })
  })

  describe('recalculateNodeProgress', () => {
    it('debe aprobar el nodo si todos los indicadores están aprobados (híbrido)', async () => {
      // Mock indicadores del nodo
      supabase.from().select().eq.mockResolvedValueOnce({
        data: [{ id: 'ind-1' }, { id: 'ind-2' }],
        error: null
      })

      // Mock motor híbrido (ind-1 en nube, ind-2 en local)
      vi.spyOn(academicService, 'getEffectiveApprovedAttempts').mockResolvedValue([
        { indicator_id: 'ind-1' },
        { indicator_id: 'ind-2' }
      ])

      const result = await academicService.recalculateNodeProgress(studentId, nodeId)

      expect(result.status).toBe('approved')
      
      // Debe encolar el progreso del nodo
      const { getQueue } = await import('../../src/portal-maestros/services/offlineQueue.js')
      const queue = await getQueue()
      const nodeProgress = queue.find(q => q.tabla === 'student_node_progress')
      expect(nodeProgress.payload.status).toBe('approved')
    })
  })

  describe('checkLevelCompletion (Lógica de Promoción)', () => {
    const levelId = 'level-1'

    it('debe fallar si falta un nodo crítico (Sonido/Afinación)', async () => {
      const nodes = [
        testDataFactory.createNode({ id: 'n1', is_critical: false }),
        testDataFactory.createNode({ id: 'n2', title: 'Sonido', is_critical: true })
      ]

      // 1. Mock para obtener nodos del nivel
      supabase.from.mockReturnValueOnce(supabase)
      supabase.select.mockReturnValueOnce(supabase)
      supabase.eq.mockResolvedValueOnce({ data: nodes, error: null })
      
      // 2. Mock para obtener progreso (n1 aprobado, n2 pendiente)
      // Nota: Aquí eq() y in() deben funcionar. 
      // Como eq() ya no tiene mockResolvedValueOnce pendiente, usará el default que retorna supabase.
      supabase.in.mockResolvedValueOnce({
        data: [{ node_id: 'n1', status: 'approved' }],
        error: null
      })

      const result = await academicService.checkLevelCompletion(studentId, levelId)

      expect(result.status).toBe('in_process')
      expect(result.changed).toBe(false)
    })

    it('debe aprobar nivel si todos los nodos (incluyendo críticos) están aprobados', async () => {
      const nodes = [
        testDataFactory.createNode({ id: 'n1', is_critical: false }),
        testDataFactory.createNode({ id: 'n2', title: 'Afinación', is_critical: true })
      ]

      // 1. Mock para obtener nodos
      supabase.from.mockReturnValueOnce(supabase)
      supabase.select.mockReturnValueOnce(supabase)
      supabase.eq.mockResolvedValueOnce({ data: nodes, error: null })
      
      // 2. Mock para obtener progreso
      supabase.in.mockResolvedValueOnce({
        data: [{ node_id: 'n1', status: 'approved' }],
        error: null
      })

      const { enqueue } = await import('../../src/portal-maestros/services/offlineQueue.js')
      await enqueue({
        tabla: 'student_node_progress',
        payload: { student_id: studentId, node_id: 'n2', status: 'approved' }
      })

      const result = await academicService.checkLevelCompletion(studentId, levelId)

      expect(result.status).toBe('approved')
      expect(result.changed).toBe(true)
    })
  })
})
