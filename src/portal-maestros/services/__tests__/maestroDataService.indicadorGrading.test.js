import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

vi.mock('../viewCache.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
    invalidateAll: vi.fn(),
    getCached: vi.fn(),
    _keys: vi.fn(() => []),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import viewCache from '../viewCache.js'
import {
  saveIndicadorNota,
  updateRecoveryStatus,
  getIndicadorCheckStates,
} from '../maestroDataService.js'

function mockChain(returnValue) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(returnValue),
    maybeSingle: vi.fn().mockResolvedValue(returnValue),
  }
  chain.then = (resolve, reject) => Promise.resolve(returnValue).then(resolve, reject)
  return chain
}

describe('maestroDataService — indicator grading (recovery state machine)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── saveIndicadorNota (presentes) ─────────────────────────────────────────
  describe('saveIndicadorNota', () => {
    it('hace upsert con recovery_status="no_aplica" explícito (el alumno estaba presente)', async () => {
      const saved = { id: 'e1', alumno_id: 'a1', maestro_indicador_id: 'i1', clase_id: 'c1', nota: 5, recovery_status: 'no_aplica' }
      const chain = mockChain({ data: [saved], error: null })
      supabase.from.mockReturnValue(chain)

      const result = await saveIndicadorNota({ alumnoId: 'a1', indicadorId: 'i1', claseId: 'c1', nota: 5, evaluadoPor: 'u1' })

      expect(supabase.from).toHaveBeenCalledWith('evaluacion_indicador')
      expect(chain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          alumno_id: 'a1',
          maestro_indicador_id: 'i1',
          clase_id: 'c1',
          nota: 5,
          recovery_status: 'no_aplica',
          evaluado_por: 'u1',
        }),
        { onConflict: 'alumno_id,maestro_indicador_id,clase_id' }
      )
      expect(result).toEqual(saved)
      expect(viewCache.invalidate).toHaveBeenCalledWith('check_states')
    })

    it('rechaza cuando faltan parámetros requeridos', async () => {
      await expect(saveIndicadorNota({ alumnoId: null, indicadorId: 'i1', claseId: 'c1', nota: 5 })).rejects.toThrow(
        'Missing required parameters'
      )
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('propaga el error de Supabase con mensaje claro', async () => {
      supabase.from.mockReturnValue(mockChain({ data: null, error: { message: 'RLS violation' } }))
      await expect(
        saveIndicadorNota({ alumnoId: 'a1', indicadorId: 'i1', claseId: 'c1', nota: 5 })
      ).rejects.toThrow('RLS violation')
    })
  })

  // ── updateRecoveryStatus (ausentes) ───────────────────────────────────────
  describe('updateRecoveryStatus', () => {
    it('hace upsert (no UPDATE puro) para que funcione aunque el alumno ausente no tenga fila previa', async () => {
      const saved = { id: 'e2', alumno_id: 'a2', maestro_indicador_id: 'i1', clase_id: 'c1', recovery_status: 'recuperado' }
      const upsertChain = mockChain({ data: [saved], error: null })
      const dependientesChain = mockChain({ data: [], error: null }) // sin indicadores dependientes
      supabase.from
        .mockReturnValueOnce(upsertChain) // upsert evaluacion_indicador
        .mockReturnValueOnce(dependientesChain) // select indicador_prerequisito

      const result = await updateRecoveryStatus('a2', 'i1', 'c1', 'recuperado', 'nota de recuperación', null, 'u1')

      expect(upsertChain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ alumno_id: 'a2', maestro_indicador_id: 'i1', clase_id: 'c1', recovery_status: 'recuperado' }),
        { onConflict: 'alumno_id,maestro_indicador_id,clase_id' }
      )
      expect(result).toEqual(saved)
    })

    it('rechaza un status distinto de "recuperado"/"no_recuperable"', async () => {
      await expect(updateRecoveryStatus('a2', 'i1', 'c1', 'pendiente')).rejects.toThrow('Invalid recovery status')
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('acepta "no_recuperable" sin disparar la reevaluación de cadena', async () => {
      const saved = { id: 'e3', recovery_status: 'no_recuperable' }
      supabase.from.mockReturnValue(mockChain({ data: [saved], error: null }))

      await updateRecoveryStatus('a2', 'i1', 'c1', 'no_recuperable')

      // Solo 1 llamada a .from(): el upsert. No debe consultar indicador_prerequisito.
      expect(supabase.from).toHaveBeenCalledTimes(1)
      expect(supabase.from).toHaveBeenCalledWith('evaluacion_indicador')
    })

    it('reevaluación de cadena (R2.3): al recuperar, marca review_flag=true en los indicadores dependientes', async () => {
      const upsertChain = mockChain({ data: [{ id: 'e2', recovery_status: 'recuperado' }], error: null })
      const dependientesChain = mockChain({ data: [{ indicador_id: 'dep-1' }, { indicador_id: 'dep-2' }], error: null })
      const flagChain = mockChain({ data: null, error: null })

      supabase.from
        .mockReturnValueOnce(upsertChain) // 1. upsert evaluacion_indicador (recovery)
        .mockReturnValueOnce(dependientesChain) // 2. select indicador_prerequisito WHERE prerequisito_indicador_id = i1
        .mockReturnValueOnce(flagChain) // 3. update evaluacion_indicador SET review_flag = true

      await updateRecoveryStatus('a2', 'i1', 'c1', 'recuperado')

      expect(supabase.from).toHaveBeenNthCalledWith(2, 'indicador_prerequisito')
      expect(dependientesChain.eq).toHaveBeenCalledWith('prerequisito_indicador_id', 'i1')

      expect(supabase.from).toHaveBeenNthCalledWith(3, 'evaluacion_indicador')
      expect(flagChain.update).toHaveBeenCalledWith({ review_flag: true })
      expect(flagChain.in).toHaveBeenCalledWith('maestro_indicador_id', ['dep-1', 'dep-2'])
    })

    it('no falla si no hay indicadores dependientes (recovery_status queda igual)', async () => {
      supabase.from
        .mockReturnValueOnce(mockChain({ data: [{ id: 'e2' }], error: null }))
        .mockReturnValueOnce(mockChain({ data: [], error: null }))

      await expect(updateRecoveryStatus('a2', 'i1', 'c1', 'recuperado')).resolves.toBeDefined()
      // Sin dependientes → no debe intentar un 3er .from() para marcar review_flag
      expect(supabase.from).toHaveBeenCalledTimes(2)
    })
  })

  // ── getIndicadorCheckStates ───────────────────────────────────────────────
  describe('getIndicadorCheckStates', () => {
    function mockHierarchy({ unidades, objetivos, indicadores, evaluaciones }) {
      supabase.from.mockImplementation((table) => {
        if (table === 'maestro_unidades') return mockChain({ data: unidades, error: null })
        if (table === 'maestro_objetivos') return mockChain({ data: objetivos, error: null })
        if (table === 'maestro_indicadores') return mockChain({ data: indicadores, error: null })
        if (table === 'evaluacion_indicador') return mockChain({ data: evaluaciones, error: null })
        throw new Error(`Unexpected table in test: ${table}`)
      })
    }

    it('"none": sin evaluaciones para el indicador', async () => {
      mockHierarchy({
        unidades: [{ id: 'u1' }],
        objetivos: [{ id: 'o1' }],
        indicadores: [{ id: 'i1' }],
        evaluaciones: [],
      })

      const result = await getIndicadorCheckStates('route-1', 'clase-1')
      expect(result).toEqual([{ indicador_id: 'i1', check_state: 'none' }])
    })

    it('"single": hay evaluaciones pero al menos un alumno sigue "pendiente" (ausente sin recuperar)', async () => {
      mockHierarchy({
        unidades: [{ id: 'u1' }],
        objetivos: [{ id: 'o1' }],
        indicadores: [{ id: 'i1' }],
        evaluaciones: [
          { maestro_indicador_id: 'i1', alumno_id: 'a1', recovery_status: 'no_aplica' },
          { maestro_indicador_id: 'i1', alumno_id: 'a2', recovery_status: 'pendiente' },
        ],
      })

      const result = await getIndicadorCheckStates('route-1', 'clase-1')
      expect(result[0].check_state).toBe('single')
    })

    it('"double": todos los alumnos evaluados o recuperados/no_recuperable, sin deudas pendientes', async () => {
      mockHierarchy({
        unidades: [{ id: 'u1' }],
        objetivos: [{ id: 'o1' }],
        indicadores: [{ id: 'i1' }],
        evaluaciones: [
          { maestro_indicador_id: 'i1', alumno_id: 'a1', recovery_status: 'no_aplica' },
          { maestro_indicador_id: 'i1', alumno_id: 'a2', recovery_status: 'recuperado' },
          { maestro_indicador_id: 'i1', alumno_id: 'a3', recovery_status: 'no_recuperable' },
        ],
      })

      const result = await getIndicadorCheckStates('route-1', 'clase-1')
      expect(result[0].check_state).toBe('double')
    })

    it('transición single→double: recuperar al último alumno pendiente cambia el estado', async () => {
      mockHierarchy({
        unidades: [{ id: 'u1' }],
        objetivos: [{ id: 'o1' }],
        indicadores: [{ id: 'i1' }],
        evaluaciones: [
          { maestro_indicador_id: 'i1', alumno_id: 'a1', recovery_status: 'no_aplica' },
          { maestro_indicador_id: 'i1', alumno_id: 'a2', recovery_status: 'pendiente' },
        ],
      })
      const before = await getIndicadorCheckStates('route-1', 'clase-1')
      expect(before[0].check_state).toBe('single')

      // El alumno a2 se recupera → su fila pasa a 'recuperado'
      mockHierarchy({
        unidades: [{ id: 'u1' }],
        objetivos: [{ id: 'o1' }],
        indicadores: [{ id: 'i1' }],
        evaluaciones: [
          { maestro_indicador_id: 'i1', alumno_id: 'a1', recovery_status: 'no_aplica' },
          { maestro_indicador_id: 'i1', alumno_id: 'a2', recovery_status: 'recuperado' },
        ],
      })
      const after = await getIndicadorCheckStates('route-1', 'clase-1')
      expect(after[0].check_state).toBe('double')
    })

    it('no crashea si la ruta no tiene unidades (retorna array vacío)', async () => {
      mockHierarchy({ unidades: [], objetivos: [], indicadores: [], evaluaciones: [] })
      const result = await getIndicadorCheckStates('route-vacia', 'clase-1')
      expect(result).toEqual([])
    })

    it('retorna array vacío si falta routeId o claseId (sin llamar a Supabase)', async () => {
      expect(await getIndicadorCheckStates(null, 'clase-1')).toEqual([])
      expect(await getIndicadorCheckStates('route-1', null)).toEqual([])
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })
})
