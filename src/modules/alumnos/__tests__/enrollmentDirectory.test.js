import { beforeEach, describe, expect, it, vi } from 'vitest'
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { rpc } }))
import { obtenerAlumnosParaInscripcion } from '../api/alumnosSupabase.js'

describe('minimal enrollment directory', () => {
  beforeEach(() => rpc.mockReset())
  it('loads all pages including students outside the teacher roster and without instrument', async () => {
    const page = Array.from({ length: 500 }, (_, i) => ({ id: String(i), nombre_completo: `Alumno ${i}` }))
    const external = { id: 'external', nombre_completo: 'Alumno Externo de Prueba', instrumento_principal: null }
    rpc.mockResolvedValueOnce({ data: page }).mockResolvedValueOnce({ data: [external] })
    const result = await obtenerAlumnosParaInscripcion()
    expect(result).toHaveLength(501)
    expect(result[500]).toEqual(external)
    expect(rpc).toHaveBeenNthCalledWith(2, 'obtener_alumnos_para_inscripcion', { p_offset: 500, p_limit: 500 })
  })
  it('propagates denied access instead of showing an empty directory', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: '42501' } })
    await expect(obtenerAlumnosParaInscripcion()).rejects.toThrow('catálogo de inscripción')
  })
})

describe('demo enrollment directory', () => {
  it('returns only the enrollment fields in demo mode', async () => {
    const demo = await import('../api/alumnosMock.js')
    const result = await demo.obtenerAlumnosParaInscripcion()
    expect(result.length).toBeGreaterThan(0)
    for (const alumno of result) {
      expect(Object.keys(alumno).sort()).toEqual(['activo', 'id', 'instrumento_principal', 'nombre_completo', 'sin_clase'])
      expect(alumno.activo).toBe(true)
    }
  })
})
