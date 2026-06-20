import { describe, it, expect } from 'vitest'

describe('alumnosMock hoisting', () => {
  it('importing alumnosMock does not throw ReferenceError', async () => {
    await expect(async () => {
      await import('../api/alumnosMock.js')
    }).not.toThrow()
  })

  it('obtenerAlumnos returns normalized data without error', async () => {
    const mod = await import('../api/alumnosMock.js')
    const alumnos = await mod.obtenerAlumnos()
    expect(Array.isArray(alumnos)).toBe(true)
    expect(alumnos.length).toBeGreaterThan(0)
    // Verify normalization ran
    expect(alumnos[0]).toHaveProperty('nombre')
    expect(alumnos[0]).toHaveProperty('clases')
  })
})
