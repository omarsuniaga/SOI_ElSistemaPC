import { describe, it, expect, vi } from 'vitest'
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))
import { supabase } from '../../../lib/supabaseClient.js'
import { obtenerAlumnosFiltradosYOrdenados } from '../api/alumnosSupabase.js'

describe('instrument filter with multiple assignments', () => {
  it('matches an exact instrument token inside a combined field', async () => {
    const rows = [
      { id: '1', nombre_completo: 'Alumno Mixto', instrumento_principal: 'Clarinete, Coro Infantil', activo: true },
      { id: '2', nombre_completo: 'Ana', instrumento_principal: 'Clarinete bajo', activo: true },
    ]
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((key, value) => {
        if (key === 'instrumento_principal') query.rows = rows.filter(row => row[key] === value)
        return query
      }),
      rows,
      then(resolve) { return Promise.resolve({ data: this.rows, error: null }).then(resolve) },
    }
    supabase.from.mockReturnValue(query)
    const result = await obtenerAlumnosFiltradosYOrdenados({ instrumento: 'Clarinete' })
    expect(result.map(row => row.id)).toEqual(['1'])
    expect(query.eq).not.toHaveBeenCalledWith('instrumento_principal', 'Clarinete')
  })
})
