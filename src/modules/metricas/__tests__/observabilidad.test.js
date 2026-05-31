import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as observabilidadSupabase from '../api/observabilidadSupabase.js'
import * as observabilidadMock from '../api/observabilidadMock.js'
import { supabase } from '../../../lib/supabaseClient.js'

// Mock de Supabase Client
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('Observabilidad & Logs DataAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Observabilidad Mock', () => {
    it('debe obtener logs del sistema de forma exitosa', async () => {
      const logs = await observabilidadMock.getSystemLogs()
      expect(logs).toBeInstanceOf(Array)
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0]).toHaveProperty('level')
      expect(logs[0]).toHaveProperty('message')
    })

    it('debe registrar logs en memoria', async () => {
      const initialLogs = await observabilidadMock.getSystemLogs()
      const initialLen = initialLogs.length

      await observabilidadMock.recordSystemLog({
        level: 'ERROR',
        module: 'TestModule',
        message: 'Mensaje de error de prueba',
      })

      const finalLogs = await observabilidadMock.getSystemLogs()
      expect(finalLogs.length).toBe(initialLen + 1)
      expect(finalLogs[0].level).toBe('ERROR')
      expect(finalLogs[0].module).toBe('TestModule')
      expect(finalLogs[0].message).toBe('Mensaje de error de prueba')
    })

    it('debe devolver registros de auditoria realistas', async () => {
      const audit = await observabilidadMock.getAuditLogs()
      expect(audit).toBeInstanceOf(Array)
      expect(audit.length).toBeGreaterThan(0)
      expect(audit[0]).toHaveProperty('accion')
      expect(audit[0]).toHaveProperty('actor_id')
    })
  })

  describe('Observabilidad Supabase (Producción)', () => {
    it('debe leer y persistir logs de sistema en localStorage localmente', async () => {
      const logs1 = await observabilidadSupabase.getSystemLogs()
      expect(logs1.length).toBe(1) // Initial loading log

      await observabilidadSupabase.recordSystemLog({
        level: 'WARNING',
        module: 'HTTP',
        message: 'Timeout de red',
      })

      const logs2 = await observabilidadSupabase.getSystemLogs()
      expect(logs2.length).toBe(2)
      expect(logs2[0].level).toBe('WARNING')
      expect(logs2[0].message).toBe('Timeout de red')
    })

    it('debe mapear transacciones de ausencias_auditoria correctamente', async () => {
      const mockDbData = [
        {
          id: 'uuid-1',
          ausencia_id: 'aus-1',
          actor_id: 'actor-1',
          accion: 'APROBACION_FINAL',
          notas: 'Aprobado correctamente',
          created_at: '2026-05-30T00:00:00Z',
        },
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockDbData, error: null }),
        }),
      })

      const audit = await observabilidadSupabase.getAuditLogs()
      expect(audit).toHaveLength(1)
      expect(audit[0].id).toBe('uuid-1')
      expect(audit[0].accion).toBe('APROBACION_FINAL')
      expect(audit[0].notas).toBe('Aprobado correctamente')
    })

    it('debe manejar errores de RLS o red con resiliencia y loguearlos', async () => {
      // Forzar que devuelva un error de permisos RLS
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'new row violates row-level security policy' },
          }),
        }),
      })

      const audit = await observabilidadSupabase.getAuditLogs()
      // Debe retornar una lista vacía de forma resiliente
      expect(audit).toEqual([])

      // Debe haber registrado el error RLS en el log local de la PWA
      const logs = await observabilidadSupabase.getSystemLogs()
      const hasRlsErrorLog = logs.some((l) => l.level === 'ERROR' && l.message.includes('RLS'))
      expect(hasRlsErrorLog).toBe(true)
    })
  })
})
