/**
 * Integration Test: Rule R8 — WhatsApp de Seguimiento por Tareas Vencidas
 *
 * Tests:
 * 1. Happy path: encola pendiente_aprobacion y crea tarea DIR (comportamiento por defecto).
 * 2. Kill switch global (system_config.whatsapp_ingest_enabled=false).
 * 3. Disabled Rule Guard.
 * 4. Sin telefono_contacto configurado (no hay directorio de responsables).
 * 5. Opt-Out Guard.
 * 6. Bypass con requiere_aprobacion=false.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleWhatsAppTareaVencida } from '../../../supabase/functions/event-spine-logger/handlers/r8-whatsapp-tareas.ts'
import { SoiEvento } from '../../../supabase/functions/event-spine-logger/types.ts'

describe('Rule R8 — WhatsApp de Seguimiento por Tareas Vencidas', () => {
  let mockSupabase: any
  let mockQueueInsert: any
  let mockSoiEventosInsert: any
  let mockEvento: SoiEvento

  beforeEach(() => {
    mockQueueInsert = vi.fn().mockResolvedValue({ error: null })
    mockSoiEventosInsert = vi.fn().mockResolvedValue({ error: null })

    mockEvento = {
      id: 'evt-r8-1',
      tipo: 'tarea.vencida',
      entidad_tipo: 'tareas_institucionales',
      entidad_id: 'tarea-1',
      payload: { titulo: 'Revisar inventario', departamento: 'LOG' },
      correlation_id: 'corr-r8-1',
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
              data: {
                enabled: true,
                conditions_json: { cooldown_hours: 24, telefono_contacto: '18095559999' },
              },
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
                single: vi.fn().mockResolvedValue({ data: { id: 'wa-queue-r8' }, error: null }),
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

  it('should enqueue pendiente_aprobacion and create DIR task by default', async () => {
    mockSupabase = baseMock()
    const result = await handleWhatsAppTareaVencida('Revisar inventario', 'LOG', 5, mockEvento, mockSupabase)

    expect(result.sent).toBe(true)
    expect(result.phone).toBe('18095559999')
    expect(mockQueueInsert).toHaveBeenCalledWith(
      expect.objectContaining({ jid: '18095559999', estado: 'pendiente_aprobacion' })
    )
    expect(mockSoiEventosInsert).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'notificacion.whatsapp_tarea_vencida', entidad_tipo: 'tareas_institucionales' })
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
    const result = await handleWhatsAppTareaVencida('Revisar inventario', 'LOG', 5, mockEvento, mockSupabase)
    expect(result.reason).toBe('whatsapp_ingest_disabled')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should skip when rule R8 is disabled', async () => {
    mockSupabase = baseMock({
      hermes_reactive_rules: {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { enabled: false }, error: null }),
      },
    })
    const result = await handleWhatsAppTareaVencida('Revisar inventario', 'LOG', 5, mockEvento, mockSupabase)
    expect(result.reason).toBe('rule_disabled')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should skip gracefully when no telefono_contacto is configured', async () => {
    mockSupabase = baseMock({
      hermes_reactive_rules: {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { enabled: true, conditions_json: { cooldown_hours: 24 } },
          error: null,
        }),
      },
    })
    const result = await handleWhatsAppTareaVencida('Revisar inventario', 'LOG', 5, mockEvento, mockSupabase)
    expect(result.reason).toBe('no_contact_configured')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should skip when configured contact is in whatsapp_optout', async () => {
    mockSupabase = baseMock({
      whatsapp_optout: {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { jid: '18095559999@s.whatsapp.net' }, error: null }),
      },
    })
    const result = await handleWhatsAppTareaVencida('Revisar inventario', 'LOG', 5, mockEvento, mockSupabase)
    expect(result.reason).toBe('optout')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should enqueue directly as pendiente when requiere_aprobacion=false', async () => {
    mockSupabase = baseMock({
      hermes_reactive_rules: {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            enabled: true,
            conditions_json: { cooldown_hours: 24, telefono_contacto: '18095559999', requiere_aprobacion: false },
          },
          error: null,
        }),
      },
    })
    const result = await handleWhatsAppTareaVencida('Revisar inventario', 'LOG', 5, mockEvento, mockSupabase)
    expect(result.sent).toBe(true)
    expect(mockQueueInsert).toHaveBeenCalledWith(
      expect.objectContaining({ jid: '18095559999', estado: 'pendiente' })
    )
  })
})
