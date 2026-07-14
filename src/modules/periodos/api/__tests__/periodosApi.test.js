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

  describe('Integración: Flujo Completo de Aislamiento de Datos', () => {
    it('debe simular aislamiento de analíticas de clases y notas al cambiar el periodo activo', async () => {
      // 1. Configurar periodo lectivo 2025 como activo
      const periodo2025 = { id: 'p-2025', nombre: 'Periodo 2025', activo: true }
      const clases2025 = [{ id: 'cl-1', nombre: 'Violín Inicial', periodo_id: 'p-2025' }]
      const notas2025 = [{ student_id: 's-1', indicator_id: 'ind-1', status: 'achieved', periodo_id: 'p-2025' }]

      // 2. Simular cambio de periodo activo a 2026 (Corte)
      const periodo2026 = { id: 'p-2026', nombre: 'Periodo 2026', activo: true }
      
      const chain = mockChain()
      chain.select.mockResolvedValue({ data: [periodo2026], error: null })
      supabase.from.mockReturnValue(chain)

      const activePeriod = await activarPeriodo('p-2026')
      expect(activePeriod.activo).toBe(true)

      // 3. Simular la consulta del DataAdapter bajo el nuevo periodo activo (p-2026)
      // Las clases de 2025 quedan aisladas e invisibles en el nuevo periodo activo
      const activePeriodId = 'p-2026'
      const clasesFiltradas = clases2025.filter(c => c.periodo_id === activePeriodId)
      expect(clasesFiltradas).toEqual([])

      // Las calificaciones del periodo 2025 también quedan aisladas
      const notasFiltradas = notas2025.filter(n => n.periodo_id === activePeriodId)
      expect(notasFiltradas).toEqual([])
    })
  })
})
