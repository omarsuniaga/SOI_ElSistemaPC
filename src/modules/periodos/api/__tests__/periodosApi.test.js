/**
 * Tests para periodosApi.js
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
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
  chain.gte = vi.fn().mockReturnValue(chain)
  chain.lte = vi.fn().mockReturnValue(chain)
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
    it('delega el corte en la RPC atómica, no en dos updates encadenados', async () => {
      supabase.rpc.mockResolvedValue({
        data: { ok: true, periodo_id: 'p-1', nombre: 'Semestre 2026-II', periodo_anterior_id: 'p-0' },
        error: null,
      })

      const result = await activarPeriodo('p-1')

      expect(supabase.rpc).toHaveBeenCalledWith('fn_activar_periodo', { p_periodo_id: 'p-1' })
      // La activación NO debe tocar la tabla directamente: dos updates separados
      // dejaban el sistema sin período activo si el segundo fallaba.
      expect(supabase.from).not.toHaveBeenCalled()
      expect(result.ok).toBe(true)
    })

    it('propaga el error de la RPC en vez de fallar en silencio', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'No se puede activar un periodo cerrado: Semestre 2026-I' },
      })

      await expect(activarPeriodo('p-1')).rejects.toThrow(/periodo cerrado/i)
    })
  })

  describe('obtenerAuditoriaCierrePeriodo', () => {
    it('debe calcular el cumplimiento global y desglose por maestro correctamente', async () => {
      const mockPeriodo = { id: 'p-1', nombre: 'Primer Semestre 2026', fecha_inicio: '2026-01-15', fecha_fin: '2026-07-15' }
      const mockSesiones = [
        { id: 's-1', fecha: '2026-02-01', borrador: false, estado: 'registrada', maestro_id: 'm-1', asistencia: [{ id: 1 }] },
        { id: 's-2', fecha: '2026-02-08', borrador: true, estado: 'pendiente', maestro_id: 'm-1', asistencia: [] },
      ]
      const mockMaestros = [{ id: 'm-1', nombre: 'Juan', apellido: 'Pérez', email: 'juan@test.com' }]
      const mockAlumnos = [{ id: 'a-1', estado: 'activo' }, { id: 'a-2', estado: 'activo' }]

      supabase.from.mockImplementation((tabla) => {
        const chain = mockChain()
        if (tabla === 'periodos') {
          chain.single.mockResolvedValue({ data: mockPeriodo, error: null })
        } else if (tabla === 'sesiones_clase') {
          chain.lte.mockResolvedValue({ data: mockSesiones, error: null })
        } else if (tabla === 'maestros') {
          chain.select.mockResolvedValue({ data: mockMaestros, error: null })
        } else if (tabla === 'alumnos') {
          chain.select.mockResolvedValue({ data: mockAlumnos, error: null })
        }
        return chain
      })

      const { obtenerAuditoriaCierrePeriodo } = await import('../periodosApi.js')
      const audit = await obtenerAuditoriaCierrePeriodo('p-1')

      expect(audit.periodo).toEqual(mockPeriodo)
      expect(audit.totalSesiones).toBe(2)
      expect(audit.totalCompletadas).toBe(1)
      expect(audit.totalPendientes).toBe(1)
      expect(audit.porcentajeGlobal).toBe(50)
      expect(audit.maestros).toHaveLength(1)
      expect(audit.maestros[0].nombre).toBe('Juan Pérez')
      expect(audit.maestros[0].porcentajeCumplimiento).toBe(50)
    })
  })

  describe('eliminarPeriodo', () => {
    it('traduce el error de permisos de RLS a un mensaje accionable', async () => {
      const chain = mockChain()
      chain.eq.mockResolvedValue({ error: { code: '42501', message: 'permission denied' } })
      supabase.from.mockReturnValue(chain)

      await expect(eliminarPeriodo('p-1')).rejects.toThrow(/permisos/i)
    })
  })
})

/**
 * Nota sobre una prueba retirada.
 *
 * Existía aquí un test llamado "Flujo Completo de Aislamiento de Datos" que, tras
 * llamar a `activarPeriodo`, hacía `clases2025.filter(c => c.periodo_id === 'p-2026')`
 * sobre arreglos declarados en el propio test y afirmaba que el resultado era vacío.
 *
 * Eso no probaba el aislamiento por período: probaba que Array.prototype.filter
 * funciona. Y era activamente dañino, porque su nombre daba por verificada una
 * funcionalidad que NO existe — en producción `asistencias.periodo_id` está poblada
 * en 0 de 280 filas y `progresos.periodo_id` en 0 de 192. No hay filtro por período
 * que aislar.
 *
 * Un test que afirma lo que no comprueba es peor que la ausencia de test: convierte
 * una brecha conocida en una garantía falsa. Se retiró en lugar de maquillarlo.
 * Cuando el aislamiento se implemente de verdad, la prueba correspondiente debe
 * ejercitar la consulta real contra la base, no un arreglo local.
 */
