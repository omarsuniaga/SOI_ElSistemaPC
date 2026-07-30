import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as semesterTransition from '../api/semesterTransition.js'
import { supabase } from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

vi.mock('../../../lib/periodoSniffer.js', () => ({
  checkPeriodoSupport: vi.fn().mockResolvedValue(true)
}))

/**
 * Build a Supabase mock chain that resolves with the given data/error.
 * Returns { select, insert, order, eq, in } — all chain-compatible mocks.
 *
 * Usage:
 *   const chain = mockChain([{ id: 'c1' }])
 *   supabase.from.mockReturnValueOnce({ select: chain.select })
 *   // Then .select('*').eq(...) resolves with { data: [{id:'c1'}], error: null }
 *
 * For insert chains:
 *   const ins = mockInsertChain([{ id: 'new-c1' }])
 *   supabase.from.mockReturnValueOnce({ insert: ins.insert })
 *   // Then .insert([...]).select() resolves with { data: [{id:'new-c1'}], error: null }
 */
/**
 * Build a chainable Supabase mock. Every method (.eq, .in, .order) returns
 * the same chain object so arbitrary chaining works. The chain is also
 * thenable so `await chain` resolves to { data, error }.
 */
function mockChain(data, error = null) {
  const result = { data, error }

  const makeChain = () => {
    const chain = { eq: vi.fn(), in: vi.fn(), order: vi.fn() }
    chain.eq.mockReturnValue(chain)
    chain.in.mockReturnValue(chain)
    chain.order.mockReturnValue(chain)
    // thenable: `await chain` resolves to { data, error }
    chain.then = (resolve, reject) => {
      if (error && reject) reject(error)
      else resolve(result)
    }
    return chain
  }

  const chain = makeChain()
  const selectFn = vi.fn().mockReturnValue(chain)
  return { select: selectFn }
}

function mockInsertChain(data, error = null) {
  const result = { data, error }
  const selectFn = vi.fn().mockResolvedValue(result)
  const insertFn = vi.fn().mockReturnValue({ select: selectFn })
  return { insert: insertFn, select: selectFn }
}

function mockRawInsert(error = null) {
  const result = { data: null, error }
  return { insert: vi.fn().mockResolvedValue(result) }
}

