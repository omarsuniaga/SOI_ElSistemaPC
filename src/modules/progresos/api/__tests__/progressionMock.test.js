/**
 * Tests para progressionMock.js — curriculo-tres-planos WU #8 (demo parity).
 *
 * Simula fn_objetivo_actual_alumno en memoria usando el mismo mock de datos
 * de ruta académica (assets/data/mocks/curriculo_tres_planos.json) para que
 * el modo demo tenga paridad funcional con progressionApi.js (WU #5).
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { getObjetivoActual } from '../progressionMock.js'

describe('progressionMock.getObjetivoActual', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('devuelve el primer objetivo con indicadores requeridos pendientes', async () => {
    const result = await getObjetivoActual('demo-alumno-1', 'demo-route-version-1')

    expect(result).toHaveProperty('objetivo_actual_id')
    expect(result).toHaveProperty('nombre')
    expect(result).toHaveProperty('tema_id')
    expect(result).toHaveProperty('nivel_id')
    expect(result).toHaveProperty('indicadores_pendientes_requeridos')
    expect(typeof result.indicadores_pendientes_requeridos).toBe('number')
  })

  it('devuelve el estado "ruta completada" (todos null, contador 0) para una route_version inexistente', async () => {
    const result = await getObjetivoActual('demo-alumno-1', 'route-version-inexistente')

    expect(result).toEqual({
      objetivo_actual_id: null,
      nombre: null,
      tema_id: null,
      tema_nombre: null,
      nivel_id: null,
      indicadores_pendientes_requeridos: 0,
    })
  })

  it('requiere alumnoId y routeVersionId, igual que el wrapper real', async () => {
    await expect(getObjetivoActual(null, 'route-version-1')).rejects.toThrow(/alumnoId/)
    await expect(getObjetivoActual('alumno-1', null)).rejects.toThrow(/routeVersionId/)
  })
})
