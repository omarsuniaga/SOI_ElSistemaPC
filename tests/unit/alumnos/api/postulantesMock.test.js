import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../../src/assets/data/mocks/postulantes.json', () => ({
  default: [
    {
      id: 'test-001',
      nombre_completo: 'Marcos Merone Cocco',
      fecha_nacimiento: '2015-08-30',
      telefono_alumno: '8295577722',
      correo: 'test@example.com',
      nacionalidad: 'Dominicana',
      sector_calle_numero: 'Av. Real Norte',
      madre_nombre: 'Elisabetta Cocco',
      madre_tlf_whatsapp: '8295577722',
      padre_nombre: 'Esnor Merone',
      padre_tlf_whatsapp: '',
      representante_parentesco: 'ambos',
      acepta_pago_600: true,
      autoriza_fotos_redes: true,
    },
    {
      id: 'test-002',
      nombre_completo: 'María José López',
      fecha_nacimiento: '2014-06-10',
      telefono_alumno: '8493334455',
      correo: 'maria@example.com',
      nacionalidad: 'Dominicana',
      sector_calle_numero: 'Calle Principal #12',
      madre_nombre: 'Sofía López',
      madre_tlf_whatsapp: '8493334455',
      padre_nombre: 'Carlos López',
      padre_tlf_whatsapp: '8493334456',
      representante_parentesco: 'ambos',
      acepta_pago_600: true,
      autoriza_fotos_redes: true,
    },
    {
      id: 'test-003',
      nombre_completo: 'Luis Gómez Rodríguez',
      fecha_nacimiento: '2016-11-22',
      telefono_alumno: '8297778899',
      correo: 'luis@example.com',
      nacionalidad: 'Venezolana',
      sector_calle_numero: 'Residencial PC',
      madre_nombre: 'Carmen Rodríguez',
      madre_tlf_whatsapp: '8297778899',
      padre_nombre: 'Pedro Gómez',
      padre_tlf_whatsapp: '',
      representante_parentesco: 'madre',
      acepta_pago_600: false,
      autoriza_fotos_redes: true,
    },
  ],
}))

import * as mock from '../../../../src/modules/alumnos/api/postulantesMock.js'

describe('postulantesMock — buscarPostulante', () => {
  it('finds by partial name (case-insensitive, accent-insensitive)', async () => {
    const results = await mock.buscarPostulante('marcos')
    expect(results).toHaveLength(1)
    expect(results[0].nombre_completo).toBe('Marcos Merone Cocco')
  })

  it('finds by partial name ignoring accents', async () => {
    const results = await mock.buscarPostulante('maria jose')
    expect(results).toHaveLength(1)
    expect(results[0].nombre_completo).toBe('María José López')
  })

  it('finds by phone number', async () => {
    const results = await mock.buscarPostulante('8295577722')
    expect(results).toHaveLength(1)
  })

  it('finds by partial phone match', async () => {
    const results = await mock.buscarPostulante('849333')
    expect(results).toHaveLength(1)
    expect(results[0].nombre_completo).toBe('María José López')
  })

  it('returns empty array when no match', async () => {
    const results = await mock.buscarPostulante('xyz no existe')
    expect(results).toHaveLength(0)
  })

  it('returns empty array for queries shorter than 2 chars', async () => {
    const results = await mock.buscarPostulante('M')
    expect(results).toHaveLength(0)
  })

  it('returns multiple matches when several rows qualify', async () => {
    const results = await mock.buscarPostulante('mar')
    expect(results.length).toBeGreaterThanOrEqual(2)
  })

  it('returns flat postulante objects (no raw/draft wrapper)', async () => {
    const results = await mock.buscarPostulante('marcos')
    expect(results[0]).not.toHaveProperty('raw')
    expect(results[0]).not.toHaveProperty('draft')
    expect(results[0].nombre_completo).toBeTruthy()
    expect(results[0].id).toBeTruthy()
  })
})

describe('postulantesMock — obtenerPostulante', () => {
  it('returns a postulante by id', async () => {
    const result = await mock.obtenerPostulante('test-001')
    expect(result).not.toBeNull()
    expect(result.nombre_completo).toBe('Marcos Merone Cocco')
  })

  it('returns null for unknown id', async () => {
    const result = await mock.obtenerPostulante('unknown')
    expect(result).toBeNull()
  })
})

describe('postulantesMock — listarPostulantes', () => {
  it('returns all postulantes', async () => {
    const results = await mock.listarPostulantes()
    expect(results).toHaveLength(3)
  })
})
