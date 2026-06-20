/**
 * postuladosMock.test.js
 * B08: buscarPostulante function added to postuladosMock.js
 */
import { describe, it, expect } from 'vitest'
import { buscarPostulante, data as mockData } from '../api/postuladosMock.js'

describe('B08 — postuladosMock.buscarPostulante', () => {
  it('is exported from postuladosMock', () => {
    expect(typeof buscarPostulante).toBe('function')
  })

  it('returns an array (Promise)', async () => {
    const results = await buscarPostulante('')
    expect(Array.isArray(results)).toBe(true)
  })

  it('returns empty array for no match', async () => {
    const results = await buscarPostulante('zzzznoexiste_xyz_987')
    expect(results).toHaveLength(0)
  })

  it('does not throw TypeError', async () => {
    await expect(buscarPostulante('test')).resolves.toBeDefined()
  })

  it('returns filtered results matching nombre_completo', async () => {
    // Use the first postulante from mock data to test filtering
    if (mockData.length === 0) {
      // Empty dataset — just verify the function works
      const results = await buscarPostulante('test')
      expect(Array.isArray(results)).toBe(true)
      return
    }

    const firstPostulante = mockData[0]
    const nameFragment = firstPostulante.nombre_completo?.slice(0, 4)?.toLowerCase()
    if (!nameFragment) return

    const results = await buscarPostulante(nameFragment)
    expect(results.length).toBeGreaterThan(0)
    results.forEach(r => {
      const matchesName = (r.nombre_completo || '').toLowerCase().includes(nameFragment)
      const matchesEmail = (r.correo || r.email || '').toLowerCase().includes(nameFragment)
      expect(matchesName || matchesEmail).toBe(true)
    })
  })

  it('returns all postulantes for empty query', async () => {
    const all = await buscarPostulante('')
    expect(all.length).toBe(mockData.length)
  })

  it('search is case-insensitive', async () => {
    if (mockData.length === 0) return

    const firstName = mockData[0].nombre_completo?.split(' ')[0]
    if (!firstName) return

    const upper = await buscarPostulante(firstName.toUpperCase())
    const lower = await buscarPostulante(firstName.toLowerCase())
    expect(upper.length).toBe(lower.length)
  })
})
