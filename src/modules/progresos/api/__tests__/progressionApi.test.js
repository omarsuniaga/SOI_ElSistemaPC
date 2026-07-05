/**
 * Tests para progressionApi.js — curriculo-tres-planos WU #5.
 *
 * getObjetivoActual(alumnoId, routeVersionId) es un wrapper delgado sobre
 * fn_objetivo_actual_alumno (RPC de Postgres) — sin lógica de negocio propia,
 * solo invoca el RPC, valida errores y normaliza la forma de retorno.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import { getObjetivoActual } from '../progressionApi.js'

describe('getObjetivoActual', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invoca el RPC fn_objetivo_actual_alumno con los parámetros correctos', async () => {
    supabase.rpc.mockResolvedValue({
      data: {
        objetivo_actual_id: 'obj-1',
        nombre: 'Mantener la espalda recta',
        tema_id: 'node-1',
        tema_nombre: 'Postura',
        nivel_id: 'level-1',
        indicadores_pendientes_requeridos: 2,
      },
      error: null,
    })

    const result = await getObjetivoActual('alumno-1', 'route-version-1')

    expect(supabase.rpc).toHaveBeenCalledWith('fn_objetivo_actual_alumno', {
      p_student_id: 'alumno-1',
      p_route_version_id: 'route-version-1',
    })
    expect(result).toEqual({
      objetivo_actual_id: 'obj-1',
      nombre: 'Mantener la espalda recta',
      tema_id: 'node-1',
      tema_nombre: 'Postura',
      nivel_id: 'level-1',
      indicadores_pendientes_requeridos: 2,
    })
  })

  it('devuelve el estado "ruta completada" (todos los campos null, contador 0) cuando no hay objetivo pendiente', async () => {
    supabase.rpc.mockResolvedValue({
      data: {
        objetivo_actual_id: null,
        nombre: null,
        tema_id: null,
        tema_nombre: null,
        nivel_id: null,
        indicadores_pendientes_requeridos: 0,
      },
      error: null,
    })

    const result = await getObjetivoActual('alumno-1', 'route-version-1')

    expect(result.objetivo_actual_id).toBeNull()
    expect(result.indicadores_pendientes_requeridos).toBe(0)
  })

  it('lanza un error descriptivo si el RPC falla', async () => {
    supabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'function fn_objetivo_actual_alumno does not exist' },
    })

    await expect(getObjetivoActual('alumno-1', 'route-version-1')).rejects.toThrow(
      /fn_objetivo_actual_alumno/,
    )
  })

  it('lanza un error de validación si falta alumnoId o routeVersionId', async () => {
    await expect(getObjetivoActual(null, 'route-version-1')).rejects.toThrow(/alumnoId/)
    await expect(getObjetivoActual('alumno-1', null)).rejects.toThrow(/routeVersionId/)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })
})
