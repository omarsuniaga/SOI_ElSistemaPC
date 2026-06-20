import { describe, it, expect } from 'vitest'

describe('alumnosMock hoisting', () => {
  it('importing alumnosMock does not throw ReferenceError', async () => {
    await expect(async () => {
      await import('../api/alumnosMock.js')
    }).not.toThrow()
  })

  it('obtenerAlumnos returns { alumnos, total } shape with normalized data', async () => {
    const mod = await import('../api/alumnosMock.js')
    const result = await mod.obtenerAlumnos()
    // D01: new return shape is { alumnos, total }
    expect(result).toHaveProperty('alumnos')
    expect(result).toHaveProperty('total')
    expect(Array.isArray(result.alumnos)).toBe(true)
    expect(result.alumnos.length).toBeGreaterThan(0)
    // Verify normalization ran
    expect(result.alumnos[0]).toHaveProperty('nombre')
    expect(result.alumnos[0]).toHaveProperty('clases')
  })
})
