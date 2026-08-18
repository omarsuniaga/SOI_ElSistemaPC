import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
  sendWhatsAppAlert,
  sendWhatsAppReminder,
  checkExistingAlert,
  getNotificationStatus,
} from '../services/attendanceNotificationService.js'
import { supabase } from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('attendanceNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isValidWhatsAppNumber', () => {
    it('validates Venezuelan numbers in diverse formats', () => {
      expect(isValidWhatsAppNumber('+584141234567')).toBe(true)
      expect(isValidWhatsAppNumber('+584121234567')).toBe(true)
      expect(isValidWhatsAppNumber('+584241234567')).toBe(true)
      expect(isValidWhatsAppNumber('04141234567')).toBe(true)
      expect(isValidWhatsAppNumber('04161234567')).toBe(true)
      expect(isValidWhatsAppNumber('04241234567')).toBe(true)
      expect(isValidWhatsAppNumber('584141234567')).toBe(true)
    })

    it('rejects invalid or empty numbers', () => {
      expect(isValidWhatsAppNumber('')).toBe(false)
      expect(isValidWhatsAppNumber(null)).toBe(false)
      expect(isValidWhatsAppNumber('12345')).toBe(false)
      expect(isValidWhatsAppNumber('abcdefghijk')).toBe(false)
    })
  })

  describe('normalizeWhatsAppNumber', () => {
    it('normalizes local 0414 number to +58414', () => {
      expect(normalizeWhatsAppNumber('04141234567')).toBe('+584141234567')
      expect(normalizeWhatsAppNumber('584141234567')).toBe('+584141234567')
      expect(normalizeWhatsAppNumber('+584141234567')).toBe('+584141234567')
    })
  })

  describe('sendWhatsAppAlert & sendWhatsAppReminder', () => {
    it('rejects alerts with invalid phone numbers', async () => {
      await expect(
        sendWhatsAppAlert({
          recipient_phone: 'invalid',
          recipient_name: 'Juan Perez',
          message: 'Test message',
        })
      ).rejects.toThrow(/Número inválido/)
    })

    it('enqueues a valid WhatsApp alert successfully', async () => {
      // Mock duplicate check -> null
      const selectMock = vi.fn().mockReturnThis()
      const eqMock = vi.fn().mockReturnThis()
      const gtMock = vi.fn().mockReturnThis()
      const limitMock = vi.fn().mockResolvedValue({ data: [], error: null })
      const insertMock = vi.fn().mockReturnThis()
      const singleMock = vi.fn().mockResolvedValue({
        data: { id: 'notif-123', estado: 'pendiente' },
        error: null,
      })

      supabase.from.mockImplementation((table) => {
        if (table === 'notificaciones_asistencia') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    gt: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                  }),
                }),
              }),
              single: singleMock,
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: singleMock,
              }),
            }),
          }
        }
        return {}
      })

      const result = await sendWhatsAppAlert({
        recipient_phone: '+584141112233',
        recipient_name: 'Rosa Mendez',
        message: 'Aviso de inasistencia',
      })

      expect(result.success).toBe(true)
      expect(result.status).toBe('pendiente')
      expect(result.id).toBe('notif-123')
    })

    it('prevents duplicate pending alerts for the same recipient', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'notificaciones_asistencia') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    gt: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue({
                        data: [{ id: 'dup-1', created_at: new Date().toISOString() }],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        return {}
      })

      await expect(
        sendWhatsAppAlert({
          recipient_phone: '+584141112233',
          recipient_name: 'Rosa Mendez',
          message: 'Aviso de inasistencia 2',
        })
      ).rejects.toThrow(/Ya existe una alerta pendiente/)
    })

    it('enqueues teacher reminder with high priority', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: { id: 'remind-999', estado: 'pendiente' },
        error: null,
      })

      supabase.from.mockImplementation((table) => {
        if (table === 'notificaciones_asistencia') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    gt: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                  }),
                }),
              }),
              single: singleMock,
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: singleMock,
              }),
            }),
          }
        }
        return {}
      })

      const result = await sendWhatsAppReminder({
        recipient_phone: '+584129998877',
        recipient_name: 'Prof. Gomez',
        message: 'Por favor complete la asistencia de Violín 1',
      })

      expect(result.success).toBe(true)
      expect(result.status).toBe('pendiente')
      expect(result.id).toBe('remind-999')
    })
  })

  describe('getNotificationStatus', () => {
    it('returns recent notifications list from Supabase', async () => {
      const mockList = [
        { id: '1', tipo: 'alerta_asistencia_alumno', estado: 'pendiente' },
        { id: '2', tipo: 'recordatorio_asistencia_maestro', estado: 'enviado' },
      ]

      supabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockList, error: null }),
          }),
        }),
      }))

      const list = await getNotificationStatus(null, 10)
      expect(Array.isArray(list)).toBe(true)
      expect(list.length).toBe(2)
      expect(list[0].id).toBe('1')
    })
  })
})
