/**
 * Tests para periodosApi.js
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import {
  getPeriodos,
  getPeriodoActivo,
  crearPeriodo,
  actualizarPeriodo,
  activarPeriodo,
  eliminarPeriodo
} from '../periodosApi.js'

function mockChain() {
  const chain = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.neq = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.update = vi.fn().mockReturnValue(chain)
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.delete = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockReturnValue(chain)
  return chain
}

describe('periodosApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getPeriodos', () => {
    it('debe obtener todos los periodos ordenados por fecha_inicio desc', async () => {
      const mockData = [{ id: 'p-1', nombre: 'Periodo 1', fecha_inicio: '2025-01-01', activo: true }]
      const chain = mockChain()
      chain.order.mockResolvedValue({ data: mockData, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await getPeriodos()

      expect(supabase.from).toHaveBeenCalledWith('periodos')
      expect(chain.order).toHaveBeenCalledWith('fecha_inicio', { ascending: false })
      expect(result).toEqual(mockData)
    })

    it('debe lanzar error si falla la consulta', async () => {
      const chain = mockChain()
      chain.order.mockResolvedValue({ data: null, error: new Error('DB Error') })
      supabase.from.mockReturnValue(chain)

      await expect(getPeriodos()).rejects.toThrow('No se pudieron cargar los períodos')
    })
  })

  describe('getPeriodoActivo', () => {
    it('debe obtener el periodo con activo=true', async () => {
      const mockData = { id: 'p-1', nombre: 'Periodo 1', activo: true }
      const chain = mockChain()
      chain.single.mockResolvedValue({ data: mockData, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await getPeriodoActivo()

      expect(supabase.from).toHaveBeenCalledWith('periodos')
      expect(chain.eq).toHaveBeenCalledWith('activo', true)
      expect(result).toEqual(mockData)
    })

    it('debe retornar null si no hay periodo activo o falla', async () => {
      const chain = mockChain()
      chain.single.mockResolvedValue({ data: null, error: new Error('Not found') })
      supabase.from.mockReturnValue(chain)

      const result = await getPeriodoActivo()
      expect(result).toBeNull()
    })
  })

  describe('crearPeriodo', () => {
    it('debe crear un periodo exitosamente', async () => {
      const mockPeriodoInput = { nombre: 'Periodo Nuevo', fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' }
      const mockPeriodoResult = { id: 'p-new', ...mockPeriodoInput, activo: false }
      const chain = mockChain()
      chain.select.mockResolvedValue({ data: [mockPeriodoResult], error: null })
      supabase.from.mockReturnValue(chain)

      const result = await crearPeriodo(mockPeriodoInput)

      expect(supabase.from).toHaveBeenCalledWith('periodos')
      expect(chain.insert).toHaveBeenCalledWith([{
        nombre: 'Periodo Nuevo',
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-12-31',
        activo: false,
      }])
      expect(result).toEqual(mockPeriodoResult)
    })

    it('debe lanzar error si no tiene nombre', async () => {
      await expect(crearPeriodo({ fecha_inicio: '2026-01-01' })).rejects.toThrow('El nombre es obligatorio')
    })
  })

  describe('activarPeriodo', () => {
    it('debe desactivar otros periodos y activar el seleccionado', async () => {
      const mockPeriodoResult = { id: 'p-1', activo: true }
      const chain = mockChain()
      chain.select.mockResolvedValue({ data: [mockPeriodoResult], error: null })
      supabase.from.mockReturnValue(chain)

      const result = await activarPeriodo('p-1')

      // Primera llamada: desactivar otros
      expect(chain.update).toHaveBeenCalledWith({ activo: false })
      expect(chain.neq).toHaveBeenCalledWith('id', 'p-1')

      // Segunda llamada: activar el seleccionado
      expect(chain.update).toHaveBeenLastCalledWith({ activo: true })
      expect(chain.eq).toHaveBeenCalledWith('id', 'p-1')

      expect(result).toEqual(mockPeriodoResult)
    })
  })
})
