import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../../../lib/supabaseClient.js'
import { obtenerUsoSalones } from '../api/salonesApi.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('salonesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('obtenerUsoSalones', () => {
    it('fetches room usage in bulk and groups it by room', async () => {
      const horarios = [
        {
          id: 'h-1',
          salon_id: 'salon-1',
          clase_id: 'clase-1',
          dia: 'lunes',
          hora_inicio: '08:00',
          hora_fin: '09:00',
          clases: {
            id: 'clase-1',
            nombre: 'Piano Inicial',
            instrumento: 'Piano',
            maestro_principal_id: 'maestro-1',
          },
        },
        {
          id: 'h-2',
          salon_id: 'salon-2',
          clase_id: 'clase-2',
          dia: 'martes',
          hora_inicio: '10:00',
          hora_fin: '11:00',
          clases: {
            id: 'clase-2',
            nombre: 'Solfeo I',
            instrumento: 'Solfeo',
            maestro_principal_id: 'maestro-2',
          },
        },
      ]

      let horarioOrderCalls = 0
      const horariosQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn(() => {
          horarioOrderCalls += 1
          return horarioOrderCalls === 2
            ? Promise.resolve({ data: horarios, error: null })
            : horariosQuery
        }),
      }

      const maestrosQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { id: 'maestro-1', nombre_completo: 'Ana Rivera' },
            { id: 'maestro-2', nombre: 'Luis Pérez' },
          ],
          error: null,
        }),
      }

      supabase.from
        .mockReturnValueOnce(horariosQuery)
        .mockReturnValueOnce(maestrosQuery)

      const result = await obtenerUsoSalones(['salon-1', 'salon-2', 'salon-1'])

      expect(supabase.from).toHaveBeenNthCalledWith(1, 'clase_horarios')
      expect(horariosQuery.in).toHaveBeenCalledWith('salon_id', ['salon-1', 'salon-2'])
      expect(supabase.from).toHaveBeenNthCalledWith(2, 'maestros')
      expect(maestrosQuery.in).toHaveBeenCalledWith('id', ['maestro-1', 'maestro-2'])
      expect(result['salon-1']).toEqual([
        expect.objectContaining({
          clase_nombre: 'Piano Inicial',
          maestro_nombre: 'Ana Rivera',
          instrumento: 'Piano',
        }),
      ])
      expect(result['salon-2']).toEqual([
        expect.objectContaining({
          clase_nombre: 'Solfeo I',
          maestro_nombre: 'Luis Pérez',
        }),
      ])
    })

    it('skips queries when no room ids are provided', async () => {
      await expect(obtenerUsoSalones([])).resolves.toEqual({})
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })
})
