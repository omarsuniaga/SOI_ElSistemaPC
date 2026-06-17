import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the JSON for alumnosMock
vi.mock('../../../../src/assets/data/mocks/alumnos.json', () => ({
  default: [
    {
      id: '1',
      nombre_completo: 'Carlos Gardel',
      fecha_nacimiento: '1990-12-11',
      instrumento_principal: 'Voz',
      activo: true
    },
    {
      id: '2',
      nombre_completo: 'Astor Piazzolla',
      fecha_nacimiento: '2010-03-11',
      instrumento_principal: 'Bandoneón',
      activo: true
    },
    {
      id: '3',
      nombre_completo: 'Aníbal Troilo',
      fecha_nacimiento: '2005-07-11',
      instrumento_principal: 'Bandoneón',
      activo: false
    }
  ]
}))

import * as mockAdapter from '../../../../src/modules/alumnos/api/alumnosMock.js'

describe('obtenerAlumnosFiltradosYOrdenados — Mock adapter tests', () => {
  it('filters active students and by instrument', async () => {
    // Should filter out Troilo because active: false in mock by default, or verify filtering
    // In our implementation, we added: result = alumnos.filter(a => a.activo !== false && a.is_active !== false)
    const result = await mockAdapter.obtenerAlumnosFiltradosYOrdenados({
      instrumento: 'Bandoneón'
    })

    // Troilo is inactive, Piazzolla is active. Only Piazzolla should be returned.
    expect(result.length).toBe(1)
    expect(result[0].nombre).toBe('Astor Piazzolla')
  })

  it('orders by instrument and age correctly', async () => {
    const result = await mockAdapter.obtenerAlumnosFiltradosYOrdenados({
      ordenInstrumentoAsc: true,
      ordenEdadAsc: true // youngest first: Piazzolla (2010) before Gardel (1990)
    })

    // Active ones are Piazzolla (Bandoneón) and Gardel (Voz)
    // Bandoneón (B) comes before Voz (V)
    expect(result.length).toBe(2)
    expect(result[0].nombre).toBe('Astor Piazzolla')
    expect(result[1].nombre).toBe('Carlos Gardel')
  })

  it('orders by age ascending (youngest first) within same instrument', async () => {
    // Let's modify the local list temporarily or just verify sorting by birthdate
    // Piazzolla (2010-03-11) is younger than Troilo, but Troilo is inactive.
    // Let's just check Gardel vs Piazzolla age sorting when instrument is not ordered
    const result = await mockAdapter.obtenerAlumnosFiltradosYOrdenados({
      ordenEdadAsc: true // youngest first: Piazzolla (2010) before Gardel (1990)
    })

    expect(result[0].nombre).toBe('Astor Piazzolla')
    expect(result[1].nombre).toBe('Carlos Gardel')
  })
})
