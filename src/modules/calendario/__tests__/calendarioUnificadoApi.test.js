import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  obtenerEventosCalendario,
  crearEventoInstitucional,
  actualizarEventoInstitucional,
  eliminarEventoInstitucional,
  generarArchivoICS,
  generarGoogleCalendarUrl,
  generarUrlSuscripcionGoogle,
  EVENT_CATEGORIAS,
  DEPARTAMENTOS_SOI,
} from '../api/calendarioUnificadoApi.js'

// Mock supabase client
vi.mock('../../../lib/supabaseClient.js', () => {
  const mockFrom = vi.fn()
  return {
    supabase: {
      from: mockFrom,
    },
  }
})

import { supabase } from '../../../lib/supabaseClient.js'

describe('calendarioUnificadoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports semantic categories and department lists', () => {
    expect(EVENT_CATEGORIAS).toHaveProperty('concierto')
    expect(EVENT_CATEGORIAS).toHaveProperty('academico')
    expect(EVENT_CATEGORIAS).toHaveProperty('administrativo')
    expect(EVENT_CATEGORIAS).toHaveProperty('pago')
    expect(DEPARTAMENTOS_SOI.length).toBeGreaterThan(5)
  })

  it('obtains institutional events correctly formatted for FullCalendar', async () => {
    const mockEventsRaw = [
      {
        id: 'evt-1',
        titulo: 'Concierto de Gala 2026',
        descripcion: 'Presentación de la Orquesta Sinfónica',
        categoria: 'concierto',
        fecha_inicio: '2026-09-15T19:00:00Z',
        fecha_fin: '2026-09-15T21:00:00Z',
        ubicacion: 'Teatro Nacional',
        departamento_responsable: 'ACM',
      },
    ]

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve) => resolve({ data: mockEventsRaw, error: null }),
    }

    supabase.from.mockImplementation((table) => {
      if (table === 'calendario_institucional') {
        return selectChain
      }
      if (table === 'clase_horarios') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
    })

    const eventos = await obtenerEventosCalendario({
      start: '2026-09-01',
      end: '2026-09-30',
      categoria: 'todas',
      departamento: 'TODOS',
      incluirClases: false,
    })

    expect(eventos).toHaveLength(1)
    expect(eventos[0]).toMatchObject({
      id: 'inst-evt-1',
      title: 'Concierto de Gala 2026',
      start: '2026-09-15T19:00:00Z',
      backgroundColor: EVENT_CATEGORIAS.concierto.color,
    })
    expect(eventos[0].extendedProps).toMatchObject({
      tipoOrigen: 'institucional',
      categoria: 'concierto',
      departamento: 'ACM',
      ubicacion: 'Teatro Nacional',
    })
  })

  it('filters events by search query text', async () => {
    const mockEventsRaw = [
      {
        id: 'evt-1',
        titulo: 'Reunión de Dirección',
        descripcion: 'Planificación 2027',
        categoria: 'reunion',
        fecha_inicio: '2026-09-10T10:00:00Z',
        fecha_fin: '2026-09-10T12:00:00Z',
      },
      {
        id: 'evt-2',
        titulo: 'Auditoría Administrativa',
        descripcion: 'Inventario de Instrumentos',
        categoria: 'auditoria',
        fecha_inicio: '2026-09-12T10:00:00Z',
        fecha_fin: '2026-09-12T12:00:00Z',
      },
    ]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      then: (resolve) => resolve({ data: mockEventsRaw, error: null }),
    })

    const filtered = await obtenerEventosCalendario({
      start: '2026-09-01',
      end: '2026-09-30',
      search: 'Auditoría',
      incluirClases: false,
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('Auditoría Administrativa')
  })

  it('generates a valid RFC-5545 iCalendar (.ics) string', () => {
    const sampleEvents = [
      {
        id: 'inst-test-1',
        rawId: 'test-1',
        title: 'Festival Musical',
        start: '2026-10-01T14:00:00.000Z',
        end: '2026-10-01T18:00:00.000Z',
        extendedProps: {
          tipoOrigen: 'institucional',
          descripcion: 'Festival anual de música',
          ubicacion: 'Punta Cana Village',
        },
      },
    ]

    const ics = generarArchivoICS(sampleEvents)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('SUMMARY:Festival Musical')
    expect(ics).toContain('LOCATION:Punta Cana Village')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('generates a direct 1-Click Google Calendar template intent URL', () => {
    const sampleEvent = {
      title: 'Gala Sinfónica 2026',
      start: '2026-11-20T20:00:00.000Z',
      end: '2026-11-20T22:30:00.000Z',
      allDay: false,
      extendedProps: {
        categoriaLabel: 'Concierto / Presentación',
        departamento: 'ACM',
        descripcion: 'Repertorio Tchaikovsky',
        ubicacion: 'Gran Teatro Punta Cana',
      },
    }

    const url = generarGoogleCalendarUrl(sampleEvent)
    expect(url).toContain('https://calendar.google.com/calendar/render')
    expect(url).toContain('action=TEMPLATE')
    expect(url).toContain('text=Gala+Sinf%C3%B3nica+2026')
    expect(url).toContain('location=Gran+Teatro+Punta+Cana')
  })

  it('generates webcal subscription link for Google Calendar', () => {
    const subUrl = generarUrlSuscripcionGoogle('https://soi.elsistema.org/api/calendario/feed.ics')
    expect(subUrl).toContain('https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fsoi.elsistema.org')
  })
})
