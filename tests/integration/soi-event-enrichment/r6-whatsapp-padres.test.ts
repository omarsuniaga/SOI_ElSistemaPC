/**
 * Integration Test: Rule R6 — WhatsApp Proactivo a Padres (Phase 4A)
 *
 * Tests:
 * 1. Happy path: queues WhatsApp message and emits audit event in soi_eventos.
 * 2. 48-hour Cooldown Guard: skips if an event was already emitted within 48 hours.
 * 3. Disabled Rule Guard: skips if enabled=false in hermes_reactive_rules.
 * 4. Missing Phone Guard: skips if alumno has no phone without error.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleWhatsAppPadresAusencias } from '../../../supabase/functions/event-spine-logger/handlers/r6-whatsapp-padres.ts'
import { SoiEvento } from '../../../supabase/functions/event-spine-logger/types.ts'

describe('Rule R6 — WhatsApp Proactivo a Padres (Phase 4A)', () => {
  let mockSupabase: any
  let mockQueueInsert: any
  let mockSoiEventosInsert: any
  let mockEvento: SoiEvento

  beforeEach(() => {
    mockQueueInsert = vi.fn().mockResolvedValue({ error: null })
    mockSoiEventosInsert = vi.fn().mockResolvedValue({ error: null })

    mockEvento = {
      id: 'evt-123',
      tipo: 'asistencia.falta_injustificada',
      origen_tabla: 'asistencias',
      origen_id: 'asist-1',
      payload: { alumno_id: 'alum-456' },
      correlation_id: 'corr-789',
      created_at: new Date().toISOString(),
      procesado: false,
    }
  })

  it('should enqueue WhatsApp message and record audit event when R6 is active and no recent alert exists', async () => {
    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'hermes_reactive_rules') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                enabled: true,
                conditions_json: { cooldown_hours: 48 },
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
        if (table === 'alumnos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'alum-456',
                nombre: 'Carlos',
                apellido: 'Perez',
                familiar_telefono: '18295551234',
              },
              error: null,
            }),
          }
        }
        if (table === 'hermes_whatsapp_queue') {
          return {
            insert: mockQueueInsert,
          }
        }
        return {}
      }),
    }

    const result = await handleWhatsAppPadresAusencias('alum-456', 3, mockEvento, mockSupabase)

    expect(result.sent).toBe(true)
    expect(result.phone).toBe('18295551234')
    expect(mockQueueInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        jid: '18295551234',
        estado: 'pendiente',
      })
    )
    expect(mockSoiEventosInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'notificacion.whatsapp_padres',
        origen_id: 'alum-456',
        procesado: true,
      })
    )
  })

  it('should skip sending if a notification was already sent within 48 hours (Cooldown Guard)', async () => {
    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'hermes_reactive_rules') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { enabled: true, conditions_json: { cooldown_hours: 48 } },
              error: null,
            }),
          }
        }
        if (table === 'soi_eventos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [{ id: 'evt-prev-whatsapp' }], // Recent alert found!
              error: null,
            }),
          }
        }
        return {}
      }),
    }

    const result = await handleWhatsAppPadresAusencias('alum-456', 3, mockEvento, mockSupabase)

    expect(result.sent).toBe(false)
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('cooldown_48h')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should skip sending if rule R6 is disabled in hermes_reactive_rules', async () => {
    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'hermes_reactive_rules') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { enabled: false }, // Rule disabled
              error: null,
            }),
          }
        }
        return {}
      }),
    }

    const result = await handleWhatsAppPadresAusencias('alum-456', 3, mockEvento, mockSupabase)

    expect(result.sent).toBe(false)
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('rule_disabled')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })

  it('should skip gracefully if alumno has no phone registered', async () => {
    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'hermes_reactive_rules') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { enabled: true },
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
          }
        }
        if (table === 'alumnos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'alum-456',
                nombre: 'Carlos',
                apellido: 'Perez',
                familiar_telefono: null,
                contacto_emergencia_telefono: '',
                tlf_alumno: null,
              },
              error: null,
            }),
          }
        }
        return {}
      }),
    }

    const result = await handleWhatsAppPadresAusencias('alum-456', 3, mockEvento, mockSupabase)

    expect(result.sent).toBe(false)
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('no_phone')
    expect(mockQueueInsert).not.toHaveBeenCalled()
  })
})
