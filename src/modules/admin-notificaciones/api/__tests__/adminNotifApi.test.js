import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAdminFeed, fetchAdminPendingCount } from '../adminNotifApi.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

function createMockChain(resolvedValue) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled))
  }
  return chain
}

describe('adminNotifApi Proactive Engines', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchAdminFeed - Auto-Substitution Suggester', () => {
    it('should query and associate suggested active substitutes with the same instrument', async () => {
      // Mock para profiles (maestros activos)
      const mockProfiles = [
        { id: 'm2', nombre_completo: 'John Coltrane', email: 'john@jazz.com', instrumento: 'Saxofón' },
        { id: 'm3', nombre_completo: 'Miles Davis', email: 'miles@jazz.com', instrumento: 'Trompeta' }
      ]

      // Mock para ausencias
      const mockAusencias = [
        {
          id: 'a1',
          maestro_id: 'm1',
          tipo_ausencia: 'enfermedad',
          urgencia: 'alta',
          fecha_inicio: '2026-05-24',
          fecha_fin: '2026-05-24',
          estado: 'pendiente',
          motivo: 'Fiebre alta',
          created_at: '2026-05-24T10:00:00Z',
          maestros: { nombre_completo: 'Charlie Parker', correo: 'charlie@jazz.com', instrumento: 'Saxofón' }
        }
      ]

      // Configurar el mock de Supabase para responder a las diferentes tablas
      supabase.from.mockImplementation((table) => {
        if (table === 'ausencias_maestros') {
          return createMockChain({ data: mockAusencias, error: null })
        }
        if (table === 'profiles') {
          return createMockChain({ data: mockProfiles, error: null })
        }
        return createMockChain({ data: [], error: null })
      })

      const feed = await fetchAdminFeed()

      // Encontrar el evento de ausencia
      const ausenciaEvent = feed.find(e => e.source === 'ausencia')
      expect(ausenciaEvent).toBeDefined()
      expect(ausenciaEvent.maestroInstrumento).toBe('Saxofón')
      
      // Debe sugerir a John Coltrane (Saxofón) pero no a Miles Davis (Trompeta)
      expect(ausenciaEvent.suplentesSugeridos.length).toBe(1)
      expect(ausenciaEvent.suplentesSugeridos[0].nombre_completo).toBe('John Coltrane')
    })
  })

  describe('fetchAdminFeed - Early Warning Risk Engine', () => {
    it('should flag student with 3+ consecutive absences as "Riesgo de Deserción" (Alta)', async () => {
      // Mock de asistencias consecutivas ausentes
      const mockAsistencias = [
        { alumno_id: 's1', estado: 'A', fecha: '2026-05-24', alumnos: { nombre_completo: 'Jimi Hendrix' } },
        { alumno_id: 's1', estado: 'A', fecha: '2026-05-23', alumnos: { nombre_completo: 'Jimi Hendrix' } },
        { alumno_id: 's1', estado: 'A', fecha: '2026-05-22', alumnos: { nombre_completo: 'Jimi Hendrix' } }
      ]

      supabase.from.mockImplementation((table) => {
        if (table === 'asistencias') {
          return createMockChain({ data: mockAsistencias, error: null })
        }
        return createMockChain({ data: [], error: null })
      })

      const feed = await fetchAdminFeed()

      // Debe levantar una alerta de tipo riesgo con prioridad alta
      const riesgoEvent = feed.find(e => e.id.startsWith('riesgo-alumno-ausencias'))
      expect(riesgoEvent).toBeDefined()
      expect(riesgoEvent.priority).toBe('alta')
      expect(riesgoEvent.titulo).toContain('Riesgo de Deserción')
      expect(riesgoEvent.titulo).toContain('Jimi Hendrix')
    })

    it('should flag student with <70% attendance rate as "Bajo Compliance Académico" (Media)', async () => {
      // 1 presente, 3 ausentes = 25% asistencia
      const mockAsistencias = [
        { alumno_id: 's2', estado: 'P', fecha: '2026-05-24', alumnos: { nombre_completo: 'Eric Clapton' } },
        { alumno_id: 's2', estado: 'A', fecha: '2026-05-23', alumnos: { nombre_completo: 'Eric Clapton' } },
        { alumno_id: 's2', estado: 'A', fecha: '2026-05-22', alumnos: { nombre_completo: 'Eric Clapton' } },
        { alumno_id: 's2', estado: 'A', fecha: '2026-05-21', alumnos: { nombre_completo: 'Eric Clapton' } }
      ]

      supabase.from.mockImplementation((table) => {
        if (table === 'asistencias') {
          return createMockChain({ data: mockAsistencias, error: null })
        }
        return createMockChain({ data: [], error: null })
      })

      const feed = await fetchAdminFeed()

      // Debe levantar una alerta de baja asistencia con prioridad media
      const riesgoEvent = feed.find(e => e.id.startsWith('riesgo-alumno-rate'))
      expect(riesgoEvent).toBeDefined()
      expect(riesgoEvent.priority).toBe('media')
      expect(riesgoEvent.titulo).toContain('Bajo Compliance Académico')
      expect(riesgoEvent.titulo).toContain('Eric Clapton')
    })
  })

  describe('fetchAdminPendingCount', () => {
    it('should aggregate pending count from ausencias and profiles correctly', async () => {
      supabase.from.mockImplementation((table) => {
        return createMockChain({ count: 2, error: null })
      })

      const totalCount = await fetchAdminPendingCount()
      expect(totalCount).toBe(4) // 2 de ausencias + 2 de maestros pendientes = 4
    })
  })
})

