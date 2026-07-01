import { describe, it, expect } from 'vitest'
import { getProximoIndicador, getResumenProgreso } from '../planningGuide.js'

const ind = (id, estado) => ({ node_id: id, nombre: `Nodo ${id}`, estado: { estado } })

describe('getProximoIndicador', () => {
  it('devuelve el primer indicador no completado en orden de ruta', () => {
    const list = [ind('a', 'completado'), ind('b', 'parcial'), ind('c', 'no_iniciado')]
    expect(getProximoIndicador(list)?.node_id).toBe('b')
  })

  it('respeta el orden: prioriza el primero aunque haya otros pendientes después', () => {
    const list = [ind('a', 'no_iniciado'), ind('b', 'parcial')]
    expect(getProximoIndicador(list)?.node_id).toBe('a')
  })

  it('devuelve null si todos están completados', () => {
    const list = [ind('a', 'completado'), ind('b', 'completado')]
    expect(getProximoIndicador(list)).toBeNull()
  })

  it('devuelve null para entradas vacías o inválidas', () => {
    expect(getProximoIndicador([])).toBeNull()
    expect(getProximoIndicador(null)).toBeNull()
    expect(getProximoIndicador(undefined)).toBeNull()
  })

  it('ignora indicadores sin estado bien formado', () => {
    const list = [{ node_id: 'x' }, ind('y', 'parcial')]
    expect(getProximoIndicador(list)?.node_id).toBe('y')
  })
})

describe('getResumenProgreso', () => {
  it('cuenta completados, pendientes y porcentaje', () => {
    const list = [ind('a', 'completado'), ind('b', 'parcial'), ind('c', 'no_iniciado'), ind('d', 'completado')]
    expect(getResumenProgreso(list)).toEqual({ total: 4, completados: 2, pendientes: 2, porcentaje: 50 })
  })

  it('maneja lista vacía sin dividir por cero', () => {
    expect(getResumenProgreso([])).toEqual({ total: 0, completados: 0, pendientes: 0, porcentaje: 0 })
  })
})