describe('semesterTransition', () => {
  beforeEach(() => {
    // CRITICAL: mockReset clears the mockReturnValueOnce queue.
    // clearAllMocks does NOT clear this queue — leftover values
    // from failed tests leak into subsequent ones.
    vi.clearAllMocks()
    supabase.from.mockReset()
  })

  describe('getPeriods', () => {
    it('should return all periods ordered by fecha_inicio descending with class counts', async () => {
      const mockPeriodos = [
        { id: 'p2', nombre: '2025-Q2', fecha_inicio: '2025-07-01', fecha_fin: '2025-12-31', activo: true },
        { id: 'p1', nombre: '2025-Q1', fecha_inicio: '2025-01-15', fecha_fin: '2025-06-30', activo: false },
      ]
      const mockClases = [
        { periodo_id: 'p1' },
        { periodo_id: 'p1' },
        { periodo_id: 'p2' },
      ]

      const periodoChain = mockChain(mockPeriodos)
      const claseChain = mockChain(mockClases)

      supabase.from
        .mockReturnValueOnce({ select: periodoChain.select })   // periodos query
        .mockReturnValueOnce({ select: claseChain.select })     // clases count query

      const result = await semesterTransition.getPeriods()

      expect(result).toHaveLength(2)
      expect(supabase.from).toHaveBeenCalledWith('periodos')
      expect(supabase.from).toHaveBeenCalledWith('clases')
      expect(result.find(p => p.id === 'p2').classCount).toBe(1)
      expect(result.find(p => p.id === 'p1').classCount).toBe(2)
    })
  })

  describe('getTransitionPreview', () => {
    it('should show classes to create and skip for idempotent clone', async () => {
      const sourceClasses = [
        { id: 'c1', nombre: 'Piano I', periodo_id: 'p1' },
        { id: 'c2', nombre: 'Guitarra I', periodo_id: 'p1' },
      ]
      const targetClasses = [
        { id: 'c3', nombre: 'Piano I', periodo_id: 'p2' },
      ]

      const sourceChain = mockChain(sourceClasses)
      const targetChain = mockChain(targetClasses)

      supabase.from
        .mockReturnValueOnce({ select: sourceChain.select })
        .mockReturnValueOnce({ select: targetChain.select })

      const result = await semesterTransition.getTransitionPreview('p1', 'p2')

      expect(result.toCreate).toHaveLength(1)
      expect(result.toCreate[0].nombre).toBe('Guitarra I')
      expect(result.toSkip).toHaveLength(1)
      expect(result.toSkip[0].nombre).toBe('Piano I')
      expect(result.existingInTarget).toBe(1)
    })

    it('should show all classes to create when target is empty', async () => {
      const sourceClasses = [
        { id: 'c1', nombre: 'Piano I', periodo_id: 'p1' },
        { id: 'c2', nombre: 'Guitarra I', periodo_id: 'p1' },
      ]

      const sourceChain = mockChain(sourceClasses)
      const targetChain = mockChain([])

      supabase.from
        .mockReturnValueOnce({ select: sourceChain.select })
        .mockReturnValueOnce({ select: targetChain.select })

      const result = await semesterTransition.getTransitionPreview('p1', 'p2')

      expect(result.toCreate).toHaveLength(2)
      expect(result.toSkip).toHaveLength(0)
      expect(result.existingInTarget).toBe(0)
    })
  })

  describe('cloneClasses', () => {
    it('should clone classes to target period with progress callback', async () => {
      const sourceClasses = [
        { id: 'c1', nombre: 'Piano I', instrumento: 'Piano', periodo_id: 'p1' },
        { id: 'c2', nombre: 'Guitarra I', instrumento: 'Guitarra', periodo_id: 'p1' },
      ]

      const sourceChain = mockChain(sourceClasses)       // 1. source classes
      const targetChain = mockChain([])                   // 2. target existing (empty)
      const horariosChain = mockChain([])                 // 3. horarios
      const insert1Chain = mockInsertChain([{ id: 'new-c1', nombre: 'Piano I' }])  // 4. insert class 1
      const insert2Chain = mockInsertChain([{ id: 'new-c2', nombre: 'Guitarra I' }])  // 5. insert class 2

      supabase.from
        .mockReturnValueOnce({ select: sourceChain.select })
        .mockReturnValueOnce({ select: targetChain.select })
        .mockReturnValueOnce({ select: horariosChain.select })
        .mockReturnValueOnce({ insert: insert1Chain.insert })
        .mockReturnValueOnce({ insert: insert2Chain.insert })

      const onProgress = vi.fn()
      const result = await semesterTransition.cloneClasses('p1', 'p2', { onProgress })

      expect(result.created).toHaveLength(2)
      expect(result.skipped).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
      expect(onProgress).toHaveBeenCalledWith(1, 2)
      expect(onProgress).toHaveBeenCalledWith(2, 2)
    })

    it('should skip classes already in target (idempotent)', async () => {
      const sourceClasses = [
        { id: 'c1', nombre: 'Piano I', instrumento: 'Piano', periodo_id: 'p1' },
      ]
      const targetClasses = [
        { id: 'existing', nombre: 'Piano I', periodo_id: 'p2' },
      ]

      const sourceChain = mockChain(sourceClasses)
      const targetChain = mockChain(targetClasses)
      const horariosChain = mockChain([]) // horarios query runs even when all classes will be skipped

      supabase.from
        .mockReturnValueOnce({ select: sourceChain.select })
        .mockReturnValueOnce({ select: targetChain.select })
        .mockReturnValueOnce({ select: horariosChain.select })

      const result = await semesterTransition.cloneClasses('p1', 'p2')

      expect(result.created).toHaveLength(0)
      expect(result.skipped).toHaveLength(1)
      expect(result.skipped[0]).toBe('c1')
    })

    it('should respect excludeClassIds option', async () => {
      const sourceClasses = [
        { id: 'c1', nombre: 'Piano I', instrumento: 'Piano', periodo_id: 'p1' },
        { id: 'c2', nombre: 'Guitarra I', instrumento: 'Guitarra', periodo_id: 'p1' },
      ]

      const sourceChain = mockChain(sourceClasses)
      const targetChain = mockChain([])
      const horariosChain = mockChain([])
      const insertChain = mockInsertChain([{ id: 'new-c1', nombre: 'Piano I' }])

      supabase.from
        .mockReturnValueOnce({ select: sourceChain.select })
        .mockReturnValueOnce({ select: targetChain.select })
        .mockReturnValueOnce({ select: horariosChain.select })
        .mockReturnValueOnce({ insert: insertChain.insert })

      const result = await semesterTransition.cloneClasses('p1', 'p2', { excludeClassIds: ['c2'] })

      expect(result.created).toHaveLength(1)
      expect(result.created[0].nombre).toBe('Piano I')
      expect(result.skipped).toContain('c2')
    })

    it('should handle partial failure — failed class logged, others continue', async () => {
      const sourceClasses = [
        { id: 'c1', nombre: 'Piano I', instrumento: 'Piano', periodo_id: 'p1' },
        { id: 'c2', nombre: 'Guitarra I', instrumento: 'Guitarra', periodo_id: 'p1' },
      ]

      const sourceChain = mockChain(sourceClasses)
      const targetChain = mockChain([])
      const horariosChain = mockChain([])
      const insert1Chain = mockInsertChain([{ id: 'new-c1', nombre: 'Piano I' }])
      const insert2Chain = mockInsertChain(null, { message: 'duplicate key', code: '23505' })

      supabase.from
        .mockReturnValueOnce({ select: sourceChain.select })
        .mockReturnValueOnce({ select: targetChain.select })
        .mockReturnValueOnce({ select: horariosChain.select })
        .mockReturnValueOnce({ insert: insert1Chain.insert })
        .mockReturnValueOnce({ insert: insert2Chain.insert })

      const result = await semesterTransition.cloneClasses('p1', 'p2')

      expect(result.created).toHaveLength(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toHaveProperty('classId', 'c2')
    })
  })

  describe('bulkEnrollStudents', () => {
    it('should create new enrollment records linking students to target classes', async () => {
      const sourceEnrollments = [
        { alumno_id: 's1', clase_id: 'c1', activo: true, fecha_inscripcion: '2025-01-15', hora_inicio: null, hora_fin: null },
        { alumno_id: 's2', clase_id: 'c1', activo: true, fecha_inscripcion: '2025-01-15', hora_inicio: null, hora_fin: null },
      ]

      const queryChain = mockChain(sourceEnrollments)
      const insertChain = mockRawInsert(null) // no error

      supabase.from
        .mockReturnValueOnce({ select: queryChain.select })
        .mockReturnValueOnce(insertChain)

      const classMapping = [{ sourceClassId: 'c1', targetClassId: 'new-c1' }]
      const result = await semesterTransition.bulkEnrollStudents('p1', 'p2', { classMapping })

      expect(result.enrolled).toBe(2)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should respect excludeStudentIds map — opt-out individual students', async () => {
      const sourceEnrollments = [
        { alumno_id: 's1', clase_id: 'c1', activo: true, fecha_inscripcion: '2025-01-15', hora_inicio: null, hora_fin: null },
        { alumno_id: 's2', clase_id: 'c1', activo: true, fecha_inscripcion: '2025-01-15', hora_inicio: null, hora_fin: null },
        { alumno_id: 's3', clase_id: 'c1', activo: true, fecha_inscripcion: '2025-01-15', hora_inicio: null, hora_fin: null },
      ]

      const queryChain = mockChain(sourceEnrollments)
      const insertChain = mockRawInsert(null)

      supabase.from
        .mockReturnValueOnce({ select: queryChain.select })
        .mockReturnValueOnce(insertChain)

      const classMapping = [{ sourceClassId: 'c1', targetClassId: 'new-c1' }]
      const excludeMap = new Map([['c1', new Set(['s2'])]])
      const result = await semesterTransition.bulkEnrollStudents('p1', 'p2', {
        classMapping,
        excludeStudentIds: excludeMap,
      })

      expect(result.enrolled).toBe(2)
      expect(result.skipped).toBe(1)
    })

    it('should handle per-class failure without rolling back successes', async () => {
      const enrollments1 = [
        { alumno_id: 's1', clase_id: 'c1', activo: true, fecha_inscripcion: '2025-01-15', hora_inicio: null, hora_fin: null },
      ]
      const enrollments2 = [
        { alumno_id: 's2', clase_id: 'c2', activo: true, fecha_inscripcion: '2025-01-15', hora_inicio: null, hora_fin: null },
      ]

      const query1Chain = mockChain(enrollments1)
      const insert1Chain = mockRawInsert(null)
      const query2Chain = mockChain(enrollments2)
      const insert2Chain = mockRawInsert({ message: 'constraint violation', code: '23503' })

      supabase.from
        .mockReturnValueOnce({ select: query1Chain.select })
        .mockReturnValueOnce(insert1Chain)
        .mockReturnValueOnce({ select: query2Chain.select })
        .mockReturnValueOnce(insert2Chain)

      const classMapping = [
        { sourceClassId: 'c1', targetClassId: 'new-c1' },
        { sourceClassId: 'c2', targetClassId: 'new-c2' },
      ]

      const result = await semesterTransition.bulkEnrollStudents('p1', 'p2', { classMapping })

      expect(result.enrolled).toBe(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toHaveProperty('classId', 'c2')
    })

    it('should call onProgress callback during enrollment', async () => {
      const enrollments = [
        { alumno_id: 's1', clase_id: 'c1', activo: true, fecha_inscripcion: '2025-01-15', hora_inicio: null, hora_fin: null },
      ]

      const queryChain = mockChain(enrollments)
      const insertChain = mockRawInsert(null)

      supabase.from
        .mockReturnValueOnce({ select: queryChain.select })
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce({ select: queryChain.select })
        .mockReturnValueOnce(insertChain)

      const classMapping = [
        { sourceClassId: 'c1', targetClassId: 'new-c1' },
        { sourceClassId: 'c2', targetClassId: 'new-c2' },
      ]

      const onProgress = vi.fn()
      await semesterTransition.bulkEnrollStudents('p1', 'p2', { classMapping, onProgress })

      expect(onProgress).toHaveBeenCalledWith(1, 2)
      expect(onProgress).toHaveBeenCalledWith(2, 2)
    })
  })

  describe('validateConflicts', () => {
    it('should detect room overlap — same salon, overlapping times', async () => {
      const classes = [
        {
          id: 'c1',
          nombre: 'Guitarra A',
          maestro_principal_id: 'm1',
          horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '10:00', salon_id: 's1' }],
        },
      ]

      const existingHorarios = [
        {
          clase_id: 'existing-c',
          salon_id: 's1',
          dia: 'lunes',
          hora_inicio: '09:00',
          hora_fin: '11:00',
          clases: { nombre: 'Canto A', maestro_principal_id: 'm2' },
        },
      ]

      const horariosChain = mockChain(existingHorarios)
      const clasesChain = mockChain([{ id: 'existing-c' }])

      supabase.from
        .mockReturnValueOnce({ select: horariosChain.select })  // clase_horarios query
        .mockReturnValueOnce({ select: clasesChain.select })     // target clases query

      const result = await semesterTransition.validateConflicts(classes, 'p2')

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('type', 'room')
      expect(result[0]).toHaveProperty('classId', 'c1')
      expect(result[0].conflictingClass).toBe('Canto A')
    })

    it('should detect teacher overlap — same teacher, overlapping times', async () => {
      const classes = [
        {
          id: 'c1',
          nombre: 'Piano A',
          maestro_principal_id: 'm1',
          horarios: [{ dia: 'lunes', hora_inicio: '14:00', hora_fin: '16:00', salon_id: 's2' }],
        },
      ]

      const existingHorarios = [
        {
          clase_id: 'existing-c',
          salon_id: 's3',
          dia: 'lunes',
          hora_inicio: '15:00',
          hora_fin: '17:00',
          clases: { nombre: 'Violín B', maestro_principal_id: 'm1' },
        },
      ]

      const horariosChain = mockChain(existingHorarios)
      const clasesChain = mockChain([{ id: 'existing-c' }])

      supabase.from
        .mockReturnValueOnce({ select: horariosChain.select })
        .mockReturnValueOnce({ select: clasesChain.select })

      const result = await semesterTransition.validateConflicts(classes, 'p2')

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('type', 'teacher')
      expect(result[0]).toHaveProperty('classId', 'c1')
    })

    it('should return empty when no conflicts exist', async () => {
      const classes = [
        {
          id: 'c1',
          nombre: 'Piano A',
          maestro_principal_id: 'm1',
          horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '10:00', salon_id: 's1' }],
        },
      ]

      const existingHorarios = [
        {
          clase_id: 'existing-c',
          salon_id: 's2',
          dia: 'lunes',
          hora_inicio: '08:00',
          hora_fin: '10:00',
          clases: { nombre: 'Guitarra B', maestro_principal_id: 'm2' },
        },
      ]

      const horariosChain = mockChain(existingHorarios)
      const clasesChain = mockChain([{ id: 'existing-c' }])

      supabase.from
        .mockReturnValueOnce({ select: horariosChain.select })
        .mockReturnValueOnce({ select: clasesChain.select })

      const result = await semesterTransition.validateConflicts(classes, 'p2')

      expect(result).toHaveLength(0)
    })
  })
})
