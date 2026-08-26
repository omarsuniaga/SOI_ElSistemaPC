/**
 * Integration Test: Rule R7 — WhatsApp a Maestros por Asistencia Pendiente
 *
 * Tests:
 * 1. Happy path: encola pendiente_aprobacion y crea tarea ACM (comportamiento por defecto).
 * 2. Kill switch global (system_config.whatsapp_ingest_enabled=false).
 * 3. Disabled Rule Guard.
 * 4. Missing Phone Guard.
 * 5. Opt-Out Guard.
 * 6. Bypass con requiere_aprobacion=false.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleWhatsAppMaestroAsistenciaPendiente } from '../../../supabase/functions/event-spine-logger/handlers/r7-whatsapp-maestros.ts'
import { SoiEvento } from '../../../supabase/functions/event-spine-logger/types.ts'

describe('Rule R7 — WhatsApp a Maestros por Asistencia Pendiente', () => {
  let mockSupabase: any
  let mockQueueInsert: any
  let mockSoiEventosInsert: any
  let mockEvento: SoiEvento

  beforeEach(() => {
    mockQueueInsert = vi.fn().mockResolvedValue({ error: null })
    mockSoiEventosInsert = vi.fn().mockResolvedValue({ error: null })

    mockEvento = {
      id: 'evt-r7-1',
      tipo: 'sesion.creada',
      entidad_tipo: 'sesiones_clase',
      entidad_id: 'sesion-1',
      payload: { sesion_id: 'sesion-1', maestro_id: 'maestro-1' },
      correlation_id: 'corr-r7-1',
      created_at: new Date().toISOString(),
      procesado: false,
    }
  })

  function baseMock(overrides: Record<string, any> = {}) {
    return {
      from: vi.fn((table: string) => {
        if (overrides[table]) return overrides[table]
        if (table === 'system_config') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { value: 'true' }, error: null }),
          }
        }
        if (table === 'hermes_reactive_rules') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { enabled: true, conditions_json: { cooldown_hours: 24 } },
              error: null,
            }),
          }
        }
        if (table === 'soi_eventos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            insert: mockSoiEventosInsert,
          }
        }
        if (table === 'maestros') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'maestro-1', nombre_completo: 'Omar Suniaga', tlf: '18095551234' },
              error: null,
            }),
          }
        }
        if (table === 'whatsapp_optout') {
          return {
            select: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        if (table === 'hermes_whatsapp_queue') {
          return {
            insert: (...args: unknown[]) => {
              mockQueueInsert(...args)
              return {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: 'wa-queue-r7' }, error: null }),
              }
            },
          }
        }
        if (table === 'tareas_institucionales') {
          return { insert: vi.fn().mockResolvedValue({ error: null }) }
        }
        return {}
      }),
    }
  }

  it('should enqueue pendiente_aprobacion and create ACM task by default', async () => {
    mockSupabase = baseMock()
    const result = await handleWhatsAppMaestroAsistenciaPendiente('maestro-1', 'sesion-1', '2026-08-19', mockEvento, mockSupabase)

    expect(result.sent).toBe(true)
    expect(result.phone).toBe('18095551234')
    expect(mockQueueInsert).toHaveBeenCalledWith(
      expect.objectContaining({ jid: '18095551234', estado: 'pendiente_aprobacion' })
    )
    expect(mockSoiEventosInsert).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'notificacion.whatsapp_maestro', entidad_tipo: 'maestros', entidad_id: 'maestro-1' })
    )
  })

  it('should skip when whatsapp_ingest_enabled=false (kill switch)', async () => {
    mockSupabase = baseMock({
      system_config: {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { value: 'false' }, error: null }),
      },
    })
    const result = await handleWhatsAppMaestroAsistenciaPendiente('maestro-1', 'sesion-1', '2026-08-19', mockEvento, mockSupabase)
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('whatsapp_ingest_disabled')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should skip when rule R7 is disabled', async () => {
    mockSupabase = baseMock({
      hermes_reactive_rules: {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { enabled: false }, error: null }),
      },
    })
    const result = await handleWhatsAppMaestroAsistenciaPendiente('maestro-1', 'sesion-1', '2026-08-19', mockEvento, mockSupabase)
    expect(result.reason).toBe('rule_disabled')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should skip gracefully when maestro has no phone', async () => {
    mockSupabase = baseMock({
      maestros: {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'maestro-1', nombre_completo: 'Omar Suniaga', tlf: null }, error: null }),
      },
    })
    const result = await handleWhatsAppMaestroAsistenciaPendiente('maestro-1', 'sesion-1', '2026-08-19', mockEvento, mockSupabase)
    expect(result.reason).toBe('no_phone')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should skip when maestro phone is in whatsapp_optout', async () => {
    mockSupabase = baseMock({
      whatsapp_optout: {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { jid: '18095551234@s.whatsapp.net' }, error: null }),
      },
    })
    const result = await handleWhatsAppMaestroAsistenciaPendiente('maestro-1', 'sesion-1', '2026-08-19', mockEvento, mockSupabase)
    expect(result.reason).toBe('optout')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should enqueue directly as pendiente when requiere_aprobacion=false', async () => {
    mockSupabase = baseMock({
      hermes_reactive_rules: {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { enabled: true, conditions_json: { cooldown_hours: 24, requiere_aprobacion: false } },
          error: null,
        }),
      },
    })
    const result = await handleWhatsAppMaestroAsistenciaPendiente('maestro-1', 'sesion-1', '2026-08-19', mockEvento, mockSupabase)
    expect(result.sent).toBe(true)
    expect(mockQueueInsert).toHaveBeenCalledWith(
      expect.objectContaining({ jid: '18095551234', estado: 'pendiente' })
    )
  })
})
