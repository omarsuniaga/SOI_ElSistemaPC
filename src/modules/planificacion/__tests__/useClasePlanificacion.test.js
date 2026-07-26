import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock services
vi.mock('../services/clasePlanificacionService.js', () => ({
  asignarRutaAClase: vi.fn(),
  obtenerRutaDeClase: vi.fn(),
  obtenerRutaActivaPorClase: vi.fn(),
  cambiarEstadoPlan: vi.fn(),
  eliminarRutaDeClase: vi.fn(),
}))

vi.mock('../services/claseObjetivosService.js', () => ({
  agregarObjetivos: vi.fn(),
  obtenerObjetivosPorPlanificacion: vi.fn(),
  actualizarObjetivo: vi.fn(),
  eliminarObjetivos: vi.fn(),
  reordenarObjetivos: vi.fn(),
}))

vi.mock('../services/evaluacionClaseService.js', () => ({
  registrarEvaluacion: vi.fn(),
  obtenerEvaluacionesPorClase: vi.fn(),
  obtenerEvaluacionPorAlumno: vi.fn(),
  obtenerProgresoAlumnos: vi.fn(),
  obtenerProgresoPorIndicador: vi.fn(),
}))

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('useClasePlanificacion hook', () => {
  let hook

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const mod = await import('../hooks/useClasePlanificacion.js')
    hook = mod.useClasePlanificacion()
  })

  describe('initial state', () => {
    it('has empty initial state', () => {
      expect(hook.planificacion).toBeNull()
      expect(hook.rutaAsignada).toBeNull()
      expect(hook.objetivos).toEqual([])
      expect(hook.evaluaciones).toEqual([])
      expect(hook.progresoAlumnos).toEqual([])
      expect(hook.cargando).toBe(false)
      expect(hook.error).toBeNull()
    })
  })

  describe('subscribe / notify', () => {
    it('calls listener when state changes', async () => {
      const listener = vi.fn()
      const unsub = hook.subscribe(listener)

      await hook.fetchRutaDeClase('clase-1')
      expect(listener).toHaveBeenCalled()
      unsub()
    })

    it('unsubscribed listener is not called', async () => {
      const listener = vi.fn()
      const unsub = hook.subscribe(listener)
      unsub()

      await hook.fetchRutaDeClase('clase-1')
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('fetchRutaDeClase', () => {
    it('sets rutaAsignada from service result', async () => {
      const mockRuta = { id: 'ccp-1', clase_id: 'clase-1', estado: 'activo' }
      const svc = await import('../services/clasePlanificacionService.js')
      svc.obtenerRutaActivaPorClase.mockResolvedValue(mockRuta)

      const result = await hook.fetchRutaDeClase('clase-1')
      expect(hook.rutaAsignada).toEqual(mockRuta)
      expect(result).toEqual(mockRuta)
      expect(svc.obtenerRutaActivaPorClase).toHaveBeenCalledWith('clase-1')
    })

    it('sets rutaAsignada to null when no route exists', async () => {
      const svc = await import('../services/clasePlanificacionService.js')
      svc.obtenerRutaActivaPorClase.mockResolvedValue(null)

      await hook.fetchRutaDeClase('clase-1')
      expect(hook.rutaAsignada).toBeNull()
    })

    it('sets error on failure', async () => {
      const svc = await import('../services/clasePlanificacionService.js')
      svc.obtenerRutaActivaPorClase.mockRejectedValue(new Error('DB error'))

      await expect(hook.fetchRutaDeClase('clase-1')).rejects.toThrow('DB error')
      expect(hook.error).toBe('DB error')
      expect(hook.cargando).toBe(false)
    })
  })

  describe('asignarRuta', () => {
    it('calls service and refreshes rutaAsignada', async () => {
      const svc = await import('../services/clasePlanificacionService.js')
      const mockResult = { id: 'ccp-2', clase_id: 'clase-1', estado: 'activo' }
      svc.asignarRutaAClase.mockResolvedValue(mockResult)
      svc.obtenerRutaActivaPorClase.mockResolvedValue(mockResult)

      const result = await hook.asignarRuta('clase-1', 'rv-1')
      expect(svc.asignarRutaAClase).toHaveBeenCalledWith('clase-1', 'rv-1')
      expect(hook.rutaAsignada).toEqual(mockResult)
      expect(result).toEqual(mockResult)
    })
  })

  describe('cambiarEstadoPlan', () => {
    it('calls service and updates local state', async () => {
      const svc = await import('../services/clasePlanificacionService.js')
      svc.obtenerRutaActivaPorClase.mockResolvedValue({ id: 'ccp-1', clase_id: 'clase-1', estado: 'activo' })
      await hook.fetchRutaDeClase('clase-1')

      svc.cambiarEstadoPlan.mockResolvedValue({ id: 'ccp-1', estado: 'archivado' })

      await hook.cambiarEstado('clase-1', 'archivado')
      expect(svc.cambiarEstadoPlan).toHaveBeenCalledWith('clase-1', 'archivado')
    })
  })

  describe('fetchObjetivos', () => {
    it('loads objectives for a planificacion', async () => {
      const mockObj = [
        { id: 'obj-1', indicator_id: 'ind-1', estado: 'pendiente' },
        { id: 'obj-2', indicator_id: 'ind-2', estado: 'completado' },
      ]
      const svc = await import('../services/claseObjetivosService.js')
      svc.obtenerObjetivosPorPlanificacion.mockResolvedValue(mockObj)

      await hook.fetchObjetivos('plan-1')
      expect(hook.objetivos).toEqual(mockObj)
      expect(svc.obtenerObjetivosPorPlanificacion).toHaveBeenCalledWith('plan-1')
    })

    it('sets empty array when no objectives exist', async () => {
      const svc = await import('../services/claseObjetivosService.js')
      svc.obtenerObjetivosPorPlanificacion.mockResolvedValue([])

      await hook.fetchObjetivos('plan-1')
      expect(hook.objetivos).toEqual([])
    })
  })

  describe('agregarObjetivos', () => {
    it('calls service and refreshes objectives list', async () => {
      const svc = await import('../services/claseObjetivosService.js')
      const newObjs = [{ id: 'obj-3', indicator_id: 'ind-3' }]
      svc.agregarObjetivos.mockResolvedValue(newObjs)
      svc.obtenerObjetivosPorPlanificacion.mockResolvedValue([...newObjs])

      const result = await hook.agregarObjetivos('plan-1', 'ccp-1', [
        { node_id: 'n-1', indicator_id: 'ind-3' },
      ])
      expect(svc.agregarObjetivos).toHaveBeenCalled()
      expect(result).toEqual(newObjs)
    })
  })

  describe('evaluarAlumno', () => {
    it('calls registrarEvaluacion and refreshes evaluations', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      const evalResult = { id: 'eval-1', alumno_id: 'al-1', indicator_id: 'ind-1' }
      svc.registrarEvaluacion.mockResolvedValue(evalResult)
      svc.obtenerEvaluacionesPorClase.mockResolvedValue([evalResult])

      const result = await hook.evaluarAlumno({
        alumno_id: 'al-1',
        indicator_id: 'ind-1',
        clase_id: 'clase-1',
        nota: 4,
        estado: 'avanzado',
      })
      expect(svc.registrarEvaluacion).toHaveBeenCalled()
      expect(result).toEqual(evalResult)
      expect(hook.evaluaciones).toEqual([evalResult])
    })
  })

  describe('fetchEvaluaciones', () => {
    it('loads evaluations for a class', async () => {
      const mockEvals = [
        { id: 'e-1', alumno_id: 'al-1', clase_id: 'clase-1' },
        { id: 'e-2', alumno_id: 'al-2', clase_id: 'clase-1' },
      ]
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockResolvedValue(mockEvals)

      await hook.fetchEvaluaciones('clase-1')
      expect(hook.evaluaciones).toEqual(mockEvals)
    })
  })

  describe('fetchProgresoAlumnos', () => {
    it('loads student progress for a class', async () => {
      const mockProg = [{ alumno_id: 'al-1', total: 5, dominados: 2 }]
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerProgresoAlumnos.mockResolvedValue(mockProg)

      await hook.fetchProgresoAlumnos('clase-1')
      expect(hook.progresoAlumnos).toEqual(mockProg)
    })
  })

  describe('reset', () => {
    it('clears all state', async () => {
      const svc = await import('../services/clasePlanificacionService.js')
      svc.obtenerRutaActivaPorClase.mockResolvedValue({ id: 'ccp-1' })
      await hook.fetchRutaDeClase('clase-1')
      expect(hook.rutaAsignada).not.toBeNull()

      hook.reset()
      expect(hook.planificacion).toBeNull()
      expect(hook.rutaAsignada).toBeNull()
      expect(hook.objetivos).toEqual([])
      expect(hook.evaluaciones).toEqual([])
      expect(hook.progresoAlumnos).toEqual([])
      expect(hook.error).toBeNull()
    })
  })
})
